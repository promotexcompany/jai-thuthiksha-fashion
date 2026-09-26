const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getCustomerToken = () => {
  return localStorage.getItem('jtf_customer_token');
};

const getAdminToken = () => {
  return localStorage.getItem('jtf_admin_token');
};

const getCustomerHeaders = () => {
  const token = getCustomerToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const getAdminHeaders = () => {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const api = {
  // Authentication - Customer & Admin
  async register(name: string, email: string, pass: string) {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
    } catch (err) {
      throw new Error('Backend API server is unreachable. Please check server connection.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(email: string, pass: string) {
    let res: Response;
    try {
      res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
    } catch (err) {
      throw new Error('Backend API server is unreachable. Please check server connection.');
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile');
    return data;
  },

  async getCustomerProfile() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getCustomerHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to fetch customer profile');
    return data;
  },

  // Dresses
  async getPublicDresses() {
    try {
      const res = await fetch(`${API_BASE_URL}/dresses`);
      if (!res.ok) throw new Error('Failed to fetch dresses');
      return await res.json();
    } catch (err) {
      console.warn('Backend server unreachable for dresses', err);
      return null;
    }
  },

  async getAllAdminDresses() {
    const res = await fetch(`${API_BASE_URL}/dresses/admin/all`, {
      headers: getAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin dresses');
    return data;
  },

  async addDress(dressData: any) {
    const res = await fetch(`${API_BASE_URL}/dresses/admin/add`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(dressData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to add dress');
    return data;
  },

  async updateDress(id: string, dressData: any) {
    const res = await fetch(`${API_BASE_URL}/dresses/admin/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(dressData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update dress');
    return data;
  },

  async toggleDressStatus(id: string, updates: { isAvailable?: boolean; isHidden?: boolean }) {
    const res = await fetch(`${API_BASE_URL}/dresses/admin/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to toggle dress status');
    return data;
  },

  async deleteDress(id: string) {
    const res = await fetch(`${API_BASE_URL}/dresses/admin/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete dress');
    return data;
  },

  // Categories
  async getPublicCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    } catch (err) {
      console.warn('Backend server unreachable for categories', err);
      return null;
    }
  },

  async getAllAdminCategories() {
    const res = await fetch(`${API_BASE_URL}/categories/admin/all`, {
      headers: getAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin categories');
    return data;
  },

  async addCategory(catData: any) {
    const res = await fetch(`${API_BASE_URL}/categories/admin/add`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(catData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to add category');
    return data;
  },

  async updateCategory(id: string, catData: any) {
    const res = await fetch(`${API_BASE_URL}/categories/admin/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(catData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update category');
    return data;
  },

  async deleteCategory(id: string) {
    const res = await fetch(`${API_BASE_URL}/categories/admin/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete category');
    return data;
  },

  // Filters
  async getFilters() {
    try {
      const res = await fetch(`${API_BASE_URL}/filters`);
      if (!res.ok) throw new Error('Failed to fetch filters');
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async updateFilters(filterData: any) {
    const res = await fetch(`${API_BASE_URL}/filters/admin/update`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(filterData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update filters');
    return data;
  },

  // Bookings
  async logEnquiry(bookingData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/bookings/enquire`, {
        method: 'POST',
        headers: getCustomerHeaders(),
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to log booking enquiry to server', err);
      return null;
    }
  },

  async getAllAdminBookings() {
    const res = await fetch(`${API_BASE_URL}/bookings/admin/all`, {
      headers: getAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin bookings');
    return data;
  },

  async updateBooking(id: string, updates: any) {
    const res = await fetch(`${API_BASE_URL}/bookings/admin/${id}`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify(updates)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update booking');
    return data;
  },

  async deleteBooking(id: string) {
    const res = await fetch(`${API_BASE_URL}/bookings/admin/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete booking');
    return data;
  },

  // Settings
  async getSettings() {
    try {
      const res = await fetch(`${API_BASE_URL}/settings`);
      if (!res.ok) throw new Error('Failed to fetch settings');
      return await res.json();
    } catch (err) {
      return null;
    }
  },

  async updateSettings(settingsData: any) {
    const res = await fetch(`${API_BASE_URL}/settings/admin/update`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(settingsData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data;
  },

  // Upload Images
  async uploadImages(files: FileList | File[]) {
    const token = getAdminToken();
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    const res = await fetch(`${API_BASE_URL}/admin/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Image upload failed');
    return data; // { urls: [...] }
  }
};
