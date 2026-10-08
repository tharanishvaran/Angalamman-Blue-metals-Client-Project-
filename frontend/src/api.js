const PRIMARY_API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');
const CLOUD_FALLBACK_API = 'https://angalamman-blue-metals.onrender.com/api';

function getHeaders(isJson = true) {
  const headers = {};
  if (isJson) headers['Content-Type'] = 'application/json';
  const token = localStorage.getItem('angalamman_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...getHeaders(!isFormData),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(`${PRIMARY_API}${endpoint}`, {
      ...options,
      headers
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || 'Server error occurred');
    }
    return data;
  } catch (err) {
    // If local network error / connection refused, try cloud fallback
    const isNetworkError = err.name === 'TypeError' || (err.message && err.message.toLowerCase().includes('fetch'));
    if (isNetworkError && PRIMARY_API !== CLOUD_FALLBACK_API) {
      try {
        console.warn(`Local API at ${PRIMARY_API} unreachable. Retrying with cloud API: ${CLOUD_FALLBACK_API}...`);
        const fallbackRes = await fetch(`${CLOUD_FALLBACK_API}${endpoint}`, {
          ...options,
          headers
        });
        const fallbackData = await fallbackRes.json().catch(() => ({}));
        if (!fallbackRes.ok) {
          throw new Error(fallbackData.error || 'Server error occurred');
        }
        return fallbackData;
      } catch (cloudErr) {
        throw new Error(cloudErr.message || 'Unable to connect to the server. Please check your internet connection.');
      }
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  googleLogin: (credential, userInfo) => request('/auth/google', { method: 'POST', body: JSON.stringify({ credential, userInfo }) }),
  updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  adminLogin: (email, password) => request('/auth/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  logout: () => {
    localStorage.removeItem('angalamman_token');
    localStorage.removeItem('angalamman_user');
    localStorage.removeItem('angalamman_admin');
    return request('/auth/logout', { method: 'POST' }).catch(() => {});
  },

  // Materials
  getMaterials: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/materials${query ? `?${query}` : ''}`);
  },
  getMaterial: (id) => request(`/materials/${id}`),
  addMaterial: (data) => request('/materials/admin', { method: 'POST', body: JSON.stringify(data) }),
  updateMaterial: (id, data) => request(`/materials/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMaterial: (id) => request(`/materials/admin/${id}`, { method: 'DELETE' }),

  // Services
  getServices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/services${query ? `?${query}` : ''}`);
  },
  addService: (data) => request('/services/admin', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id, data) => request(`/services/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id) => request(`/services/admin/${id}`, { method: 'DELETE' }),

  // Quotes
  submitQuote: (data) => request('/quotes', { method: 'POST', body: JSON.stringify(data) }),
  getMyQuotes: () => request('/quotes/my'),
  getAdminQuotes: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/quotes/admin${query ? `?${query}` : ''}`);
  },
  updateQuote: (id, data) => request(`/quotes/admin/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  // Deliveries
  submitDelivery: (data) => request('/deliveries', { method: 'POST', body: JSON.stringify(data) }),
  getMyDeliveries: () => request('/deliveries/my'),
  getAdminDeliveries: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/deliveries/admin${query ? `?${query}` : ''}`);
  },
  updateDeliveryStatus: (id, status) => request(`/deliveries/admin/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Orders
  submitOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request('/orders/my'),
  getAdminOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders/admin${query ? `?${query}` : ''}`);
  },
  updateOrderStatus: (id, status) => request(`/orders/admin/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Invoices & Billing
  getMyInvoices: () => request('/invoices/my'),
  getInvoice: (id) => request(`/invoices/${id}`),
  getAdminInvoices: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/invoices/admin${query ? `?${query}` : ''}`);
  },
  createInvoice: (data) => request('/invoices/admin', { method: 'POST', body: JSON.stringify(data) }),
  updateInvoicePaymentStatus: (id, status) => request(`/invoices/admin/${id}/status`, { method: 'PUT', body: JSON.stringify({ payment_status: status }) }),

  // Reviews
  getReviews: () => request('/reviews'),
  submitReview: (data) => request('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getAdminReviews: () => request('/reviews/admin'),
  approveReview: (id, is_approved) => request(`/reviews/admin/${id}/approve`, { method: 'PUT', body: JSON.stringify({ is_approved }) }),
  deleteReview: (id) => request(`/reviews/admin/${id}`, { method: 'DELETE' }),

  // Admin & Settings
  getDashboardStats: () => request('/admin/dashboard'),
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/admin/users${query ? `?${query}` : ''}`);
  },
  getCustomerDetails: (id) => request(`/admin/users/${id}`),
  toggleCustomerStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  getAdmins: () => request('/admin/admins'),
  addAdmin: (data) => request('/admin/admins', { method: 'POST', body: JSON.stringify(data) }),
  updateAdmin: (id, data) => request(`/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdmin: (id) => request(`/admin/admins/${id}`, { method: 'DELETE' }),

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings/admin', { method: 'PUT', body: JSON.stringify(data) }),

  // Upload
  uploadImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return request('/upload', { method: 'POST', body: fd });
  }
};
