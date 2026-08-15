import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getFeatured, qk } from '../lib/api';
import { getProductImage } from '../lib/productImages';
import { formatPrice } from '../components/ui/Price';

/**
 * Lookbook — Drop 01 (Figma 41:2, 1440×2655). All-dark editorial:
 *   41:16  hero      720  — SEASON pill, 180px Black, centred lead + CTA
 *   41:24  editorial 740  — one tall left tile + two stacked right tiles
 *   41:64  quote     320  — 720px pull-quote left, drop CTA right
 *   41:70  grid      540  — four 330px product tiles
 *   41:111 stats     180  — four figures
 *   41:124 credits    68
 *
 * The drop's line-up is whatever's checked "Featured" in admin — real
 * product photos, prices and discounts, not curated editorial stock. First
 * featured product leads (hero tile), next two run alongside it, the rest
 * fill the grid row below.
 */
const STATS = [
  ['120+', 'Brands Curated'],
  ['2.4K', 'Pairs Sold Drop 01'],
  ['4.9★', 'Avg. Rating'],
  ['48 hrs', 'Avg. Delivery Time'],
];

// The admin-uploaded photos are consistently tall composed shots (~3:4,
// headline stacked above the shoe) — every frame below is sized to that
// same ratio so object-cover fills it with only a sliver of crop instead of
// either cutting the headline off (mismatched cover) or leaving big empty
// letterbox bars (contain in a mismatched box).
function DropArt({ product, className = '' }) {
  const src = getProductImage(product);
  return (
    <div className={`relative min-h-0 overflow-hidden bg-[#141414] text-[#4A4A4A] ${className}`}>
      {src && (
        <img src={src} alt={product.name} loading="lazy" className="h-full w-full object-cover" />
      )}
    </div>
  );
}

function DropPrice({ product, priceCls, compareCls }) {
  return (
    <span className="flex items-baseline gap-2">
      {product.discountPercent > 0 && (
        <span className={compareCls}>{formatPrice(product.compareAtPrice)}</span>
      )}
      <span className={priceCls}>{formatPrice(product.minPrice)}</span>
    </span>
  );
}

export default function LookbookPage() {
  const { data, isLoading } = useQuery({ queryKey: qk.featured(8), queryFn: () => getFeatured(8) });
  const products = data?.products ?? [];
  const [hero, ...restProducts] = products;
  const sideTiles = restProducts.slice(0, 2);
  const gridTiles = restProducts.slice(2, 6);

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

      {!isLoading && hero && (
        <>
          {/* ── Editorial grid (41:24) — asymmetric, height follows the
              photos' own ~3:4 ratio now rather than a fixed pixel box.
              2fr/1fr (not equal columns): at equal width, two stacked 3:4
              side tiles would come out ~2x taller than the single hero
              tile — halving the side column's width brings their combined
              height back in line with the hero's. ──────────────────── */}
          <section className="grid gap-px bg-[#0a0a0a] lg:grid-cols-[2fr_1fr]">
            <article className="flex flex-col">
              <DropArt product={hero} className="aspect-[3/4]" />
              <div className="px-6 py-7 lg:px-5">
                <h2 className="text-[22px] font-bold tracking-[-0.01em]">{hero.name}</h2>
                {hero.tagline && <p className="mt-2 text-[13px] text-off-white/55">{hero.tagline}</p>}
                <div className="mt-4 flex items-center gap-4">
                  <DropPrice
                    product={hero}
                    priceCls="text-[18px] font-bold text-green"
                    compareCls="text-[14px] text-off-white/40 line-through"
                  />
                  <Link
                    to={`/products/${hero.slug}`}
                    className="rounded-full bg-green px-[16px] py-[7px] text-[12px] font-bold text-black"
                  >
                    Shop Now →
                  </Link>
                </div>
              </div>
            </article>

            <div className="grid gap-px lg:grid-rows-2">
              {sideTiles.map((p) => (
                <article key={p.slug} className="flex flex-col">
                  <DropArt product={p} className="aspect-[3/4]" />
                  <div className="px-6 py-5 lg:px-5">
                    <h2 className="text-[18px] font-bold tracking-[-0.01em]">{p.name}</h2>
                    {p.tagline && <p className="mt-1 text-[12px] text-off-white/55">{p.tagline}</p>}
                    <div className="mt-3 flex items-center gap-3">
                      <DropPrice
                        product={p}
                        priceCls="text-[16px] font-bold text-green"
                        compareCls="text-[12px] text-off-white/40 line-through"
                      />
                      <Link
                        to={`/products/${p.slug}`}
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

          {gridTiles.length > 0 && (
            /* ── Product row (41:70) — up to four tiles, height follows
                the photos' own ~3:4 ratio rather than a fixed pixel box ── */
            <section className="bg-[#0a0a0a] px-6 py-16 lg:px-16 lg:py-[40px]">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {gridTiles.map((p) => (
                  <article key={p.slug}>
                    <Link to={`/products/${p.slug}`}>
                      <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-[#141414] text-[#4A4A4A]">
                        <DropArt product={p} className="absolute inset-0" />
                      </div>
                    </Link>
                    <h3 className="mt-4 text-[15px] font-bold tracking-[-0.01em]">{p.name}</h3>
                    {p.colors?.[0]?.name && (
                      <p className="mt-1 text-[12px] text-off-white/50">{p.colors[0].name}</p>
                    )}
                    <div className="mt-2">
                      <DropPrice
                        product={p}
                        priceCls="text-[15px] font-bold text-green"
                        compareCls="text-[12px] text-off-white/40 line-through"
                      />
                    </div>
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
          )}
        </>
      )}

      {!isLoading && !hero && (
        <section className="bg-black px-6 py-20 text-center lg:px-16">
          <p className="text-[14px] text-off-white/50">
            Drop 01 is being curated — check back shortly.
          </p>
        </section>
      )}

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
