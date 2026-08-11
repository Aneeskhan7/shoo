import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import PromoStrip from './PromoStrip';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import CartDrawer from '../cart/CartDrawer';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';
import { useAuthBootstrap } from '../../hooks/useAuth';
import { useUIStore } from '../../store';

/** Routes whose first section is the off-white surface get the inverted nav. */
const LIGHT_NAV = [
  '/shop',
  '/products',
  '/search',
  '/cart',
  '/checkout',
  '/order',
  '/account',
];

export default function Layout() {
  const { pathname } = useLocation();
  const closeAll = useUIStore((s) => s.closeAll);
  useSmoothScroll();
  useAuthBootstrap();

  useEffect(() => {
    closeAll();
    window.scrollTo(0, 0);
  }, [pathname, closeAll]);

  const theme = LIGHT_NAV.some((p) => pathname.startsWith(p)) ? 'light' : 'dark';

  return (
    <div className="relative min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[200] focus:rounded focus:bg-green focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <Navbar theme={theme} />
      <PromoStrip />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppButton />
    </div>
  );
}
