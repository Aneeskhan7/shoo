import axios from 'axios';

// Local dev: Vite proxies '/api' to localhost:5000 (see vite.config.js), so
// the relative path just works. In production the client and server are
// separate deployments — VITE_API_URL points straight at the Render backend.
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error || err.message || 'Something went wrong. Please try again.';
    return Promise.reject(Object.assign(new Error(message), { details: err.response?.data?.details }));
  },
);

export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const getFeatured = (limit = 8) =>
  api.get('/products/featured', { params: { limit } }).then((r) => r.data);
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data);
export const getFilters = () => api.get('/products/filters').then((r) => r.data);
export const getSilhouettes = () => api.get('/products/silhouettes').then((r) => r.data);
export const getReviews = (slug) => api.get(`/products/${slug}/reviews`).then((r) => r.data);
export const searchProducts = (params) => api.get('/search', { params }).then((r) => r.data);

export const submitContact = (payload) => api.post('/contact', payload).then((r) => r.data);
export const subscribeNewsletter = (payload) =>
  api.post('/newsletter', payload).then((r) => r.data);

export const validateCart = (payload) => api.post('/cart/validate', payload).then((r) => r.data);
export const placeOrder = (payload) => api.post('/orders', payload).then((r) => r.data);
export const getOrder = (orderNumber, email) =>
  api.get(`/orders/${orderNumber}`, { params: { email } }).then((r) => r.data);

// ─── Membership (optional) ──────────────────────────────────
export const joinShoo = (payload) => api.post('/auth/register', payload).then((r) => r.data);
export const signIn = (payload) => api.post('/auth/login', payload).then((r) => r.data);
export const signOut = () => api.post('/auth/logout').then((r) => r.data);
export const fetchMe = () => api.get('/auth/me').then((r) => r.data);

// ─── Member-only ────────────────────────────────────────────
export const getProfile = () => api.get('/account/profile').then((r) => r.data);
export const updateProfile = (payload) => api.patch('/account/profile', payload).then((r) => r.data);

export const getAddresses = () => api.get('/account/addresses').then((r) => r.data);
export const createAddress = (payload) => api.post('/account/addresses', payload).then((r) => r.data);
export const updateAddress = (id, payload) =>
  api.patch(`/account/addresses/${id}`, payload).then((r) => r.data);
export const deleteAddress = (id) => api.delete(`/account/addresses/${id}`).then((r) => r.data);

export const getWishlist = () => api.get('/account/wishlist').then((r) => r.data);
export const addToWishlist = (productId) =>
  api.post('/account/wishlist', { productId }).then((r) => r.data);
export const removeFromWishlist = (productId) =>
  api.delete(`/account/wishlist/${productId}`).then((r) => r.data);

export const getMyOrders = () => api.get('/account/orders').then((r) => r.data);
export const getMyOrder = (orderNumber) =>
  api.get(`/account/orders/${orderNumber}`).then((r) => r.data);

// ─── Admin (server re-checks auth + role on every one of these) ─────
export const getAdminDashboard = () => api.get('/admin/dashboard').then((r) => r.data);
export const getAdminMeta = () => api.get('/admin/meta').then((r) => r.data);

export const getAdminProducts = (params) =>
  api.get('/admin/products', { params }).then((r) => r.data);
export const getAdminProduct = (id) => api.get(`/admin/products/${id}`).then((r) => r.data);
export const createAdminProduct = (payload) =>
  api.post('/admin/products', payload).then((r) => r.data);
export const updateAdminProduct = (id, payload) =>
  api.put(`/admin/products/${id}`, payload).then((r) => r.data);
export const deleteAdminProduct = (id) => api.delete(`/admin/products/${id}`).then((r) => r.data);

export const uploadAdminProductImage = (id, file, conditionCategory) => {
  const form = new FormData();
  form.append('image', file);
  if (conditionCategory) form.append('conditionCategory', conditionCategory);
  return api
    .post(`/admin/products/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};
export const deleteAdminProductImage = (id, imageId) =>
  api.delete(`/admin/products/${id}/images/${imageId}`).then((r) => r.data);
export const setAdminPrimaryImage = (id, imageId) =>
  api.patch(`/admin/products/${id}/images/${imageId}/primary`).then((r) => r.data);

export const getAdminOrders = (params) => api.get('/admin/orders', { params }).then((r) => r.data);
export const getAdminOrder = (id) => api.get(`/admin/orders/${id}`).then((r) => r.data);
export const updateAdminOrderStatus = (id, status) =>
  api.patch(`/admin/orders/${id}/status`, { status }).then((r) => r.data);

/** Query keys live in one place so cart mutations invalidate the right things. */
export const qk = {
  me: () => ['me'],
  profile: () => ['account', 'profile'],
  addresses: () => ['account', 'addresses'],
  wishlist: () => ['account', 'wishlist'],
  myOrders: () => ['account', 'orders'],
  myOrder: (n) => ['account', 'orders', n],
  products: (params) => ['products', params],
  featured: (limit) => ['products', 'featured', limit],
  product: (slug) => ['product', slug],
  filters: () => ['filters'],
  silhouettes: () => ['silhouettes'],
  reviews: (slug) => ['reviews', slug],
  cart: (items, shipping, promo) => ['cart', items, shipping, promo],
  order: (n) => ['order', n],
  adminDashboard: () => ['admin', 'dashboard'],
  adminMeta: () => ['admin', 'meta'],
  adminProducts: (params) => ['admin', 'products', params],
  adminProduct: (id) => ['admin', 'product', id],
  adminOrders: (params) => ['admin', 'orders', params],
  adminOrder: (id) => ['admin', 'order', id],
};
