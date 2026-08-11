import { Link } from 'react-router-dom';

/**
 * About — Figma 39:256 (1440×3004). Six sections, alternating surfaces:
 *   39:270 hero      720  #0A0A0A  — EST. 2024 pill, 120px Black, green rule
 *   39:276 story     640  #F5F4F0  — 96px title, 640px copy, stat rail at x=900
 *   39:292 values    600  #F2F2F2  — 72px title, four 48px-icon cards
 *   39:315 team      480  #0A0A0A  — 72px title, three #1A1A1A cards
 *   39:333 press     200  #F5F4F0  — five #D3D3D3 wordmarks at 24px Black
 *   39:341 cta       280  #0A0A0A  — centred 72px + two pills
 */
const STATS = [
  ['120+', 'Brands carried globally'],
  ['2.4K', 'Pairs sold in first drop'],
  ['4.9★', 'Avg. customer rating'],
  ['2026', 'Global launch year'],
];

const VALUES = [
  ['◇', 'Curated, not random', 'Every shoe is personally tested. We carry brands that earn their place — no filler.'],
  ['⟲', 'Sustainability focus', 'We prioritise brands with strong sustainability practices and push the rest to do better.'],
  ['⚡', 'Accessibility', 'Premium footwear shouldn’t be a luxury tax. We price SHOO for the people who actually wear shoes.'],
  ['◈', 'Transparency', 'Our margins and sourcing criteria are available on request. No smoke, no mirrors.'],
];

const TEAM = [
  ['Anees Khan', 'Founder & Creative Director', '“Every shoe we carry is the shoe I searched for and couldn’t find in one place.”'],
  ['Bilal Rana', 'Head of Product', '“We test every pair before it lists. If it doesn’t pass, it doesn’t ship — simple.”'],
  ['Sarah Mir', 'Head of Brand', '“SHOO is not a product. It’s a position. And we’re not moving.”'],
];

const PRESS = ['Hypebeast', 'Highsnobiety', 'Sole Collector', 'Complex', 'Sneaker Freaker'];

export default function AboutPage() {
  return (
    <div className="bg-off-white text-black">
      {/* ── Hero (39:270) — dark. The frame is 720px tall but starts at y=84
             under the overlaying nav, so the section is 804px and every
             absolute offset below is Figma's value + 84. ─────────────── */}
      <section className="relative flex min-h-[560px] flex-col bg-black px-6 pb-16 pt-[148px] text-off-white xl:h-[804px] lg:px-20 xl:pb-0 lg:pt-[148px]">
        <span className="inline-flex w-fit items-center rounded-full bg-green px-[14px] py-[8px] text-[10px] font-bold tracking-[0.12em] text-black">
          EST. 2024
        </span>

        <h1
          className="mt-[26px] font-black tracking-[-0.04em]"
          style={{ fontSize: 'clamp(44px, 8.33vw, 120px)', lineHeight: 0.88 }}
        >
          We don’t make
          <br />
          shoes. We find
          <br />
          the best ones.
        </h1>

        <p className="mt-10 max-w-[240px] text-[18px] leading-[1.5] text-off-white/75 xl:absolute xl:left-[1140px] xl:top-[652px] xl:mt-0">
          Born in Pakistan.
          <br />
          Curating the world.
        </p>

        <span className="mt-10 block h-[2px] w-[240px] bg-green xl:absolute xl:left-20 xl:top-[776px] xl:mt-0" />
      </section>

      {/* ── Our Story (39:276) — off-white, 640px ────────────── */}
      <section className="bg-off-white px-6 py-20 xl:h-[640px] lg:px-20 xl:py-0">
        <div className="mx-auto max-w-[1440px] xl:relative xl:h-full">
          <h2
            className="font-black tracking-[-0.03em] xl:absolute xl:left-0 xl:top-20"
            style={{ fontSize: 'clamp(44px, 6.67vw, 96px)', lineHeight: 0.88 }}
          >
            Our Story
          </h2>

          <div className="mt-10 flex max-w-[640px] flex-col gap-6 text-[17px] leading-[1.7] text-grey-700 xl:absolute xl:left-0 xl:top-[280px] xl:mt-0">
            <p>SHOO started with a single question: why is finding the right shoe so hard?</p>
            <p>
              Too many options, too little curation. We cut through the noise — sourcing premium
              footwear from the brands and makers who obsess over the details, then bringing it to
              you with zero markup games.
            </p>
            <p>
              We test every shoe we carry. We negotiate hard so you don’t overpay. And we stand
              behind every pair — returns, sizing advice, the lot.
            </p>
            <p>This is for the people who move.</p>
          </div>

          <div className="mt-14 flex flex-col gap-[48px] xl:absolute xl:left-[820px] xl:top-[120px] xl:mt-0">
            {STATS.map(([value, label]) => (
              <div key={label} className="flex flex-col gap-[8px]">
                <p
                  className="font-black tracking-[-0.03em]"
                  style={{ fontSize: 'clamp(44px, 5vw, 72px)', lineHeight: 1 }}
                >
                  {value}
                </p>
                <p className="w-[280px] text-[14px] tracking-[0.02em] text-grey-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What we stand for (39:292) — #F2F2F2, 600px ──────── */}
      <section className="bg-[#F2F2F2] px-6 py-20 lg:h-[600px] lg:px-20 lg:py-[60px]">
        <div className="mx-auto max-w-[1440px]">
          <h2
            className="font-black tracking-[-0.02em]"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)', lineHeight: 0.9 }}
          >
            What we stand for
          </h2>

          <div className="mt-14 grid gap-[24px] sm:grid-cols-2 xl:grid-cols-4">
            {VALUES.map(([icon, title, body]) => (
              <div
                key={title}
                className="flex flex-col gap-[14px] rounded-[8px] bg-white p-[28px]"
              >
                <span
                  className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-green text-[22px] font-bold text-black"
                  aria-hidden="true"
                >
                  {icon}
                </span>
                <h3 className="text-[24px] font-black tracking-[-0.01em]">{title}</h3>
                <p className="text-[13px] leading-[1.55] text-grey-700">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Behind SHOO (39:315) — dark, 480px ───────────────── */}
      <section className="bg-black px-6 py-20 text-off-white lg:h-[480px] lg:px-20 lg:py-[60px]">
        <div className="mx-auto max-w-[1440px]">
          <h2
            className="font-black tracking-[-0.02em]"
            style={{ fontSize: 'clamp(36px, 5vw, 72px)' }}
          >
            Behind SHOO
          </h2>

          <div className="mt-12 grid gap-[40px] md:grid-cols-2 lg:grid-cols-3">
            {TEAM.map(([name, role, quote]) => (
              <div
                key={name}
                className="flex flex-col gap-[14px] rounded-[8px] bg-[#1A1A1A] p-[28px]"
              >
                <span
                  className="h-[52px] w-[52px] rounded-full bg-[#333333]"
                  aria-hidden="true"
                />
                <p className="text-[18px] font-bold tracking-[-0.01em]">{name}</p>
                <p className="text-[12px] tracking-[0.02em] text-green">{role}</p>
                <p className="text-[13px] leading-[1.55] text-off-white/80">{quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── As seen in (39:333) — off-white, 200px ───────────── */}
      <section className="bg-off-white px-6 py-16 lg:h-[200px] lg:px-20 lg:py-[64px]">
        <div className="mx-auto max-w-[1440px]">
          <p className="text-eyebrow text-grey-500">As seen in</p>
          <div className="mt-[26px] flex flex-wrap items-center gap-x-[60px] gap-y-6">
            {PRESS.map((p) => (
              <span
                key={p}
                className="text-[24px] font-black tracking-[-0.01em] text-[#D3D3D3]"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (39:341) — dark, 280px, centred ──────────────── */}
      <section className="flex flex-col items-center bg-black px-6 py-20 text-center text-off-white lg:h-[280px] lg:py-[60px]">
        <h2
          className="font-black tracking-[-0.03em]"
          style={{ fontSize: 'clamp(32px, 5vw, 72px)' }}
        >
          Ready to move differently?
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-[16px]">
          <Link
            to="/shop"
            className="rounded-full bg-green px-[32px] py-[16px] text-[14px] font-bold tracking-[0.02em] text-black transition-opacity hover:opacity-85"
          >
            Shop Now →
          </Link>
          <Link
            to="/lookbook"
            className="rounded-full border border-[#4D4D4D] bg-white px-[32px] py-[16px] text-[14px] font-semibold tracking-[0.02em] text-grey-700 transition-opacity hover:opacity-85"
          >
            View Lookbook
          </Link>
        </div>
      </section>
    </div>
  );
}
