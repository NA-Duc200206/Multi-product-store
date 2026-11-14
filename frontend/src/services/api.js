const BASE_URL = '/api';

/**
 * Helper to make HTTP requests with JSON body and JWT headers
 */
async function request(endpoint, { method = 'GET', body = null, token = null } = {}) {
  const headers = {
    'Content-Type': 'application/json',
  };

  // Automatically fetch token from localStorage if not explicitly passed
  const authToken = token || localStorage.getItem('token');
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'An unexpected error occurred.');
    }
    
    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

async function uploadImageFile(endpoint, file) {
  const formData = new FormData();
  formData.append('image', file);
  const token = localStorage.getItem('token');
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Image upload failed');
  return data;
}

export const api = {
  // Authentication
  auth: {
    login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
    register: (name, email, password) => request('/auth/register', { method: 'POST', body: { name, email, password } }),
    getProfile: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/me', { method: 'PUT', body: profileData }),
    changePassword: (currentPassword, newPassword) => request('/auth/password', { method: 'PUT', body: { currentPassword, newPassword } }),
    syncCart: (cart) => request('/auth/cart', { method: 'PUT', body: { cart } }),
    getAllUsers: () => request('/auth/users'),
    updateUserRole: (id, role) => request(`/auth/users/${id}/role`, { method: 'PUT', body: { role } }),
  },

  // Categories
  categories: {
    getAll: () => request('/categories'),
    create: (name, description) => request('/categories', { method: 'POST', body: { name, description } }),
    update: (id, name, description) => request(`/categories/${id}`, { method: 'PUT', body: { name, description } }),
    delete: (id) => request(`/categories/${id}`, { method: 'DELETE' }),
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      const queryString = query.toString();
      return request(`/products?${queryString}`);
    },
    getById: (id) => request(`/products/${id}`),
    create: (productData) => request('/products', { method: 'POST', body: productData }),
    update: (id, productData) => request(`/products/${id}`, { method: 'PUT', body: productData }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },

  // Orders
  orders: {
    create: (orderData) => request('/orders', { method: 'POST', body: orderData }),
    getMyOrders: () => request('/orders/my-orders'),
    cancelOrder: (id) => request(`/orders/${id}/cancel`, { method: 'PUT' }),
    getById: (id) => request(`/orders/${id}`),
    getAll: () => request('/orders'),
    updateStatus: (id, status, paymentStatus) => request(`/orders/${id}/status`, { method: 'PUT', body: { status, paymentStatus } }),
  },

  // Coupons
  coupons: {
    getActive: () => request('/coupons/active'),
    validate: (code, orderAmount) => request('/coupons/validate', { method: 'POST', body: { code, orderAmount } }),
    getAll: () => request('/coupons'),
    create: (couponData) => request('/coupons', { method: 'POST', body: couponData }),
    update: (id, couponData) => request(`/coupons/${id}`, { method: 'PUT', body: couponData }),
    delete: (id) => request(`/coupons/${id}`, { method: 'DELETE' }),
  },

  // Media Upload
  media: {
    upload: (file) => uploadImageFile('/api/media/upload', file),
    uploadAvatar: (file) => uploadImageFile('/api/media/avatar', file),
  },

  // Payments
  payments: {
    createPaymentUrl: (orderId) => request(`/payment/create-payment-url/${orderId}`, { method: 'POST' }),
    verifyPayment: (queryParamsString) => request(`/payment/verify-payment?${queryParamsString}`),
  },

  // Analytics
  analytics: {
    getDashboardStats: () => request('/analytics/dashboard'),
  },

  // Reviews
  reviews: {
    getByProductId: (productId) => request(`/reviews/product/${productId}`),
    add: (reviewData) => request('/reviews', { method: 'POST', body: reviewData }),
    delete: (id) => request(`/reviews/${id}`, { method: 'DELETE' }),
  },

  // AI Assistant
  ai: {
    chat: (message) => request('/ai/chat', { method: 'POST', body: { message } }),
  }
};
