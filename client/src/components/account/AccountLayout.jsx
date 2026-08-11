import { NavLink, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store';

const TABS = [
  ['Dashboard', '/account'],
  ['My Orders', '/account/orders'],
  ['Profile', '/account/profile'],
  ['Wishlist', '/account/wishlist'],
  ['Addresses', '/account/addresses'],
];

/**
 * Guard + chrome for member-only routes.
 *
 * This is the ONLY place in the app that redirects on missing auth, and it
 * covers /account/* exclusively — browsing, cart and checkout never pass
 * through here. While /auth/me is in flight we render nothing rather than
 * bouncing a member who is simply still loading.
 */
export default function AccountLayout() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const { pathname, search } = useLocation();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white text-black">
        <span className="text-eyebrow text-grey-500">Loading…</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/sign-in?next=${encodeURIComponent(pathname + search)}`} replace />;
  }

  return (
    <div className="min-h-screen bg-off-white pt-[120px] text-black lg:pt-[128px]">
      <header className="px-6 pb-8 pt-12 lg:px-20">
        <p className="text-eyebrow text-grey-500">SHOO Member</p>
        <h1 className="text-display-l mt-4">
          {user.firstName} {user.lastName}
        </h1>
        <p className="mt-3 text-[14px] text-grey-500">{user.email}</p>
      </header>

      <nav className="flex flex-wrap gap-2 px-6 lg:px-20" aria-label="Account">
        {TABS.map(([label, to]) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/account'}
            className={({ isActive }) =>
              `rounded-full px-[14px] py-[7px] text-[12px] font-medium transition-colors ${
                isActive
                  ? 'border border-black bg-black text-off-white'
                  : 'border border-[#d3d3d3] bg-white text-grey-700 hover:border-black'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 pb-24 pt-10 lg:px-20">
        <Outlet />
      </div>
    </div>
  );
}
