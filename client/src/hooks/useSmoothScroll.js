import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Drives Lenis from GSAP's ticker and pushes each frame into ScrollTrigger.
 * Without this handshake, scrubbed timelines lag a frame behind the smooth
 * scroll position and every pinned section jitters.
 */
export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });

    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Lenis drives scroll itself (wheel/touch listeners → its own virtual
    // position), so `body.style.overflow: hidden` alone doesn't stop it —
    // an open overlay (mobile menu, cart drawer) needs to call
    // window.__lenis.stop()/.start() directly to actually block scroll.
    window.__lenis = lenis;

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);
}
