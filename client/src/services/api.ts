const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim();
  }

  // When running in production / on live deployment (non-localhost)
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '/api';
  }

  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

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

const getNoCacheUrl = (path: string) => {
  const url = `${API_BASE_URL}${path}`;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${Date.now()}`;
};

const getNoCacheHeaders = (extraHeaders: Record<string, string> = {}) => {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    ...extraHeaders
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
    const res = await fetch(getNoCacheUrl('/auth/me'), {
      cache: 'no-store',
      headers: getNoCacheHeaders(getAdminHeaders())
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to fetch user profile');
    return data;
  },

  async getCustomerProfile() {
    const res = await fetch(getNoCacheUrl('/auth/me'), {
      cache: 'no-store',
      headers: getNoCacheHeaders(getCustomerHeaders())
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to fetch customer profile');
    return data;
  },

  // Dresses
  async getPublicDresses() {
    try {
      const res = await fetch(getNoCacheUrl('/dresses'), {
        cache: 'no-store',
        headers: getNoCacheHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch dresses');
      return await res.json();
    } catch (err) {
      console.warn('Backend server unreachable for dresses', err);
      return null;
    }
  },

  async getAllAdminDresses() {
    const res = await fetch(getNoCacheUrl('/dresses/admin/all'), {
      cache: 'no-store',
      headers: getNoCacheHeaders(getAdminHeaders())
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
      const res = await fetch(getNoCacheUrl('/categories'), {
        cache: 'no-store',
        headers: getNoCacheHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch categories');
      return await res.json();
    } catch (err) {
      console.warn('Backend server unreachable for categories', err);
      return null;
    }
  },

  async getAllAdminCategories() {
    const res = await fetch(getNoCacheUrl('/categories/admin/all'), {
      cache: 'no-store',
      headers: getNoCacheHeaders(getAdminHeaders())
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
      const res = await fetch(getNoCacheUrl('/filters'), {
        cache: 'no-store',
        headers: getNoCacheHeaders()
      });
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
    const res = await fetch(getNoCacheUrl('/bookings/admin/all'), {
      cache: 'no-store',
      headers: getNoCacheHeaders(getAdminHeaders())
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

  // Contact Form
  async sendContactForm(contactData: { name: string; email: string; phone: string; message: string }) {
    try {
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: getCustomerHeaders(),
        body: JSON.stringify(contactData)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit contact enquiry.');
      }
      return data;
    } catch (err: any) {
      console.warn('[Contact API] Failed to reach backend, proceeding with frontend contact handling:', err.message);
      return {
        success: true,
        message: 'Offline mode / direct WhatsApp integration active',
        fallback: true
      };
    }
  },

  // Settings
  async getSettings() {
    try {
      const res = await fetch(getNoCacheUrl('/settings'), {
        cache: 'no-store',
        headers: getNoCacheHeaders()
      });
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

  // Offers / Discounts
  async getPublicOffers() {
    try {
      const res = await fetch(getNoCacheUrl('/offers'), {
        cache: 'no-store',
        headers: getNoCacheHeaders()
      });
      if (!res.ok) throw new Error('Failed to fetch active offers');
      return await res.json();
    } catch (err) {
      console.warn('Backend server unreachable for offers', err);
      return [];
    }
  },

  async getAllAdminOffers() {
    const res = await fetch(getNoCacheUrl('/offers/admin/all'), {
      cache: 'no-store',
      headers: getNoCacheHeaders(getAdminHeaders())
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to fetch admin offers');
    return data;
  },

  async addOffer(offerData: any) {
    const res = await fetch(`${API_BASE_URL}/offers/admin/add`, {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(offerData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to create offer');
    return data;
  },

  async updateOffer(id: string, offerData: any) {
    const res = await fetch(`${API_BASE_URL}/offers/admin/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(offerData)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to update offer');
    return data;
  },

  async toggleOfferStatus(id: string, isActive?: boolean) {
    const res = await fetch(`${API_BASE_URL}/offers/admin/${id}/toggle`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      body: JSON.stringify({ isActive })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to toggle offer status');
    return data;
  },

  async deleteOffer(id: string) {
    const res = await fetch(`${API_BASE_URL}/offers/admin/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Failed to delete offer');
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
