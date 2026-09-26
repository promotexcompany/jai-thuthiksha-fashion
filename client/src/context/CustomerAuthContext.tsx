import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

export interface CustomerUser {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN';
}

interface CustomerAuthContextType {
  isAuthenticated: boolean;
  customerUser: CustomerUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'jtf_customer_token';
const USER_KEY = 'jtf_customer_profile';

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const saved = localStorage.getItem(USER_KEY);
    if (!token || !saved) return false;
    try {
      const user = JSON.parse(saved);
      return Boolean(user && user.id);
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Validate session with backend API on mount
  useEffect(() => {
    const verifyCustomerSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsAuthenticated(false);
        setCustomerUser(null);
        setLoading(false);
        return;
      }

      try {
        const { user } = await api.getCustomerProfile();
        if (user && user.role === 'CUSTOMER') {
          setCustomerUser(user);
          setIsAuthenticated(true);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
          // Non-customer role or missing user profile
          logout();
        }
      } catch (err: any) {
        console.warn('Customer session validation error:', err.message);
        // If 401 or token invalid, clear customer session
        if (err.message?.includes('Authentication required') || err.message?.includes('Invalid') || err.message?.includes('expired') || err.message?.includes('no longer exists')) {
          logout();
        } else {
          // Network offline fallback to saved profile if valid
          const saved = localStorage.getItem(USER_KEY);
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              setCustomerUser(parsed);
              setIsAuthenticated(true);
            } catch {
              logout();
            }
          } else {
            logout();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    verifyCustomerSession();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const data = await api.login(email, pass);
      const { token, user } = data;

      if (!token || !user) {
        return { success: false, error: 'Invalid response from server.' };
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setCustomerUser(user);
      setIsAuthenticated(true);

      // Dispatch event for legacy listeners if any
      window.dispatchEvent(new Event('jtf-auth-changed'));

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Login failed. Please check your credentials.'
      };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const data = await api.register(name, email, pass);
      const { token, user } = data;

      if (token && user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        setCustomerUser(user);
        setIsAuthenticated(true);
        window.dispatchEvent(new Event('jtf-auth-changed'));
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Registration failed. Please try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setIsAuthenticated(false);
    setCustomerUser(null);
    window.dispatchEvent(new Event('jtf-auth-changed'));
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        isAuthenticated,
        customerUser,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
