import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useSmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    // ── Sync Lenis scroll events → ScrollTrigger position updates ──────────
    lenis.on('scroll', ScrollTrigger.update);

    // ── Drive Lenis through GSAP ticker so scrub animations stay frame-perfect
    // GSAP time is in seconds; Lenis.raf expects milliseconds.
    const ticker = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);

    // Prevent lag spikes from causing ScrollTrigger scrub to jump on tab focus
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, []);
};
