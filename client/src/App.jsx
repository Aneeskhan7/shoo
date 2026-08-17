import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';

const ShopPage = lazy(() => import('./pages/ShopPage'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmedPage = lazy(() => import('./pages/OrderConfirmedPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SizeGuidePage = lazy(() => import('./pages/SizeGuidePage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const PressPage = lazy(() => import('./pages/PressPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const LookbookPage = lazy(() => import('./pages/LookbookPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Optional membership
const SignInPage = lazy(() => import('./pages/SignInPage'));
const JoinShooPage = lazy(() => import('./pages/JoinShooPage'));
const AccountLayout = lazy(() => import('./components/account/AccountLayout'));
const AccountDashboardPage = lazy(() => import('./pages/account/AccountDashboardPage'));
const ProfilePage = lazy(() => import('./pages/account/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/account/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/account/OrderDetailPage'));
const WishlistPage = lazy(() => import('./pages/account/WishlistPage'));
const AddressesPage = lazy(() => import('./pages/account/AddressesPage'));

// Admin (its own route branch — no storefront chrome, see AdminLayout)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));
const AdminOrderDetailPage = lazy(() => import('./pages/admin/AdminOrderDetailPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center">
    <span className="text-eyebrow opacity-40">Loading…</span>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              {/* Open to everyone — no auth anywhere in this block. */}
              <Route index element={<HomePage />} />
              <Route path="shop" element={<ShopPage />} />
              <Route path="products/:slug" element={<ProductPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order/:orderNumber" element={<OrderConfirmedPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="size-guide" element={<SizeGuidePage />} />
              <Route path="careers" element={<CareersPage />} />
              <Route path="press" element={<PressPage />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="lookbook" element={<LookbookPage />} />

              {/* Optional membership */}
              <Route path="sign-in" element={<SignInPage />} />
              <Route path="join" element={<JoinShooPage />} />

              {/* Member-only — AccountLayout is the single auth gate. */}
              <Route path="account" element={<AccountLayout />}>
                <Route index element={<AccountDashboardPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:orderNumber" element={<OrderDetailPage />} />
                <Route path="wishlist" element={<WishlistPage />} />
                <Route path="addresses" element={<AddressesPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Admin — deliberately its own branch, no storefront chrome.
                AdminLayout is the auth+role gate; every /api/admin/* call is
                re-checked server-side regardless of what this renders. */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<AdminProductFormPage />} />
              <Route path="products/:id/edit" element={<AdminProductFormPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
