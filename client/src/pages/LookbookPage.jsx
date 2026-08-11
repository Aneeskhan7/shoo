import { Link } from 'react-router-dom';
import { formatPrice } from '../components/ui/Price';

/**
 * Temporary stand-in photography — reuses the "Step Into the Future" 3D
 * grid stills (client/public/assets/editorial/future-*.webp) so the
 * all-dark Lookbook doesn't show flat white product-cutout tiles until real
 * editorial photography lands. Same slug → image pairing as
 * components/home/FutureSection.jsx's SHOWCASE.
 */
const FUTURE_IMAGE = {
  'shoo-drift-one': 'future-01',
  'shoo-orbit-lx': 'future-05',
  'shoo-pulse': 'future-02',
  'shoo-ground-x': 'future-07',
};

/**
 * Lookbook — Drop 01 (Figma 41:2, 1440×2655). All-dark editorial:
 *   41:16  hero      720  — SEASON pill, 180px Black, centred lead + CTA
 *   41:24  editorial 740  — one tall left tile + two stacked right tiles
 *   41:64  quote     320  — 720px pull-quote left, drop CTA right
 *   41:70  grid      540  — four 330px product tiles
 *   41:111 stats     180  — four figures
 *   41:124 credits    68
 */
const HERO_TILE = {
  name: 'SHOO DRIFT ONE',
  slug: 'shoo-drift-one',
  note: 'The daily driver. Wears everything, goes everywhere.',
  price: 41500,
};

const SIDE_TILES = [
  { name: 'SHOO ORBIT LX', slug: 'shoo-orbit-lx', note: 'Bone White + Gum Sole', price: 47500 },
  { name: 'SHOO PULSE', slug: 'shoo-pulse', note: 'Ash Storm Colourway', price: 36000 },
];

const GRID = [
  { name: 'SHOO DRIFT ONE', slug: 'shoo-drift-one', color: 'Deep Noir', price: 41500 },
  { name: 'SHOO ORBIT LX', slug: 'shoo-orbit-lx', color: 'Bone White', price: 47500 },
  { name: 'SHOO PULSE', slug: 'shoo-pulse', color: 'Ash Storm', price: 36000 },
  { name: 'SHOO GROUND X', slug: 'shoo-ground-x', color: 'Raw Tan', price: 44500 },
];

const STATS = [
  ['120+', 'Brands Curated'],
  ['2.4K', 'Pairs Sold Drop 01'],
  ['4.9★', 'Avg. Rating'],
  ['48 hrs', 'Avg. Delivery Time'],
];

function EditorialArt({ slug, className = '' }) {
  const image = FUTURE_IMAGE[slug];
  return (
    <div className={`relative min-h-0 overflow-hidden bg-[#141414] text-[#4A4A4A] ${className}`}>
      {image && (
        <img
          src={`/assets/editorial/${image}.webp`}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      )}
    </div>
  );
}

export default function LookbookPage() {
  return (
    <div className="bg-black text-off-white">
      {/* ── Hero (41:16) — 720px under the 84px nav ──────────── */}
      <section className="relative flex flex-col bg-black px-6 pb-20 pt-[148px] lg:h-[804px] lg:px-16 lg:pb-0">
        <span className="inline-flex w-fit items-center rounded-full bg-green px-[18px] py-[8px] text-[11px] font-bold tracking-[0.12em] text-black">
          SEASON 01 · DROP 01
        </span>

        <h1
          className="mt-8 font-black tracking-[-0.05em] lg:mt-[46px] lg:text-center"
          style={{ fontSize: 'clamp(48px, 12.5vw, 180px)', lineHeight: 0.88 }}
        >
          The First Drop.
        </h1>

        <p className="mt-10 text-[18px] tracking-[0.02em] text-off-white/70 lg:mt-[92px] lg:text-center">
          Curated for the ones who move differently.
        </p>

        <Link
          to="/shop"
          className="mt-8 inline-flex w-fit items-center rounded-full bg-green px-[28px] py-[14px] text-[14px] font-bold tracking-[0.02em] text-black transition-opacity hover:opacity-85 lg:mx-auto lg:mt-[24px]"
        >
          Browse the Collection →
        </Link>

        <span className="absolute inset-x-0 bottom-0 hidden h-px bg-green lg:block" />
      </section>

      {/* ── Editorial grid (41:24) — 740px, asymmetric ───────── */}
      <section className="grid gap-px bg-[#0a0a0a] lg:h-[740px] lg:grid-cols-2">
        <article className="flex flex-col">
          <EditorialArt slug={HERO_TILE.slug} className="h-[320px] lg:h-[520px]" />
          <div className="px-6 py-7 lg:px-5">
            <h2 className="text-[22px] font-bold tracking-[-0.01em]">{HERO_TILE.name}</h2>
            <p className="mt-2 text-[13px] text-off-white/55">{HERO_TILE.note}</p>
            <div className="mt-4 flex items-center gap-4">
              <span className="text-[18px] font-bold text-green">{formatPrice(HERO_TILE.price)}</span>
              <Link
                to={`/products/${HERO_TILE.slug}`}
                className="rounded-full bg-green px-[16px] py-[7px] text-[12px] font-bold text-black"
              >
                Shop Now →
              </Link>
            </div>
          </div>
        </article>

        <div className="grid gap-px lg:grid-rows-2">
          {SIDE_TILES.map((t) => (
            <article key={t.slug} className="flex flex-col">
              <EditorialArt slug={t.slug} className="h-[220px] lg:h-[230px]" />
              <div className="px-6 py-5 lg:px-5">
                <h2 className="text-[18px] font-bold tracking-[-0.01em]">{t.name}</h2>
                <p className="mt-1 text-[12px] text-off-white/55">{t.note}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-[16px] font-bold text-green">{formatPrice(t.price)}</span>
                  <Link
                    to={`/products/${t.slug}`}
                    className="rounded-full border border-off-white/35 px-[14px] py-[5px] text-[11px] font-medium"
                  >
                    View →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Pull quote (41:64) — 320px ───────────────────────── */}
      <section className="flex flex-col justify-center gap-10 bg-black px-6 py-20 lg:h-[320px] lg:flex-row lg:items-center lg:px-16 lg:py-0">
        <blockquote
          className="max-w-[720px] flex-1 font-black tracking-[-0.03em]"
          style={{ fontSize: 'clamp(32px, 4.44vw, 64px)', lineHeight: 1.05 }}
        >
          “The only move that matters is forward.”
        </blockquote>

        <div className="lg:w-[300px]">
          <p className="text-eyebrow text-green">SHOO — DROP 01</p>
          <p className="mt-4 text-[16px] text-off-white/75">Now available globally.</p>
          <Link
            to="/shop"
            className="mt-6 inline-flex rounded-full bg-green px-[24px] py-[12px] text-[13px] font-bold text-black"
          >
            Shop The Drop →
          </Link>
        </div>
      </section>

      {/* ── Product row (41:70) — four 330px tiles, 540px ────── */}
      <section className="bg-[#0a0a0a] px-6 py-16 lg:h-[540px] lg:px-16 lg:py-[40px]">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {GRID.map((p) => (
            <article key={p.slug}>
              <Link to={`/products/${p.slug}`}>
                <div className="relative aspect-[330/220] overflow-hidden rounded-[6px] bg-[#141414] text-[#4A4A4A]">
                  <img
                    src={`/assets/editorial/${FUTURE_IMAGE[p.slug]}.webp`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </Link>
              <h3 className="mt-4 text-[15px] font-bold tracking-[-0.01em]">{p.name}</h3>
              <p className="mt-1 text-[12px] text-off-white/50">{p.color}</p>
              <p className="mt-2 text-[15px] font-bold text-green">{formatPrice(p.price)}</p>
              <Link
                to={`/products/${p.slug}`}
                className="mt-4 inline-flex rounded-full bg-green px-[14px] py-[6px] text-[11px] font-bold text-black"
              >
                Shop →
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* ── Stats (41:111) — 180px ───────────────────────────── */}
      <section className="grid grid-cols-2 gap-10 bg-black px-6 py-14 text-center lg:h-[180px] lg:grid-cols-4 lg:px-16 lg:py-0 lg:content-center">
        {STATS.map(([value, label]) => (
          <div key={label}>
            <p
              className="font-black tracking-[-0.03em]"
              style={{ fontSize: 'clamp(32px, 3.9vw, 56px)' }}
            >
              {value}
            </p>
            <p className="mt-2 text-[12px] text-off-white/50">{label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
