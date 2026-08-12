import { Link } from 'react-router-dom';

/**
 * Section — Collection. Off-white surface, a vertical "COLLECTION" wordmark
 * rotated -90°, and three category bands.
 *
 * Band images are dedicated banner photos (client/public/assets/editorial/
 * collection-<slug>.webp) with the label + subtitle already composited into
 * the photo — not a product image, so they don't go through the product
 * image map.
 *
 * Band box is 920×520 (≈1.77:1), matching the source photos' own ~1.72–1.83:1
 * shape almost exactly — deliberately NOT the Figma-literal 920×268 (≈3.43:1).
 * That shape only fit the old abstract placeholder art; with a real photo it
 * forced a choice between cropping into the shoe or leaving half the band
 * empty. Matching the photos' proportions shows the whole shoe with only a
 * sliver of `cover` crop.
 */
const BAND_HEIGHT = 520;
const BAND_GAP = 24;

const BANDS = [
  { label: 'Runners', bg: '#EDEDED', image: 'collection-runners', to: '/shop?category=runners' },
  { label: 'Lifestyle', bg: '#DEC799', image: 'collection-lifestyle', to: '/shop?category=lifestyle' },
  { label: 'Sport Essentials', bg: '#142126', image: 'collection-sport-essentials', to: '/shop' },
];

function BandArt({ image, label }) {
  return (
    <img
      src={`/assets/editorial/${image}.webp`}
      alt={label}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover"
      style={{ objectPosition: 'left bottom' }}
    />
  );
}

// Real measured metrics for "COLLECTION" at font-black / -3% tracking
// (checked with a live off-screen render, not guessed): unrotated width
// ≈6.24× font-size (becomes the rotated column's HEIGHT), unrotated line
// height ≈1.5× font-size (becomes the rotated column's WIDTH). The width
// figure is the binding constraint — the column sits between the text above
// it (left-100) and the cards (left-380), so it can only grow so wide before
// it collides with one or the other.
const WORDMARK_WIDTH_RATIO = 1.5;
const WORDMARK_HEIGHT_RATIO = 6.24;
const WORDMARK_LEFT = 70;
const WORDMARK_TOP = 250; // clears the eyebrow + 3-line paragraph above it
const CARD_LEFT = 380;
const CARD_CLEARANCE = 15;

export default function CollectionSection() {
  const stackTop = 76;
  const stackHeight = BANDS.length * BAND_HEIGHT + (BANDS.length - 1) * BAND_GAP;
  const stackBottom = stackTop + stackHeight;
  const sectionHeight = stackBottom + 76;

  // Largest size that still leaves CARD_CLEARANCE px before the cards start.
  const wordmarkFontSize = Math.floor(
    (CARD_LEFT - WORDMARK_LEFT - CARD_CLEARANCE) / WORDMARK_WIDTH_RATIO,
  );
  const wordmarkHeight = Math.round(wordmarkFontSize * WORDMARK_HEIGHT_RATIO);

  return (
    <section className="relative bg-off-white pb-20 pt-6 text-black xl:py-0">
      <div className="px-6 xl:hidden">
        <p className="text-eyebrow text-[15px] text-grey-500">02 — EXPLORE OUR</p>
        {/* Bleeds past the 24px page margin (unlike the eyebrow/paragraph
            above and below it) so it reads as a big, edge-to-edge heading.
            Font size is calibrated against "COLLECTION"'s actual rendered
            width at this tracking/weight, not guessed — it's a single
            unbreakable word, so an oversized clamp here causes real
            horizontal-scroll, not just clipping. */}
        <h2 className="mt-4 -mx-6 px-3 text-[clamp(50px,14.5vw,62px)] font-black leading-[0.9] tracking-[-0.03em]">
          COLLECTION
        </h2>
        <p className="mt-6 max-w-[220px] text-[13px] leading-[1.65] text-grey-700">
          Find the perfect balance of comfort and design, created to move with your lifestyle.
        </p>
      </div>

      {/* The 1440 frame's absolute layout is 1300px wide (380 + 920), so it only
          fits from xl up; 1024 and below get the stacked layout. */}
      <div
        className="relative mx-auto hidden w-full max-w-[1440px] xl:block"
        style={{ height: sectionHeight }}
      >
        {/* Eyebrow + paragraph share the left-100 margin, moved down a little
            from the section top. The wordmark sits below them (left-70, so
            it isn't fighting them for the same column) and is scaled to the
            largest size that still clears the cards horizontally — see the
            constants above. That size reaches well past the middle of the
            last card, which is as close as "starts at the first card" can
            get without the text overlapping either the paragraph above it
            or the cards beside it. */}
        <p className="text-eyebrow absolute left-[100px] top-[110px] text-grey-500">
          02 — EXPLORE OUR
        </p>
        <p className="absolute left-[100px] top-[150px] w-[260px] text-[13px] leading-[1.65] text-grey-700">
          Find the perfect balance of comfort and design, created to move with your lifestyle.
        </p>
        <div
          className="absolute"
          style={{ left: WORDMARK_LEFT, top: WORDMARK_TOP, height: wordmarkHeight, width: wordmarkFontSize * WORDMARK_WIDTH_RATIO }}
        >
          <p
            className="absolute origin-top-left -rotate-90 whitespace-nowrap font-black tracking-[-0.03em]"
            style={{ fontSize: wordmarkFontSize, top: wordmarkHeight }}
          >
            COLLECTION
          </p>
        </div>

        {BANDS.map((band, i) => (
          <Link
            key={band.label}
            to={band.to}
            className="group absolute left-[380px] w-[920px] overflow-hidden rounded-[8px] transition-transform duration-500 hover:scale-[1.01]"
            style={{ top: stackTop + i * (BAND_HEIGHT + BAND_GAP), height: BAND_HEIGHT, background: band.bg }}
          >
            {/* Label + subtitle are already composited into the photo —
                no separate text overlay here (the <img alt> covers a11y). */}
            <BandArt {...band} />
          </Link>
        ))}

        {/* Floats over the middle (Lifestyle) band, vertically centered on it. */}
        <Link
          to="/shop"
          className="absolute left-[1200px] inline-flex items-center rounded-full bg-black px-[22px] py-[14px] text-[13px] font-semibold tracking-[0.02em] text-off-white transition-opacity hover:opacity-85"
          style={{ top: stackTop + BAND_HEIGHT + BAND_GAP + BAND_HEIGHT / 2 - 29 }}
        >
          Explore more →
        </Link>
      </div>

      {/* Below xl: the same three bands, stacked and full-bleed. */}
      <div className="mt-10 flex flex-col gap-4 px-6 xl:hidden">
        {BANDS.map((band) => (
          <Link
            key={band.label}
            to={band.to}
            className="relative aspect-[920/520] w-full overflow-hidden rounded-[8px]"
            style={{ background: band.bg }}
          >
            <BandArt {...band} />
          </Link>
        ))}
        <Link
          to="/shop"
          className="mt-2 inline-flex w-fit items-center rounded-full bg-black px-[22px] py-[14px] text-[13px] font-semibold text-off-white"
        >
          Explore more →
        </Link>
      </div>
    </section>
  );
}
