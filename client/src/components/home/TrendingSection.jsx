import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/**
 * Section — Trending, replaces the old "Step Into The Future" 3D grid.
 * Ten curated studio shots (client/public/assets/trending/) rather than the
 * live catalogue — a showcase, not a listing, so no price is shown and
 * cards aren't linked to individual product pages (these don't correspond
 * to real catalogue slugs). "Browse All Styles" is the one real link, to
 * the actual shop.
 *
 * Frame is a "display shelf" idea (black case, green ledge, the shoe lit
 * against it) in SHOO's own black/green/off-white palette — not a literal
 * wood-tone copy of the reference photo, which was a structural reference
 * only. All 10 source photos are confirmed genuinely transparent (checked
 * the raw alpha channel directly — corner alpha = 0 on every one).
 */
const FILTERS = ['All', 'Runners', 'High Top', 'Classic', 'Trail', 'Collab'];

const SHOWCASE = [
  { id: 1, image: 'trending-01', name: 'Air Flight 89', colorName: 'White / Navy / Tan', silhouette: 'Classic', badge: 'HOT' },
  { id: 2, image: 'trending-02', name: "Air Force 1 '07", colorName: 'Bone', silhouette: 'Classic' },
  { id: 3, image: 'trending-03', name: 'Air Jordan 1 Mid', colorName: 'Black / White / Gum', silhouette: 'High Top', badge: 'NEW' },
  { id: 4, image: 'trending-04', name: 'Air Jordan 4', colorName: 'Black / Cream', silhouette: 'High Top' },
  { id: 5, image: 'trending-05', name: 'Dunk Low', colorName: 'Two-Tone Grey', silhouette: 'Classic', badge: 'HOT' },
  { id: 6, image: 'trending-06', name: 'PUMA Tazon', colorName: 'Black / Red', silhouette: 'Runners' },
  { id: 7, image: 'trending-07', name: 'Li-Ning Wave Pro', colorName: 'Grey / Taupe', silhouette: 'Trail' },
  { id: 8, image: 'trending-08', name: 'Victoria 1985', colorName: 'White / Mustard', silhouette: 'Classic', badge: 'NEW' },
  { id: 9, image: 'trending-09', name: 'Air Jordan 1 High', colorName: 'Black / White / Mocha', silhouette: 'High Top' },
  { id: 10, image: 'trending-10', name: 'Adidas Samba', colorName: 'White / Black / Gum', silhouette: 'Collab' },
];

const MATCHES = {
  All: () => true,
  Runners: (s) => s === 'Runners',
  'High Top': (s) => s === 'High Top',
  Classic: (s) => s === 'Classic',
  Trail: (s) => s === 'Trail',
  Collab: (s) => s === 'Collab',
};

const BADGE_CLASS = { NEW: 'bg-green text-black', HOT: 'bg-off-white text-black' };

function TrendingCard({ item, eager }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[14px] border border-white/10 bg-[#141414]">
      {item.badge && (
        <span
          className={`absolute left-3 top-3 z-10 rounded-full px-[10px] py-[4px] text-[9px] font-bold tracking-[0.06em] ${BADGE_CLASS[item.badge]}`}
        >
          {item.badge}
        </span>
      )}

      <div className="relative flex aspect-[4/3] items-center justify-center p-6">
        {/* Faint radial glow behind the shoe — the "spotlit on a display
            case" cue, in place of an actual 3D shelf render. */}
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: 'radial-gradient(circle at 50% 45%, rgba(198,255,0,0.14), transparent 65%)' }}
        />
        <img
          src={`/assets/trending/${item.image}.webp`}
          alt={`${item.name} — ${item.colorName}`}
          loading={eager ? 'eager' : 'lazy'}
          className="relative h-full w-full object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.6)] transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Shelf ledge — the brand-green accent line the display case sits on. */}
      <div className="h-[3px] w-full bg-green" />

      {/* Hover popup — name + colorway, deliberately no price. Slides up
          from the shelf ledge, clipped by the card's own rounded corners
          until hovered. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-black/90 px-4 py-3 text-off-white opacity-0 backdrop-blur-sm transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        <p className="text-[13px] font-bold">{item.name}</p>
        <p className="text-[11px] text-off-white/60">{item.colorName}</p>
      </div>
    </div>
  );
}

export default function TrendingSection() {
  const [filter, setFilter] = useState('All');
  const filtered = useMemo(() => SHOWCASE.filter((item) => MATCHES[filter](item.silhouette)), [filter]);

  return (
    <section className="border-t border-black/10 bg-off-white px-6 py-20 text-black lg:px-16 lg:py-24">
      <div className="mx-auto max-w-[1200px] text-center">
        <span className="mx-auto block h-[2px] w-[48px] bg-green" aria-hidden="true" />
        <h2
          className="mt-6 font-black tracking-[-0.03em]"
          style={{ fontSize: 'clamp(44px, 7vw, 96px)', lineHeight: 0.9 }}
        >
          TRENDING
        </h2>
        <p className="mx-auto mt-6 max-w-[580px] text-[16px] leading-[1.6] text-grey-600">
          <em>Curated picks.</em> Classic silhouettes and the freshest drops — personally tested by
          our team before they reach you.
        </p>

        <div
          className="mt-10 flex flex-wrap justify-center gap-3"
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
                className={`rounded-full border px-5 py-[10px] text-[14px] font-medium transition-colors ${
                  active
                    ? 'border-black bg-black text-off-white'
                    : 'border-black/15 text-grey-700 hover:border-black'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1200px] grid-cols-2 gap-6 lg:grid-cols-4">
        {filtered.map((item, i) => (
          <TrendingCard key={item.id} item={item} eager={i < 4} />
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Link
          to="/shop"
          className="rounded-full bg-black px-8 py-[18px] text-[14px] font-bold tracking-[0.01em] text-off-white transition-opacity hover:opacity-85"
        >
          Browse All Styles →
        </Link>
      </div>
    </section>
  );
}
