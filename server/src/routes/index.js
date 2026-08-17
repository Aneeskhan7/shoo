import { Router } from 'express';
import { optionalAuth, requireAuth, requireAdmin } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';
import {
  listProducts,
  featuredProducts,
  getProduct,
  listFilters,
  listSilhouettes,
} from '../controllers/productController.js';
import { createOrder, getOrder, validateCart } from '../controllers/orderController.js';
import { listReviews } from '../controllers/reviewController.js';
import { sendContactMessage } from '../controllers/contactController.js';
import { subscribeNewsletter } from '../controllers/newsletterController.js';
import { register, login, logout, me } from '../controllers/authController.js';
import {
  getProfile,
  updateProfile,
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  listWishlist,
  addWishlist,
  removeWishlist,
  listMyOrders,
  getMyOrder,
} from '../controllers/accountController.js';
import { getDashboard } from '../controllers/adminDashboardController.js';
import {
  getProductMeta,
  createBrand,
  listAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,
} from '../controllers/adminProductController.js';
import { listAdminOrders, getAdminOrder, updateOrderStatus } from '../controllers/adminOrderController.js';
import { uploadProductImage as uploadMiddleware } from '../lib/upload.js';
import { sitemap } from '../controllers/sitemapController.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ ok: true }));

// Public, no auth — read by search-engine crawlers.
router.get('/sitemap.xml', sitemap);

// Products
router.get('/products', listProducts);
router.get('/products/featured', featuredProducts);
router.get('/products/filters', listFilters);
router.get('/products/silhouettes', listSilhouettes);
router.get('/products/:slug', getProduct);

// Uptime ping target — no DB query, just proves the process is awake. Point
// an external keep-alive service (UptimeRobot, cron-job.org, etc.) at this
// every ~10 min so Render's free tier never spins the instance down; that
// spin-down is what makes the first request after a quiet period take
// 30-60s instead of the usual sub-second response.
router.get('/health', (_req, res) => res.json({ ok: true }));

// Search reuses the product list controller — `?q=` is already a supported filter.
router.get('/search', listProducts);

// Reviews
router.get('/products/:slug/reviews', listReviews);

// Contact form
router.post('/contact', sendContactMessage);

// Newsletter signup
router.post('/newsletter', subscribeNewsletter);

// Cart pricing + orders (guest-capable; optionalAuth attaches a user when present)
router.post('/cart/validate', validateCart);
router.post('/orders', optionalAuth, createOrder);
router.get('/orders/:orderNumber', optionalAuth, getOrder);

// ─── SHOO membership (entirely optional) ────────────────────
// Nothing above this line requires a session. Joining only adds features.
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/me', optionalAuth, me);

// ─── Member-only ────────────────────────────────────────────
router.use('/account', requireAuth);
router.get('/account/profile', getProfile);
router.patch('/account/profile', updateProfile);

router.get('/account/addresses', listAddresses);
router.post('/account/addresses', createAddress);
router.patch('/account/addresses/:id', updateAddress);
router.delete('/account/addresses/:id', deleteAddress);

router.get('/account/wishlist', listWishlist);
router.post('/account/wishlist', addWishlist);
router.delete('/account/wishlist/:productId', removeWishlist);

router.get('/account/orders', listMyOrders);
router.get('/account/orders/:orderNumber', getMyOrder);

// ─── Admin-only ─────────────────────────────────────────────
// Every route below requires a signed-in session AND role === 'ADMIN',
// re-checked against the DB on every request (see middleware/auth.js) —
// never trusted from a client-supplied claim.
router.use('/admin', requireAuth, requireAdmin);

router.get('/admin/dashboard', getDashboard);

router.get('/admin/meta', getProductMeta);
router.post('/admin/brands', createBrand);
router.get('/admin/products', listAdminProducts);
router.post('/admin/products', createProduct);
router.get('/admin/products/:id', getAdminProduct);
router.put('/admin/products/:id', updateProduct);
router.delete('/admin/products/:id', deleteProduct);

router.post('/admin/products/:id/images', (req, res, next) => {
  uploadMiddleware(req, res, (err) => (err ? next(new ApiError(400, err.message)) : next()));
}, uploadProductImage);
router.delete('/admin/products/:id/images/:imageId', deleteProductImage);
router.patch('/admin/products/:id/images/:imageId/primary', setPrimaryImage);

router.get('/admin/orders', listAdminOrders);
router.get('/admin/orders/:id', getAdminOrder);
router.patch('/admin/orders/:id/status', updateOrderStatus);

export default router;
