import { Link } from 'react-router-dom';
import { useState } from 'react';
import { subscribeNewsletter } from '../../lib/api';

/**
 * Footer from Figma 38:266 — off-white surface, 400px ghost wordmark at 8%
 * opacity, four link columns, dark newsletter card, green hairline rule.
 */
const COLUMNS = [
  {
    title: 'SHOP',
    links: [
      ['New Releases', '/collections/new-releases'],
      ['Men', '/collections/mens-sneakers'],
      ['Women', '/collections/womens-sneakers'],
      ['Kids', '/collections/kids-sneakers'],
      ['Size Guide', '/size-guide'],
    ],
  },
  {
    title: 'COMPANY',
    links: [
      ['About', '/about'],
      ['Careers', '/careers'],
      ['Journal', '/journal'],
    ],
  },
  {
    title: 'SUPPORT',
    links: [
      ['Contact', '/contact'],
      ['Size Guide', '/size-guide'],
      ['FAQ', '/faq'],
    ],
  },
  {
    title: 'FOLLOW',
    links: [
      ['Instagram', 'https://www.instagram.com/shoodrops/?hl=en'],
      ['Facebook', 'https://www.facebook.com/shoodrops'],
      ['TikTok', 'https://www.tiktok.com/@shoodrops'],
      ['Pinterest', 'https://www.pinterest.com/shoodrops'],
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  return (
    <footer className="relative overflow-hidden bg-off-white text-black">
      {/* Ghost wordmark is a pure background layer (absolute, out of flow) so
          the link columns below can sit vertically centered against it
          instead of trailing near its baseline. */}
      <div className="relative flex min-h-[220px] items-center pb-10 pt-12 sm:min-h-[300px] lg:min-h-[360px] lg:pt-16">
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 select-none whitespace-nowrap pl-[64px] font-black leading-[0.9] max-md:inset-x-0 max-md:top-0 max-md:h-[68%] max-md:flex max-md:items-center max-md:justify-center max-md:pl-0 max-md:text-center"
          style={{
            fontSize: 'clamp(120px, 27.8vw, 400px)',
            letterSpacing: '-0.06em',
            color: 'rgba(10,10,10,0.08)',
          }}
        >
          SHOO
        </p>

        <div className="relative flex w-full flex-wrap gap-y-12 px-6 lg:px-[64px]">
          {/* md:grid-cols-4 (equal 1fr tracks) stretched each column to a
              quarter of this flex-1 container's full width regardless of
              how narrow its actual content was — that's what was reading as
              a big gap between columns, not the gap-x value itself. Auto-
              sized tracks let the columns hug their own content instead. */}
          <div className="grid flex-1 grid-cols-2 gap-x-[36px] gap-y-10 max-md:mx-auto max-md:w-fit max-md:flex-none max-md:gap-x-[64px] max-md:text-center md:[grid-template-columns:repeat(4,max-content)] md:gap-x-[32px]">
            {COLUMNS.map((col) => (
              <div key={col.title} className="flex flex-col gap-[14px] max-md:items-center">
                <h3 className="text-[11px] font-bold tracking-[0.12em]">{col.title}</h3>
                {col.links.map(([label, to]) =>
                  to.startsWith('http') ? (
                    <a
                      key={label}
                      href={to}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[13px] text-grey-700 transition-opacity hover:opacity-60"
                    >
                      {label}
                    </a>
                  ) : (
                    <Link
                      key={label}
                      to={to}
                      className="text-[13px] text-grey-700 transition-opacity hover:opacity-60"
                    >
                      {label}
                    </Link>
                  ),
                )}
              </div>
            ))}
          </div>

          <div className="flex w-full flex-col gap-[10px] rounded-[12px] bg-black p-[24px] text-off-white lg:ml-auto lg:w-[288px]">
            <p className="text-[10px] font-medium tracking-[0.12em] text-green">STAY IN THE LOOP</p>
            <p className="text-[22px] font-bold tracking-[-0.01em]">First to drop.</p>
            <p className="text-[12px] text-off-white/70">Get new releases before anyone else.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (busy || !email.trim()) return;
                setBusy(true);
                setError(null);
                try {
                  await subscribeNewsletter({ email: email.trim() });
                  setJoined(true);
                } catch (err) {
                  setError(err.message);
                } finally {
                  setBusy(false);
                }
              }}
              className="mt-1 flex gap-[8px]"
            >
              <input
                type="email"
                required
                disabled={busy || joined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-label="Email address"
                className="h-[40px] w-[180px] rounded-full border border-off-white/30 bg-transparent px-[13px] text-[12px] outline-none placeholder:text-off-white/45 focus:border-green disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={busy || joined}
                className="rounded-full bg-green px-[16px] py-[10px] text-[12px] font-semibold tracking-[0.02em] text-black transition-opacity hover:opacity-85 disabled:opacity-50"
              >
                {joined ? 'Joined' : busy ? 'Joining…' : 'Join'}
              </button>
            </form>
            {error && (
              <p role="alert" className="text-[11px] text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-6 h-px bg-green lg:mx-[64px]" />

      <div className="flex flex-wrap justify-between gap-3 px-6 py-[10px] pb-8 lg:px-[64px]">
        <p className="text-[11px] tracking-[0.02em] text-grey-500">
          © 2026 SHOO Inc. All rights reserved.
        </p>
        <p className="text-[11px] tracking-[0.02em] text-grey-500">Privacy · Terms · Cookies</p>
      </div>
    </footer>
  );
}
