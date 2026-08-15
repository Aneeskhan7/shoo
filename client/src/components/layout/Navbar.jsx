import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useAuthStore, useCartStore, useUIStore } from '../../store';
import { useAuthActions } from '../../hooks/useAuth';

/**
 * Nav — 84px tall, three-zone layout (logo / centered categories / search +
 * heart + cart + account), the standard large-retailer pattern (Nike, etc.):
 * a CSS grid with equal-width outer columns keeps the middle nav genuinely
 * centered on the bar regardless of how wide the left/right content is,
 * which plain flexbox can't do without extra spacers.
 */
const LINKS = [
  { label: 'NEW RELEASES', to: '/shop?tag=new-release' },
  { label: 'MEN', to: '/shop?gender=MEN' },
  { label: 'WOMEN', to: '/shop?gender=WOMEN' },
  { label: 'KIDS', to: '/shop?gender=KIDS' },
  { label: 'UNISEX', to: '/shop?gender=UNISEX' },
];

const MEMBER_LINKS = [
  ['Account', '/account'],
  ['Order History', '/account/orders'],
  ['Wishlist', '/account/wishlist'],
  ['Saved Addresses', '/account/addresses'],
];

function SearchIcon(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" {...props}>
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon({ filled, ...props }) {
  return (
    <svg width="21" height="19" viewBox="0 0 21 19" fill="none" aria-hidden="true" {...props}>
      <path
        d="M10.5 18C10.5 18 1 12.5 1 6.2C1 3.3 3.2 1 6 1C7.9 1 9.5 2 10.5 3.5C11.5 2 13.1 1 15 1C17.8 1 20 3.3 20 6.2C20 12.5 10.5 18 10.5 18Z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={filled ? 'currentColor' : 'none'}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BagIcon(props) {
  return (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden="true" {...props}>
      <path
        d="M5 7V5.5C5 3 6.8 1 10 1C13.2 1 15 3 15 5.5V7M2.5 7H17.5L18.5 20.5C18.5 20.8 18.2 21 17.9 21H2.1C1.8 21 1.5 20.8 1.5 20.5L2.5 7Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar({ theme = 'dark' }) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const count = useCartStore((s) => s.count());
  const { menuOpen, setMenuOpen, setCartOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const { signOut } = useAuthActions();

  const [query, setQuery] = useState('');
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const dark = theme === 'dark';
  const fg = dark ? '#F5F4F0' : '#0A0A0A';

  useEffect(() => setAccountOpen(false), [pathname]);

  // The mobile menu wasn't a real overlay — it rendered inline, so scrolling
  // it scrolled the page underneath, which also drives Hero's pinned
  // ScrollTrigger (the hero would scrub/crossfade behind an open menu).
  // body.style.overflow alone doesn't stop it — Lenis drives scroll via its
  // own wheel/touch listeners, so it has to be told to stop directly too.
  useEffect(() => {
    if (!menuOpen) return undefined;
    document.body.style.overflow = 'hidden';
    window.__lenis?.stop();
    return () => {
      document.body.style.overflow = '';
      window.__lenis?.start();
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!accountOpen) return undefined;
    const onDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setAccountOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [accountOpen]);

  // Members return to where they were; guests land back after signing in.
  const next = encodeURIComponent(`${pathname}${search}`);

  const submitSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
  };

  const goToWishlist = () => {
    navigate(user ? '/account/wishlist' : `/sign-in?next=${encodeURIComponent('/account/wishlist')}`);
  };

  return (
    <header
      className="absolute inset-x-0 top-0 z-50 h-[84px]"
      style={{ background: dark ? '#0A0A0A' : '#F5F4F0', color: fg }}
    >
      <nav className="grid h-full grid-cols-[auto_1fr] items-center gap-6 px-6 lg:grid-cols-[1fr_auto_1fr] lg:px-[48px]">
        {/* Logo — left */}
        <Link to="/" className="text-[22px] font-black tracking-[-0.02em] justify-self-start">
          SHOO
        </Link>

        {/* Categories — genuinely centered on the bar (equal 1fr columns on
            either side achieve this; flexbox with one-sided content can't). */}
        <ul className="hidden items-center gap-[32px] justify-self-center lg:flex">
          {LINKS.map((l) => (
            <li key={l.label}>
              <NavLink
                to={l.to}
                className="text-[11px] font-medium tracking-[0.1em] opacity-75 transition-opacity hover:opacity-100"
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Search + heart + cart + account — right */}
        <div className="flex items-center justify-end gap-4 justify-self-end lg:gap-5">
          <form onSubmit={submitSearch} className="hidden lg:block">
            <label
              className="flex h-[38px] w-[210px] items-center gap-2 rounded-full px-4 transition-colors"
              style={{
                background: dark ? 'rgba(245,244,240,0.1)' : 'rgba(10,10,10,0.05)',
                border: `1px solid ${dark ? 'rgba(245,244,240,0.18)' : 'rgba(10,10,10,0.1)'}`,
              }}
            >
              <SearchIcon className="shrink-0 opacity-60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="w-full bg-transparent text-[13px] outline-none placeholder:opacity-50"
              />
            </label>
          </form>

          <button
            type="button"
            onClick={goToWishlist}
            aria-label="Wishlist"
            className="hidden transition-opacity hover:opacity-70 lg:block"
          >
            <HeartIcon />
          </button>

          <button
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Cart, ${count} item${count === 1 ? '' : 's'}`}
            className="relative transition-opacity hover:opacity-70"
          >
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-2 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-green px-1 text-[9px] font-bold text-black">
                {count}
              </span>
            )}
          </button>

          {/* Account — SIGN IN / JOIN SHOO for guests, initials + menu for members. */}
          <div ref={accountRef} className="relative hidden items-center lg:flex">
            <button
              type="button"
              onClick={() => setAccountOpen((o) => !o)}
              aria-expanded={accountOpen}
              aria-haspopup="menu"
              aria-label={user ? `Account, signed in as ${user.firstName}` : 'Account'}
              className="flex items-center transition-opacity hover:opacity-70"
            >
              {user ? (
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-green text-[10px] font-bold text-black">
                  {user.firstName?.[0]}
                  {user.lastName?.[0]}
                </span>
              ) : (
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <circle cx="11" cy="7.5" r="3.5" stroke={fg} strokeWidth="1.5" />
                  <path
                    d="M3.5 20C4.5 15.5 7.5 13.5 11 13.5C14.5 13.5 17.5 15.5 18.5 20"
                    stroke={fg}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>

            {accountOpen && status !== 'loading' && (
              <div
                role="menu"
                className="absolute right-0 top-[38px] w-[220px] overflow-hidden rounded-[8px] border border-black/10 bg-white py-2 text-black shadow-[0_18px_50px_rgba(0,0,0,0.22)]"
              >
                {user ? (
                  <>
                    <p className="px-4 pb-2 pt-1 text-[11px] tracking-[0.02em] text-grey-500">
                      {user.email}
                    </p>
                    {MEMBER_LINKS.map(([label, to]) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        className="block px-4 py-[9px] text-[13px] hover:bg-black/5"
                      >
                        {label}
                      </Link>
                    ))}
                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        role="menuitem"
                        className="block border-t border-black/10 px-4 py-[9px] text-[13px] font-medium text-green hover:bg-black/5"
                      >
                        Admin dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={async () => {
                        await signOut();
                        setAccountOpen(false);
                        navigate('/');
                      }}
                      className="mt-1 block w-full border-t border-black/10 px-4 py-[10px] text-left text-[13px] text-grey-700 hover:bg-black/5"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/sign-in?next=${next}`}
                      role="menuitem"
                      className="block px-4 py-[10px] text-[12px] font-medium tracking-[0.08em] hover:bg-black/5"
                    >
                      SIGN IN
                    </Link>
                    <Link
                      to={`/join?next=${next}`}
                      role="menuitem"
                      className="mx-3 mb-1 mt-2 block rounded-full bg-black px-4 py-[10px] text-center text-[12px] font-bold tracking-[0.08em] text-off-white"
                    >
                      JOIN SHOO
                    </Link>
                    <p className="px-4 pb-1 pt-2 text-[11px] leading-[1.5] text-grey-500">
                      Members save addresses, track orders and build a wishlist. Shopping never
                      requires it.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            aria-expanded={menuOpen}
            className="lg:hidden"
          >
            <svg width="22" height="14" viewBox="0 0 22 14" aria-hidden="true">
              <path d="M0 1h22M0 7h22M0 13h22" stroke={fg} strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className="fixed inset-x-0 bottom-0 top-[84px] z-40 overflow-y-auto overscroll-contain lg:hidden"
          style={{ background: dark ? '#0A0A0A' : '#F5F4F0' }}
        >
          <form onSubmit={submitSearch} className="px-6 pt-2">
            <label
              className="flex h-[42px] items-center gap-2 rounded-full px-4"
              style={{
                background: dark ? 'rgba(245,244,240,0.1)' : 'rgba(10,10,10,0.05)',
                border: `1px solid ${dark ? 'rgba(245,244,240,0.18)' : 'rgba(10,10,10,0.1)'}`,
              }}
            >
              <SearchIcon className="shrink-0 opacity-60" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                aria-label="Search products"
                className="w-full bg-transparent text-[14px] outline-none placeholder:opacity-50"
              />
            </label>
          </form>

          <ul className="flex flex-col gap-1 px-6 pb-6 pt-4">
            {LINKS.map((l) => (
              <li key={l.label}>
                <NavLink
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-3 text-[11px] font-medium tracking-[0.1em] opacity-75"
                >
                  {l.label}
                </NavLink>
              </li>
            ))}

            <li>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  goToWishlist();
                }}
                className="block py-3 text-[11px] font-medium tracking-[0.1em] opacity-75"
              >
                WISHLIST
              </button>
            </li>

            <li className="mt-3 border-t border-current/15 pt-3">
              {user ? (
                <>
                  {MEMBER_LINKS.map(([label, to]) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 text-[11px] font-medium tracking-[0.1em] opacity-75"
                    >
                      {label.toUpperCase()}
                    </NavLink>
                  ))}
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      setMenuOpen(false);
                      navigate('/');
                    }}
                    className="block py-3 text-[11px] font-medium tracking-[0.1em] opacity-60"
                  >
                    SIGN OUT
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to={`/sign-in?next=${next}`}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-[11px] font-medium tracking-[0.1em] opacity-75"
                  >
                    SIGN IN
                  </NavLink>
                  <NavLink
                    to={`/join?next=${next}`}
                    onClick={() => setMenuOpen(false)}
                    className="mt-2 block rounded-full bg-green py-3 text-center text-[11px] font-bold tracking-[0.1em] text-black"
                  >
                    JOIN SHOO
                  </NavLink>
                </>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
