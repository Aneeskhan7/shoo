import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../../hooks/useSmoothScroll';

gsap.registerPlugin(ScrollTrigger);

/**
 * Hero — Figma 38:3 (State 1) → 38:46 (State 3). State 2 (38:35) is a
 * documentation frame describing the transition, not a third layout, so the
 * scrubbed timeline interpolates directly between the two real states.
 *
 * Geometry is expressed as percentages of the 1440×900 frame so the desktop
 * layout scales exactly; below 1024px it falls back to a stacked flow layout
 * (inferred — the file has no sub-1440 frames).
 */
// Hero photos are static site assets (assets/hero/), deliberately not tied
// to the product catalogue — this section must keep rendering even when the
// catalogue is empty or those specific products are removed in admin.
const STATES = [
  {
    name: 'SHOO DRIFT ONE',
    slug: 'shoo-drift-one',
    heroImage: '/assets/hero/shoo-drift-one.webp',
    colorName: 'Deep Noir',
    releaseDate: '2026-01-15',
    tagline: ["Don't chase energy. Wear SHOO.", 'Own your power. Every move, a message.'],
  },
  {
    name: 'SHOO ORBIT LX',
    slug: 'shoo-orbit-lx',
    heroImage: '/assets/hero/shoo-orbit-lx.webp',
    colorName: 'Bone White',
    releaseDate: '2026-02-20',
    tagline: ['Move differently. SHOO ORBIT LX.', 'Built for the long walk.'],
  },
];

// Exact fills read from both frames; GSAP tweens between the two columns.
const THEME = {
  1: {
    '--hero-bg': '#0A0A0A',
    '--hero-fg': '#F5F4F0',
    '--hero-wordmark': 'rgba(245,244,240,0.14)',
    '--hero-thumb': '#262626',
    '--hero-border': 'rgba(245,244,240,0.35)',
  },
  3: {
    '--hero-bg': '#F5F4F0',
    '--hero-fg': '#0A0A0A',
    '--hero-wordmark': 'rgba(10,10,10,0.09)',
    '--hero-thumb': '#F2F2F2',
    '--hero-border': 'rgba(10,10,10,0.25)',
  },
};

/**
 * Product photo, occupying roughly the same bounding box the Figma frame's
 * abstract sole+ellipse shape used (~42% × 48%, centred). No frame or plate
 * behind it — `object-contain` shows just the shoe against the hero's own
 * background.
 */
function HeroImage({ src, alt, style, opacity = 1, eager = false }) {
  return (
    <div
      className="absolute flex items-center justify-center transition-opacity duration-700"
      style={{ left: '29%', top: '25%', width: '42%', height: '50%', opacity, ...style }}
    >
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className="h-full w-full object-contain"
      />
    </div>
  );
}

function ProductInfo({ state, innerRef, className = '', style }) {
  return (
    <div ref={innerRef} className={className} style={style}>
      <Link to={`/products/${state.slug}`} className="transition-opacity hover:opacity-70">
        <h2
          className="whitespace-nowrap font-bold tracking-[-0.01em]"
          style={{ fontSize: 'clamp(22px, 2.22vw, 32px)' }}
        >
          {state.name}
        </h2>
      </Link>
      {/* Meta is left-aligned inside a right-aligned group (Figma x=1216). */}
      <div className="mt-[10px] flex justify-end">
        <div
          className="text-left font-medium tracking-[0.04em] opacity-55"
          style={{ fontSize: 'clamp(10px, 0.764vw, 11px)', lineHeight: 1.9 }}
        >
          <p>RELEASE DATE · {state.releaseDate}</p>
          <p>COLOR ONE · {state.colorName}</p>
        </div>
      </div>
      <div className="mt-[22px] flex justify-end gap-[8px]">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-[10px]"
            style={{
              width: 'clamp(56px, 5.56vw, 80px)',
              aspectRatio: '1',
              background: 'var(--hero-thumb)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const sectionRef = useRef(null);
  const wordmarkRef = useRef(null);
  const shoeRef = useRef(null);
  const state1Ref = useRef(null);
  const state3Ref = useRef(null);
  const scrollIndRef = useRef(null);
  const [active, setActive] = useState(0);

  // Mobile/tablet — same pin + crossfade mechanic as desktop (one state
  // fills the screen, the next replaces it on scroll), just without the
  // 1440×900 frame's absolute-percentage geometry, which was never built
  // for a narrow/tall viewport.
  const mobileSectionRef = useRef(null);
  const mobileStateRefs = useRef([]);
  const mobileShoeRefs = useRef([]);

  // useLayoutEffect, not useEffect: a plain useEffect's cleanup is a passive
  // effect, deferred to run after paint. On a fast client-side route change,
  // React can start removing this section's DOM for the new route before
  // that deferred cleanup has actually called ctx.revert() — so ScrollTrigger
  // is still mid-pin (its pin-spacer still wrapping the section) when React's
  // commit tries to remove a node it last recorded a different parent for,
  // throwing "removeChild: node is not a child of this node" and crashing
  // the whole tree (every route went solid black until a hard refresh).
  // useLayoutEffect's cleanup runs synchronously in the same commit, so
  // revert() is guaranteed to finish before React proceeds.
  useLayoutEffect(() => {
    const reduced = prefersReducedMotion();
    if (reduced) return undefined;

    const desktop = window.matchMedia('(min-width: 1024px)').matches;

    const ctx = gsap.context(() => {
      if (desktop) {
        // No opacity here (position/rotate only) — this is the page's LCP
        // element. Animating its opacity meant the browser couldn't count
        // it as painted until the elastic bounce visually settled, pushing
        // LCP out by however long that took (measured live: LCP ~5.2s vs.
        // FCP ~1.2s). Staying fully opaque throughout keeps the drop+
        // rotate motion but makes the shoe paintable on frame one.
        gsap.from(shoeRef.current, {
          y: -380,
          rotate: -10,
          duration: 1.4,
          ease: 'elastic.out(1, 0.65)',
          delay: 0.25,
        });
        gsap.from(wordmarkRef.current, {
          opacity: 0,
          y: 40,
          duration: 1,
          ease: 'power3.out',
        });
        gsap.from([state1Ref.current, scrollIndRef.current], {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power2.out',
          delay: 0.5,
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: '+=200%',
            pin: true,
            pinType: 'fixed',
            scrub: 1.2,
            anticipatePin: 1,
            onUpdate: (self) => setActive(self.progress > 0.5 ? 1 : 0),
          },
        });

        tl.to(sectionRef.current, { ...THEME[3], ease: 'none' }, 0);
        tl.to(wordmarkRef.current, { yPercent: 12, ease: 'none' }, 0);
        tl.to(shoeRef.current, { yPercent: 14, scale: 0.88, ease: 'none' }, 0);
        tl.to(shoeRef.current, { yPercent: 0, scale: 1, ease: 'none' }, 0.6);
        tl.to(state1Ref.current, { opacity: 0, ease: 'none' }, 0.25);
        tl.fromTo(state3Ref.current, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0.55);
        tl.to(scrollIndRef.current, { opacity: 0, ease: 'none' }, 0);
      } else {
        // Same one-at-a-time pin+crossfade as desktop: state 0 fills the
        // screen, scrolling one viewport's worth swaps it for state 1 —
        // just a straight opacity crossfade of two full-screen blocks
        // instead of desktop's richer multi-property scrub, since the
        // mobile states don't share desktop's absolute-positioned pieces
        // to interpolate individually.
        // Same LCP reasoning as the desktop branch above — no opacity anim.
        gsap.from(mobileShoeRefs.current[0], {
          y: -380,
          rotate: -10,
          duration: 1.4,
          ease: 'elastic.out(1, 0.65)',
          delay: 0.25,
        });

        gsap
          .timeline({
            scrollTrigger: {
              trigger: mobileSectionRef.current,
              start: 'top top',
              end: '+=100%',
              pin: true,
              pinType: 'fixed',
              scrub: 1,
              anticipatePin: 1,
            },
          })
          .to(mobileStateRefs.current[0], { opacity: 0, ease: 'none' }, 0)
          .fromTo(mobileStateRefs.current[1], { opacity: 0 }, { opacity: 1, ease: 'none' }, 0);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      {/* ── Desktop: pinned, scrubbed 1440×900 stage ─────────────── */}
      <section
        ref={sectionRef}
        aria-label="Featured releases"
        className="relative hidden h-screen w-full overflow-hidden lg:block"
        style={{ ...THEME[1], background: 'var(--hero-bg)', color: 'var(--hero-fg)' }}
      >
        {/* Decorative — the real, keyword-bearing <h1> lives in
            HomePage.jsx (visually hidden) so it doesn't fight this
            wordmark's design. ref-based, not tag-based, so demoting this
            from h1 to p doesn't touch the GSAP pin/scrub animation below. */}
        <p
          ref={wordmarkRef}
          aria-hidden="true"
          className="pointer-events-none absolute select-none whitespace-nowrap font-black"
          style={{
            left: '4.826%',
            top: '26.667%',
            fontSize: '31.944vw',
            lineHeight: 0.9,
            letterSpacing: '-0.06em',
            color: 'var(--hero-wordmark)',
          }}
        >
          SHOO
        </p>

        <div ref={shoeRef} className="absolute inset-0">
          <HeroImage
            src={STATES[0].heroImage}
            alt={`${STATES[0].name} — ${STATES[0].colorName} sneaker`}
            opacity={active === 0 ? 1 : 0}
            eager
          />
          <HeroImage
            src={STATES[1].heroImage}
            alt={`${STATES[1].name} — ${STATES[1].colorName} sneaker`}
            opacity={active === 1 ? 1 : 0}
          />
        </div>

        {/* Tagline + carousel arrows */}
        <div className="absolute" style={{ left: '4.444%', top: '73.333%', width: '280px' }}>
          <div className="relative h-[44px]">
            {STATES.map((s, i) => (
              <p
                key={s.slug}
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  fontSize: 'clamp(13px, 0.97vw, 14px)',
                  lineHeight: 1.55,
                  opacity: active === i ? 0.8 : 0,
                }}
              >
                {s.tagline[0]}
                <br />
                {s.tagline[1]}
              </p>
            ))}
          </div>
          <div className="mt-[18px] flex gap-[12px]">
            {['←', '→'].map((arrow, i) => (
              <button
                key={arrow}
                type="button"
                aria-label={i === 0 ? 'Previous product' : 'Next product'}
                onClick={() => setActive(i === 0 ? 0 : 1)}
                className="flex h-[44px] w-[44px] items-center justify-center rounded-full border text-[16px] font-medium transition-opacity hover:opacity-60"
                style={{ borderColor: 'var(--hero-border)' }}
              >
                {arrow}
              </button>
            ))}
          </div>
        </div>

        {/* Product info — both states stacked, crossfaded by the timeline */}
        <ProductInfo
          innerRef={state1Ref}
          state={STATES[0]}
          className="absolute text-right"
          style={{ right: '4.444%', top: '69.778%' }}
        />
        <ProductInfo
          innerRef={state3Ref}
          state={STATES[1]}
          className="absolute text-right opacity-0"
          style={{ right: '4.444%', top: '69.778%' }}
        />

        <div
          ref={scrollIndRef}
          className="absolute flex flex-col items-center gap-[7px]"
          style={{ left: '50%', top: '93.889%', transform: 'translateX(-50%)' }}
        >
          <span className="text-[9px] font-medium tracking-[0.16em] opacity-45">SCROLL</span>
          <span className="h-[28px] w-px opacity-40" style={{ background: 'var(--hero-fg)' }} />
        </div>
      </section>

      {/* ── Below 1024: same pin+crossfade idea, mobile-sized ────────
          Both states are absolutely stacked in one 100svh box; state 1
          starts at opacity 0 baked directly into the style (not GSAP) so
          it's still there — just not hidden forever — for anyone on
          reduced motion or before JS runs. */}
      <section
        ref={mobileSectionRef}
        className="relative h-[100svh] w-full overflow-hidden lg:hidden"
        aria-label="Featured releases"
      >
        {STATES.map((s, i) => {
          const theme = THEME[i === 0 ? 1 : 3];
          return (
            <div
              key={s.slug}
              ref={(el) => (mobileStateRefs.current[i] = el)}
              className="absolute inset-0 overflow-hidden"
              style={{
                ...theme,
                background: 'var(--hero-bg)',
                color: 'var(--hero-fg)',
                opacity: i === 0 ? 1 : 0,
              }}
            >
              <p
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-[30%] z-0 select-none whitespace-nowrap font-black"
                style={{
                  fontSize: '38vw',
                  lineHeight: 0.9,
                  letterSpacing: '-0.06em',
                  color: 'var(--hero-wordmark)',
                }}
              >
                SHOO
              </p>
              {/* Shoe and text are independently positioned now (shoe from
                  the top, text from the bottom) so each can be tuned on its
                  own without the other moving — z-10 keeps both painting
                  above the SHOO wordmark where the shoe overlaps it. */}
              <div
                ref={(el) => (mobileShoeRefs.current[i] = el)}
                className="absolute inset-x-0 top-[36%] z-10 -mt-[104px] px-6"
              >
                <div className="relative -mx-6 aspect-[1440/900] w-[calc(100%+48px)] max-w-[640px]">
                  <HeroImage
                    src={s.heroImage}
                    alt={`${s.name} — ${s.colorName} sneaker`}
                    style={{ left: '24%', top: '20%', width: '52%', height: '60%' }}
                  />
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-8 z-10 px-6">
                <p className="max-w-[280px] text-[14px] leading-[1.55] opacity-80">
                  {s.tagline[0]} {s.tagline[1]}
                </p>
                <Link to={`/products/${s.slug}`} className="mt-6 block">
                  <h2 className="text-[26px] font-bold tracking-[-0.01em]">{s.name}</h2>
                </Link>
                <p className="mt-3 text-[11px] font-medium leading-[1.9] tracking-[0.04em] opacity-55">
                  RELEASE DATE · {s.releaseDate}
                  <br />
                  COLOR ONE · {s.colorName}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}
