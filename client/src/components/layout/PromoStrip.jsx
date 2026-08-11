import { Link } from 'react-router-dom';

/**
 * PromoStrip — persistent campaign bar directly below the navbar. The
 * Lookbook is deliberately kept out of the main nav, so this strip is its
 * only site-wide discovery entry point.
 *
 * Sits in the same absolute overlay layer as Navbar (top: nav-height, 84px)
 * rather than in normal flow, so it never touches Navbar itself. Pages whose
 * first section would otherwise sit flush under it (Checkout, Search,
 * ProductPage) add matching top clearance.
 */
export default function PromoStrip() {
  return (
    <div className="absolute inset-x-0 top-[84px] z-40 h-[36px] overflow-hidden lg:h-[44px]">
      <Link
        to="/lookbook"
        aria-label="Drop 01 — Step into the future. Explore the SHOO Lookbook."
        className="group flex h-full w-full items-center justify-center gap-[10px] border-y border-off-white/12 bg-black px-4 transition-colors duration-300 hover:bg-[#121212]"
      >
        <span className="flex items-center gap-[8px] whitespace-nowrap text-[10px] font-medium tracking-[0.1em] text-off-white/70 transition-colors duration-300 group-hover:text-off-white/90 lg:gap-[10px] lg:text-[11px]">
          <span className="font-bold tracking-[0.08em] text-off-white">DROP 01</span>
          <span aria-hidden="true" className="text-off-white/30">
            —
          </span>
          <span>STEP INTO THE FUTURE</span>
          <span
            aria-hidden="true"
            className="text-green transition-transform duration-300 ease-out group-hover:translate-x-[3px]"
          >
            →
          </span>
        </span>
      </Link>
    </div>
  );
}
