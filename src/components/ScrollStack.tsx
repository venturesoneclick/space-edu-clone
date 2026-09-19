import { useLayoutEffect, useRef, useCallback, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import './ScrollStack.css';

/* ─────────────────────────── Item ─────────────────────────────────────── */
interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
}
export const ScrollStackItem = ({ children, itemClassName = '' }: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

/* ─────────────────────────── Container ────────────────────────────────── */
interface ScrollStackProps {
  children:         ReactNode;
  className?:       string;
  itemDistance?:    number;
  itemScale?:       number;
  itemStackDistance?: number;
  stackPosition?:   string | number;
  scaleEndPosition?: string | number;
  baseScale?:       number;
  scaleDuration?:   number;
  rotationAmount?:  number;
  blurAmount?:      number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}
type TCache = { translateY: number; scale: number; rotation: number; blur: number };

const ScrollStack = ({
  children,
  className         = '',
  itemDistance      = 100,
  itemScale         = 0.03,
  itemStackDistance = 30,
  stackPosition     = '20%',
  scaleEndPosition  = '10%',
  baseScale         = 0.85,
  scaleDuration     = 0.5,
  rotationAmount    = 0,
  blurAmount        = 0,
  useWindowScroll   = false,
  onStackComplete,
}: ScrollStackProps) => {
  const scrollerRef    = useRef<HTMLDivElement>(null);
  const stackDoneRef   = useRef(false);
  const rafRef         = useRef<number>(0);
  const lenisRef       = useRef<Lenis | null>(null);
  const cardsRef       = useRef<HTMLElement[]>([]);
  const transformCache = useRef(new Map<number, TCache>());
  const lockRef        = useRef(false);

  /* ── Key fix: pre-transform offsets cached at mount ────────────────────
     getBoundingClientRect() is affected by CSS transform; we must read
     element positions ONCE before any transforms are applied and reuse
     those static values on every subsequent frame.                       */
  const offsetCache    = useRef(new Map<HTMLElement, number>());

  /* helpers */
  const prog = useCallback((cur: number, s: number, e: number) => {
    if (cur <= s) return 0;
    if (cur >= e) return 1;
    return (cur - s) / (e - s);
  }, []);

  const parsePct = useCallback((v: string | number, h: number) => {
    if (typeof v === 'string' && v.includes('%')) return (parseFloat(v) / 100) * h;
    return parseFloat(String(v));
  }, []);

  const scrollTop = useCallback(() =>
    useWindowScroll ? window.scrollY : (scrollerRef.current?.scrollTop ?? 0),
  [useWindowScroll]);

  const vh = useCallback(() =>
    useWindowScroll ? window.innerHeight : (scrollerRef.current?.clientHeight ?? 0),
  [useWindowScroll]);

  /* ── docTop: returns the INITIAL (pre-transform) document offset ────── */
  const docTop = useCallback((el: HTMLElement): number => {
    const cached = offsetCache.current.get(el);
    if (cached !== undefined) return cached;
    // Fallback (should not hit during animation):
    return useWindowScroll ? el.getBoundingClientRect().top + window.scrollY : el.offsetTop;
  }, [useWindowScroll]);

  /* ── core per-frame update ───────────────────────────────────────────── */
  const update = useCallback(() => {
    if (!cardsRef.current.length || lockRef.current) return;
    lockRef.current = true;

    const st   = scrollTop();
    const h    = vh();
    const pinP = parsePct(stackPosition,    h);
    const endP = parsePct(scaleEndPosition, h);

    const endEl  = useWindowScroll
      ? document.querySelector<HTMLElement>('.scroll-stack-end')
      : scrollerRef.current?.querySelector<HTMLElement>('.scroll-stack-end');
    const endTop = endEl ? docTop(endEl) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop  = docTop(card);
      const pinStart = cardTop - pinP - itemStackDistance * i;
      const pinEnd   = endTop  - h / 2;

      /* scale */
      const sp          = prog(st, pinStart, cardTop - endP);
      const targetScale = baseScale + i * itemScale;
      const scale       = 1 - sp * (1 - targetScale);
      const rotation    = rotationAmount ? i * rotationAmount * sp : 0;

      /* blur */
      let blur = 0;
      if (blurAmount) {
        let topIdx = 0;
        cardsRef.current.forEach((c, j) => {
          if (st >= docTop(c) - pinP - itemStackDistance * j) topIdx = j;
        });
        if (i < topIdx) blur = Math.max(0, (topIdx - i) * blurAmount);
      }

      /* translateY (pin the card in place while stacking) */
      let ty = 0;
      if      (st >= pinStart && st <= pinEnd) ty = st  - cardTop + pinP + itemStackDistance * i;
      else if (st >  pinEnd)                   ty = pinEnd - cardTop + pinP + itemStackDistance * i;

      const next: TCache = {
        translateY: Math.round(ty       * 100)  / 100,
        scale:      Math.round(scale    * 1000) / 1000,
        rotation:   Math.round(rotation * 100)  / 100,
        blur:       Math.round(blur     * 100)  / 100,
      };
      const prev  = transformCache.current.get(i);
      const dirty =
        !prev ||
        Math.abs(prev.translateY - next.translateY) > 0.1   ||
        Math.abs(prev.scale      - next.scale)      > 0.001 ||
        Math.abs(prev.rotation   - next.rotation)   > 0.1   ||
        Math.abs(prev.blur       - next.blur)        > 0.1;

      if (dirty) {
        card.style.transform = `translate3d(0,${next.translateY}px,0) scale(${next.scale}) rotate(${next.rotation}deg)`;
        card.style.filter    = next.blur > 0 ? `blur(${next.blur}px)` : '';
        transformCache.current.set(i, next);
      }

      if (i === cardsRef.current.length - 1) {
        const inView = st >= pinStart && st <= pinEnd;
        if  (inView && !stackDoneRef.current) { stackDoneRef.current = true;  onStackComplete?.(); }
        if (!inView &&  stackDoneRef.current)   stackDoneRef.current = false;
      }
    });

    lockRef.current = false;
  }, [
    itemScale, itemStackDistance, stackPosition, scaleEndPosition,
    baseScale, rotationAmount, blurAmount, useWindowScroll, onStackComplete,
    prog, parsePct, scrollTop, vh, docTop,
  ]);

  /* ── scroll driver ───────────────────────────────────────────────────── */
  const setupScroll = useCallback(() => {
    if (useWindowScroll) {
      /* Hook into the app's GSAP ticker (which drives the main Lenis).
         This fires AFTER Lenis updates window.scrollY — always fresh.    */
      gsap.ticker.add(update);
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const lenis = new Lenis({
        wrapper:         scroller,
        content:         scroller.querySelector('.scroll-stack-inner') as HTMLElement,
        duration:        1.2,
        easing:          (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel:     true,
        touchMultiplier: 2,
        normalizeWheel: true,
        wheelMultiplier: 1,
        lerp:            0.1,
        syncTouch:       true,
        syncTouchLerp:   0.075,
      });
      lenis.on('scroll', update);
      const raf = (t: number) => { lenis.raf(t); rafRef.current = requestAnimationFrame(raf); };
      rafRef.current = requestAnimationFrame(raf);
      lenisRef.current = lenis;
    }
  }, [useWindowScroll, update]);

  /* ── mount / unmount ─────────────────────────────────────────────────── */
  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll<HTMLElement>('.scroll-stack-card')
        : scroller.querySelectorAll<HTMLElement>('.scroll-stack-card')
    );
    cardsRef.current = cards;
    const tc = transformCache.current;
    const oc = offsetCache.current;
    oc.clear();

    /* Set up each card — NO transforms yet so BoundingClientRect is clean */
    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      card.style.willChange         = 'transform, filter';
      card.style.transformOrigin    = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform          = 'translateZ(0)';
      card.style.perspective        = '1000px';
    });

    /* ── Cache pre-transform offsets ─────────────────────────────────────
       Must happen AFTER card layout (margins set) but BEFORE any
       transform is written, so getBoundingClientRect is unaffected.     */
    cards.forEach(card => {
      const off = useWindowScroll
        ? card.getBoundingClientRect().top + window.scrollY
        : card.offsetTop;
      oc.set(card, off);
    });

    /* Also cache the end-sentinel position */
    const endEl = useWindowScroll
      ? document.querySelector<HTMLElement>('.scroll-stack-end')
      : scroller.querySelector<HTMLElement>('.scroll-stack-end');
    if (endEl) {
      oc.set(endEl,
        useWindowScroll
          ? endEl.getBoundingClientRect().top + window.scrollY
          : endEl.offsetTop
      );
    }

    /* Start the scroll driver, then seed the first frame */
    setupScroll();
    update();

    /* Re-cache on resize so positions stay accurate after layout changes */
    const onResize = () => {
      oc.clear();
      cards.forEach(card => {
        // Temporarily remove transform to read true offset
        const saved = card.style.transform;
        card.style.transform = 'none';
        oc.set(card,
          useWindowScroll
            ? card.getBoundingClientRect().top + window.scrollY
            : card.offsetTop
        );
        card.style.transform = saved;
      });
      if (endEl) {
        const savedE = endEl.style.transform;
        endEl.style.transform = 'none';
        oc.set(endEl,
          useWindowScroll
            ? endEl.getBoundingClientRect().top + window.scrollY
            : endEl.offsetTop
        );
        endEl.style.transform = savedE;
      }
    };
    window.addEventListener('resize', onResize, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      if (useWindowScroll) {
        gsap.ticker.remove(update);
      } else {
        cancelAnimationFrame(rafRef.current);
        lenisRef.current?.destroy();
        lenisRef.current = null;
      }
      stackDoneRef.current = false;
      cardsRef.current     = [];
      tc.clear();
      oc.clear();
      lockRef.current      = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    itemDistance, itemScale, itemStackDistance, stackPosition, scaleEndPosition,
    baseScale, scaleDuration, rotationAmount, blurAmount, useWindowScroll,
  ]);

  return (
    <div
      ref={scrollerRef}
      className={[
        'scroll-stack-scroller',
        useWindowScroll ? 'scroll-stack-window' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
