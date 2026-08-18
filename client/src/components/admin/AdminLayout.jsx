import { NavLink, Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { useAuthActions, useAuthBootstrap } from '../../hooks/useAuth';

const NAV = [
  ['Dashboard', '/admin'],
  ['Products', '/admin/products'],
  ['Orders', '/admin/orders'],
  ['Blog', '/admin/blog'],
];

/**
 * Guard + chrome for /admin/*. Deliberately its own route branch (not nested
 * under the storefront's <Layout>) so admin pages carry no navbar, promo
 * strip, footer or cart drawer — a visibly separate surface from the
 * storefront, per the brief.
 *
 * This is UX only. The real boundary is server-side: every /api/admin/*
 * route re-checks role from the DB (see server/src/middleware/auth.js) —
 * this guard just avoids flashing an admin shell at someone who'd get a 403
 * from every request in it anyway.
 */
export default function AdminLayout() {
  // Admin is its own route branch (see App.jsx) so the storefront Layout's
  // bootstrap never runs when this is the entry route — this one has to.
  // Harmless to also run when navigating in from the storefront: the store
  // is global, a second /auth/me is just an extra cheap request.
  useAuthBootstrap();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const { signOut } = useAuthActions();
  const { pathname } = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-off-white">
        <span className="text-eyebrow opacity-40">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(pathname)}`} replace />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-off-white text-black">
      {/* print:hidden — an order's packing slip (AdminOrderDetailPage) is the
          only thing meant to come out of Ctrl+P/Save-as-PDF from admin; the
          nav has no reason to be on a printed page. */}
      <aside className="flex w-[260px] shrink-0 flex-col bg-black text-off-white print:hidden">
        <Link to="/admin" className="px-6 py-[26px] text-[18px] font-black tracking-[-0.02em]">
          SHOO <span className="text-green">ADMIN</span>
        </Link>
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map(([label, to]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `rounded-[6px] px-4 py-[10px] text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-green text-black' : 'text-off-white/70 hover:bg-white/10 hover:text-off-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1 px-3 pb-6">
          <Link
            to="/"
            className="rounded-[6px] px-4 py-[10px] text-[13px] font-medium text-off-white/70 hover:bg-white/10 hover:text-off-white"
          >
            ← View store
          </Link>
          <button
            type="button"
            onClick={signOut}
            className="rounded-[6px] px-4 py-[10px] text-left text-[13px] font-medium text-off-white/70 hover:bg-white/10 hover:text-off-white"
          >
            Sign out
          </button>
          <p className="mt-2 px-4 text-[11px] text-off-white/40">
            {user.firstName} {user.lastName}
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-10 py-10 print:p-0">
        <Outlet />
      </main>
    </div>
  );
}
