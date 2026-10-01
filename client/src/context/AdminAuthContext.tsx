import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'CUSTOMER';
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  adminUser: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const TOKEN_KEY = 'jtf_admin_token';
const USER_KEY = 'jtf_admin_profile';

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const saved = localStorage.getItem(USER_KEY);
    if (!token || !saved) return false;
    try {
      const user = JSON.parse(saved);
      return user.role === 'ADMIN';
    } catch {
      return false;
    }
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Validate session on mount with backend API
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        setIsAuthenticated(false);
        setAdminUser(null);
        setLoading(false);
        return;
      }

      try {
        const { user } = await api.getProfile();
        if (user && user.role === 'ADMIN') {
          setAdminUser(user);
          setIsAuthenticated(true);
          localStorage.setItem(USER_KEY, JSON.stringify(user));
        } else {
          // Reject non-admin roles
          setIsAuthenticated(false);
          setAdminUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (_err) {
        // Fallback to cached valid session if offline
        const saved = localStorage.getItem(USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.role === 'ADMIN') {
            setIsAuthenticated(true);
            setAdminUser(parsed);
          }
        } else {
          setIsAuthenticated(false);
          setAdminUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const data = await api.login(email, pass);
      const { token, user } = data;

      // STRICT RBAC CHECK: Verify user role from backend response
      if (!user || user.role !== 'ADMIN') {
        return {
          success: false,
          error: '403 Forbidden: Access denied. Customer accounts cannot log in to Admin Control Center.'
        };
      }

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      setAdminUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Authentication failed. Please verify credentials.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, adminUser, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Custom hook to access admin authentication
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
