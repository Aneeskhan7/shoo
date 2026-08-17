import { Link } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import { SITE } from '../lib/seo';

/**
 * Press — media contact + a minimal kit (boilerplate + logo). Deliberately
 * doesn't reproduce AboutPage's "As seen in" outlet list here: that section
 * needs the user to confirm those are real placements before this page
 * cites them as coverage — see the flag in the SEO plan.
 */
const FOUNDER_QUOTE = {
  name: 'Haris Saqib',
  role: 'Founder and Director',
  quote: '“Every shoe we carry is the shoe I searched for and couldn’t find in one place.”',
};

export default function PressPage() {
  return (
    <div className="bg-off-white text-black">
      <Seo
        title="Press"
        description="Media resources for SHOO — company boilerplate, a founder quote, brand assets, and how to reach us for press inquiries."
        canonical="/press"
      />

      <section className="relative flex min-h-[420px] flex-col justify-center bg-black px-6 py-24 text-off-white lg:px-20">
        <span className="inline-flex w-fit items-center rounded-full bg-green px-[14px] py-[8px] text-[10px] font-bold tracking-[0.12em] text-black">
          PRESS
        </span>
        <h1
          className="mt-[26px] font-black tracking-[-0.04em]"
          style={{ fontSize: 'clamp(40px, 7vw, 96px)', lineHeight: 0.9 }}
        >
          Press &amp; media
        </h1>
      </section>

      <section className="bg-off-white px-6 py-20 lg:px-20">
        <div className="mx-auto max-w-[720px]">
          <h2 className="text-eyebrow text-grey-500">Boilerplate</h2>
          <div className="mt-5 flex flex-col gap-6 text-[17px] leading-[1.7] text-grey-700">
            <p>
              SHOO curates premium sneakers and streetwear, sourced from brands and makers who
              obsess over the details. Founded in Pakistan, SHOO cuts through the noise of
              too-many-options retail with hands-on curation — no markup games, no filler.
            </p>
          </div>

          <h2 className="mt-16 text-eyebrow text-grey-500">Founder</h2>
          <div className="mt-5 rounded-[8px] bg-[#F2F2F2] p-[28px]">
            <p className="text-[18px] font-bold tracking-[-0.01em]">{FOUNDER_QUOTE.name}</p>
            <p className="mt-1 text-[12px] tracking-[0.02em] text-grey-500">{FOUNDER_QUOTE.role}</p>
            <p className="mt-4 text-[15px] leading-[1.6] text-grey-700">{FOUNDER_QUOTE.quote}</p>
          </div>

          <h2 className="mt-16 text-eyebrow text-grey-500">Brand assets</h2>
          <p className="mt-5 text-[15px] leading-[1.6] text-grey-700">
            The SHOO logo is available for editorial use.
          </p>
          <a
            href={SITE.logo}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex w-fit items-center rounded-full border border-[#d3d3d3] px-[20px] py-[10px] text-[13px] font-medium text-grey-700 transition-colors hover:border-black hover:text-black"
          >
            View logo →
          </a>

          <h2 className="mt-16 text-eyebrow text-grey-500">Contact</h2>
          <p className="mt-5 text-[15px] leading-[1.6] text-grey-700">
            For interviews, quotes, or anything else press-related, reach us directly —
          </p>
          <a
            href={`mailto:${SITE.email}`}
            className="mt-3 inline-block text-[15px] font-semibold text-black underline underline-offset-4"
          >
            {SITE.email}
          </a>
        </div>
      </section>

      <section className="flex flex-col items-center bg-black px-6 py-20 text-center text-off-white lg:py-24">
        <h2 className="font-black tracking-[-0.03em]" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>
          Want the full story?
        </h2>
        <div className="mt-10 flex flex-wrap justify-center gap-[16px]">
          <Link
            to="/about"
            className="rounded-full bg-green px-[32px] py-[16px] text-[14px] font-bold tracking-[0.02em] text-black transition-opacity hover:opacity-85"
          >
            About SHOO →
          </Link>
        </div>
      </section>
    </div>
  );
}
