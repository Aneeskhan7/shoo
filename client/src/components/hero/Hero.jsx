import { useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../../hooks/useSmoothScroll';
import ProductImage from '../ui/ProductImage';

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
const STATES = [
  {
    name: 'SHOO DRIFT ONE',
    slug: 'shoo-drift-one',
    colorName: 'Deep Noir',
    releaseDate: '2026-01-15',
    tagline: ["Don't chase energy. Wear SHOO.", 'Own your power. Every move, a message.'],
  },
  {
    name: 'SHOO ORBIT LX',
    slug: 'shoo-orbit-lx',
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
function HeroImage({ slug, style, opacity = 1, eager = false }) {
  return (
    <div
      className="absolute flex items-center justify-center transition-opacity duration-700"
      style={{ left: '29%', top: '25%', width: '42%', height: '50%', opacity, ...style }}
    >
      <ProductImage product={{ slug }} fit="contain" eager={eager} />
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
    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    // Pinning a touch viewport hijacks the scroll; both are opt-outs.
    if (reduced || !desktop) return undefined;

    const ctx = gsap.context(() => {
      gsap.from(shoeRef.current, {
        y: -380,
        opacity: 0,
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
        <h1
          ref={wordmarkRef}
          aria-label="SHOO"
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
        </h1>

        <div ref={shoeRef} className="absolute inset-0">
          <HeroImage slug={STATES[0].slug} opacity={active === 0 ? 1 : 0} eager />
          <HeroImage slug={STATES[1].slug} opacity={active === 1 ? 1 : 0} />
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

      {/* ── Below 1024: stacked static states, no pinning ─────────── */}
      <section className="lg:hidden" aria-label="Featured releases">
        {STATES.map((s, i) => {
          const theme = THEME[i === 0 ? 1 : 3];
          return (
            <div
              key={s.slug}
              className="relative flex min-h-[560px] flex-col justify-end overflow-hidden px-6 pb-12 pt-[104px]"
              style={{ ...theme, background: 'var(--hero-bg)', color: 'var(--hero-fg)' }}
            >
              <p
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-[18%] select-none whitespace-nowrap font-black"
                style={{
                  fontSize: '38vw',
                  lineHeight: 0.9,
                  letterSpacing: '-0.06em',
                  color: 'var(--hero-wordmark)',
                }}
              >
                SHOO
              </p>
              <div className="relative mx-auto aspect-[1440/900] w-full max-w-[560px]">
                <HeroImage slug={s.slug} />
              </div>
              <p className="mt-8 max-w-[280px] text-[14px] leading-[1.55] opacity-80">
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
          );
        })}
      </section>
    </>
  );
}
