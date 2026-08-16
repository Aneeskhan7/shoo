import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { prefersReducedMotion } from '../../hooks/useSmoothScroll';

// three.js stays out of the initial bundle until this section is reached.
const ShoeGrid3D = lazy(() => import('./ShoeGrid3D'));

/**
 * Section — 3D Shoes Grid (Figma 38:200).
 *
 * The grid is a curated set of 12 studio photos (client/public/assets/
 * editorial/future-01..12.webp) rather than the live product catalogue —
 * this section is a showcase, not a listing, so a fixed, art-directed set
 * reads better than 24 auto-pulled catalogue thumbnails. Locked to exactly
 * 3 columns at every breakpoint (not responsive-escalating) so a row never
 * runs wider than its container and clips a shoe off the side.
 */
const FILTERS = ['All', 'Runners', 'High Top', 'Classic', 'Trail'];

const FEATURES = [
  { icon: '◈', title: 'Dynamic Grid', note: 'GSAP + ScrollTrigger' },
  { icon: '⌕', title: 'Interactive Zoom', note: 'Three.js Raycaster' },
  { icon: '⚙', title: 'Real-Time Filter', note: 'Zero reload' },
];

/**
 * `slug` links each photo to the closest real catalogue product (same
 * decorative-representative pattern as the Collection bands and Comfort
 * tiles) so "Buy Now" from the 3D grid's hover card still goes somewhere real.
 */
const SHOWCASE = [
  { id: 'future-01', image: 'future-01', name: 'SHOO Future Runner', price: 149, silhouette: 'Runners', slug: 'shoo-drift-one' },
  { id: 'future-02', image: 'future-02', name: 'SHOO Pulse Runner', price: 129, silhouette: 'Runners', slug: 'shoo-pulse' },
  { id: 'future-03', image: 'future-03', name: 'SHOO Studio Runner', price: 144, silhouette: 'Runners', slug: 'shoo-drift-sport' },
  { id: 'future-04', image: 'future-04', name: 'SHOO High-Top', price: 154, silhouette: 'High Top', slug: 'shoo-drift-hi' },
  { id: 'future-05', image: 'future-05', name: 'SHOO Orbit LX', price: 169, silhouette: 'Runners', slug: 'shoo-orbit-lx' },
  { id: 'future-06', image: 'future-06', name: 'SHOO Drift Lite', price: 124, silhouette: 'Runners', slug: 'shoo-drift-lite' },
  { id: 'future-07', image: 'future-07', name: 'SHOO Speed Trainer', price: 159, silhouette: 'Runners', slug: 'shoo-ground-x' },
  { id: 'future-08', image: 'future-08', name: 'SHOO High-Top Mid', price: 154, silhouette: 'High Top', slug: 'shoo-drift-hi' },
  { id: 'future-09', image: 'future-09', name: 'SHOO Trail', price: 159, silhouette: 'Trail', slug: 'shoo-ground-x' },
  { id: 'future-10', image: 'future-10', name: 'SHOO Drift Low', price: 134, silhouette: 'Runners', slug: 'shoo-drift-low' },
  { id: 'future-11', image: 'future-11', name: 'SHOO Classic', price: 119, silhouette: 'Classic', slug: 'shoo-form-low' },
  { id: 'future-12', image: 'future-12', name: 'SHOO Drift Lace', price: 139, silhouette: 'Classic', slug: 'shoo-drift-lace' },
];

const MATCHES = {
  All: () => true,
  Runners: (s) => s === 'Runners',
  'High Top': (s) => s === 'High Top',
  Classic: (s) => s === 'Classic',
  Trail: (s) => s === 'Trail',
};

/** Renders when the R3F canvas is skipped (reduced motion, off-screen, low-power). */
function StaticGrid({ items }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((item) => (
        <Link
          key={item.id}
          to={`/products/${item.slug}`}
          className="group relative aspect-square overflow-hidden rounded-[10px] border border-off-white/10 bg-[#141414]"
        >
          <img
            src={`/assets/editorial/${item.image}.webp`}
            alt={item.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
      ))}
    </div>
  );
}

export default function FutureSection() {
  const [filter, setFilter] = useState('All');
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  const reduced = prefersReducedMotion();

  // Only mount the canvas once the section is actually on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setVisible(true),
      { rootMargin: '200px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const filtered = useMemo(
    () => SHOWCASE.filter((item) => MATCHES[filter](item.silhouette)),
    [filter],
  );

  return (
    <section ref={ref} className="relative overflow-hidden bg-black py-20 text-off-white lg:py-0">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 lg:h-[1100px] lg:flex-row lg:px-16 lg:pt-20">
        <div className="lg:w-[46%]">
          <p className="text-eyebrow text-green">04 — IMMERSIVE 3D EXPERIENCE</p>
          <h2
            className="mt-[25px] font-black tracking-[-0.05em]"
            style={{ fontSize: 'clamp(48px, 7.9vw, 114px)', lineHeight: 0.88 }}
          >
            STEP INTO THE FUTURE<span className="text-green">.</span>
          </h2>
          <p className="mt-[38px] max-w-[420px] text-[14px] leading-[1.65] text-off-white/60">
            Explore every SHOO in a real-time 3D grid. Hover to zoom. Filter by silhouette.
            Interact with every stitch, seam, and sole.
          </p>

          {/* flex-nowrap + overflow-x-auto (not flex-wrap): 5 pills don't
              fit one mobile-width row, and wrapping dropped "Trail" onto
              its own line below. Scrolling keeps it a single row; desktop
              never needs to scroll since the 46% column is wide enough. */}
          <div
            className="mt-[38px] flex flex-nowrap gap-3 overflow-x-auto"
            role="group"
            aria-label="Filter by silhouette"
          >
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f)}
                  className={`h-[31px] shrink-0 whitespace-nowrap rounded-full px-[14px] text-[11px] font-medium transition-colors ${
                    active
                      ? 'bg-green text-black'
                      : 'border border-off-white/20 text-off-white/70 hover:border-off-white/50'
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>

          <ul className="mt-12 hidden flex-col gap-5 lg:flex">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-center gap-4">
                <span
                  className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-green text-[11px] text-black"
                  aria-hidden="true"
                >
                  {f.icon}
                </span>
                <span>
                  <span className="block text-[13px] font-semibold">{f.title}</span>
                  <span className="block text-[11px] text-off-white/50">{f.note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* h-[600px] (not min-h) — flex-1's flex-basis:0% was collapsing the
            container to whatever the canvas's own first-paint size happened
            to be (~150px) since the mobile flex column has no bounded
            parent height for flex-1 to grow into; an explicit height sidesteps
            that resolution order entirely. flex-none keeps mobile from
            fighting it; lg: restores the original flex-1 sizing desktop relies on.
            No -mx-6 bleed here (was edge-to-edge) — the grid keeps the
            section's own px-6 so tiles sit clear of both screen edges. */}
        <div className="h-[600px] flex-none lg:h-auto lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-24">
          {reduced || !visible ? (
            <StaticGrid items={filtered} />
          ) : (
            <Suspense fallback={<StaticGrid items={filtered} />}>
              <ShoeGrid3D items={filtered} />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  );
}
