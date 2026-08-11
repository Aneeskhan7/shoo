import { Link } from 'react-router-dom';

/** 404 — no Figma frame; built from the hero's dark surface + ghost wordmark. */
export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black px-6 text-center text-off-white">
      <p
        aria-hidden="true"
        className="pointer-events-none absolute select-none font-black leading-[0.9]"
        style={{
          fontSize: 'clamp(180px, 32vw, 460px)',
          letterSpacing: '-0.06em',
          color: 'rgba(245,244,240,0.07)',
        }}
      >
        404
      </p>

      <div className="relative">
        <p className="text-eyebrow text-green">Page not found</p>
        <h1 className="text-display-l mt-6">This one’s out of stock.</h1>
        <p className="mt-6 text-[16px] text-off-white/60">
          The page you’re after doesn’t exist — or it moved.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rounded-full bg-green px-8 py-[18px] text-[14px] font-bold text-black">
            Back home
          </Link>
          <Link
            to="/shop"
            className="rounded-full border border-off-white/30 px-8 py-[18px] text-[14px] font-medium"
          >
            Browse the Collection →
          </Link>
        </div>
      </div>
    </div>
  );
}
