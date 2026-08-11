import { Link } from 'react-router-dom';
import { formatPrice } from '../ui/Price';

/**
 * Section — Comfort You Can Feel (Figma 38:100). Eight 370×230 tiles in a
 * 2-column grid on the left, heading block at x=900 on the right.
 *
 * These are comfort tiers, not catalogue products — the prices are the
 * design's own copy and don't map to a seeded product (dummy PKR figures,
 * same placeholder scale as the rest of the catalogue). Each tile has its
 * own dedicated photo (client/public/assets/editorial/comfort-<id>.webp,
 * 1600×893 ≈1.79:1) matched to its name — three even have the tier name
 * baked into the shoe itself (Active Pro, Street Prime, Motion Lite).
 */
const TIERS = [
  { name: 'Active Pro', note: 'Performance-focused', price: 15500, image: 'comfort-active-pro' },
  { name: 'Everyday Comfort', note: 'Soft daily support', price: 18500, image: 'comfort-everyday-comfort' },
  { name: 'Classic Walk', note: 'Timeless comfort', price: 10000, image: 'comfort-classic-walk' },
  { name: 'Street Prime', note: 'Premium + durable', price: 13500, image: 'comfort-street-prime' },
  { name: 'Street Runner', note: 'Daily movement', price: 12500, image: 'comfort-street-runner' },
  { name: 'Motion Lite', note: 'Ultra-light', price: 17000, image: 'comfort-motion-lite' },
  { name: 'Urban Flex', note: 'Lightweight', price: 11000, image: 'comfort-urban-flex' },
  { name: 'City Step', note: 'Clean everyday', price: 12500, image: 'comfort-city-step' },
];

export default function ComfortSection() {
  return (
    <section className="bg-off-white py-20 text-black lg:py-[72px]">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-12 px-6 lg:flex-row lg:items-start lg:gap-[58px] lg:px-20">
        <div className="order-2 grid flex-1 grid-cols-1 gap-x-[22px] gap-y-[18px] sm:grid-cols-2 lg:order-1">
          {TIERS.map((tier, i) => (
            <article key={tier.name} className="w-full">
              <div
                className="relative aspect-[370/168] w-full overflow-hidden rounded-[6px]"
                style={{ background: i % 2 === 0 ? '#F2F2F2' : '#E5E5E0' }}
              >
                <img
                  src={`/assets/editorial/${tier.image}.webp`}
                  alt={tier.name}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex items-center gap-2 pt-[10px]">
                <div className="flex flex-col gap-[3px]">
                  <p className="text-[13px] font-semibold tracking-[-0.005em]">{tier.name}</p>
                  <p className="text-[10px] text-grey-500">{tier.note}</p>
                </div>
                <p className="ml-2 text-[11px] font-medium tracking-[0.04em]">
                  {formatPrice(tier.price)}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="order-1 lg:order-2 lg:w-[440px] lg:pt-[0px]">
          <p className="text-eyebrow text-grey-500">03 — COLLECTION</p>
          <h2
            className="mt-[38px] font-black tracking-[-0.04em]"
            style={{ fontSize: 'clamp(44px, 6.67vw, 96px)', lineHeight: 0.9 }}
          >
            COMFORT YOU
            <br />
            CAN FEEL
          </h2>
          <p className="mt-[38px] max-w-[280px] text-[14px] leading-[1.55] text-grey-700">
            Designed to support your feet with lasting comfort, all day and every day.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-flex items-center rounded-full bg-black px-[22px] py-[14px] text-[13px] font-semibold tracking-[0.02em] text-off-white transition-opacity hover:opacity-85"
          >
            Shop all →
          </Link>
        </div>
      </div>
    </section>
  );
}
