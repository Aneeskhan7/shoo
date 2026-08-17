import { Link } from 'react-router-dom';
import Seo from '../components/seo/Seo';
import { SITE } from '../lib/seo';

/**
 * Careers — no open roles right now. Early-stage team, so this stays
 * honest rather than padding out fabricated listings: a clear "nothing
 * open" note, an invite to follow for when that changes, and a channel
 * for speculative interest.
 */
export default function CareersPage() {
  return (
    <div className="bg-off-white text-black">
      <Seo
        title="Careers"
        description="SHOO is a small, early-stage team. No open roles right now — here's how to stay in the loop or reach out anyway."
        canonical="/careers"
      />

      <section className="relative flex min-h-[420px] flex-col justify-center bg-black px-6 py-24 text-off-white lg:px-20">
        <span className="inline-flex w-fit items-center rounded-full bg-green px-[14px] py-[8px] text-[10px] font-bold tracking-[0.12em] text-black">
          CAREERS
        </span>
        <h1
          className="mt-[26px] font-black tracking-[-0.04em]"
          style={{ fontSize: 'clamp(40px, 7vw, 96px)', lineHeight: 0.9 }}
        >
          We're small,
          <br />
          on purpose.
        </h1>
      </section>

      <section className="bg-off-white px-6 py-20 lg:px-20">
        <div className="mx-auto flex max-w-[720px] flex-col gap-6 text-[17px] leading-[1.7] text-grey-700">
          <p>
            SHOO is run by a small team, and right now we don't have any open roles. When that
            changes, we'll post it here — not on a job board, not through a recruiter.
          </p>
          <p>
            If you think you'd be a strong fit down the line, we're still happy to hear from you.
            Send a short note and whatever shows your work to{' '}
            <a href={`mailto:${SITE.email}`} className="font-semibold text-black underline underline-offset-4">
              {SITE.email}
            </a>{' '}
            — we read everything, even when we can't act on it immediately.
          </p>
          <p>Otherwise, the fastest way to hear about it first is to follow along.</p>
        </div>

        <div className="mx-auto mt-10 flex max-w-[720px] flex-wrap gap-3">
          {SITE.sameAs.map((url) => {
            const label = url.includes('instagram')
              ? 'Instagram'
              : url.includes('facebook')
                ? 'Facebook'
                : url.includes('tiktok')
                  ? 'TikTok'
                  : url.includes('pinterest')
                    ? 'Pinterest'
                    : url;
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-[#d3d3d3] px-[20px] py-[10px] text-[13px] font-medium text-grey-700 transition-colors hover:border-black hover:text-black"
              >
                {label}
              </a>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col items-center bg-black px-6 py-20 text-center text-off-white lg:py-24">
        <h2 className="font-black tracking-[-0.03em]" style={{ fontSize: 'clamp(32px, 5vw, 64px)' }}>
          Not hiring, but always looking.
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
