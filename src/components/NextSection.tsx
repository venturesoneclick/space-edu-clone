/**
 * NextSection.tsx
 * ─────────────────────────────────────────────────────────────
 * Scroll-driven "Features Tabs" section.
 *
 * Architecture:
 *  • Intro panel  – 90 vh light section. The inner text card is pinned by
 *    GSAP ScrollTrigger while the wrapper scrolls off-screen.
 *  • Tabs panel   – dark rounded section. Uses 550 vh of scroll height so a
 *    sticky inner layout stays fixed while the user scrolls through 3 tabs.
 *    The active tab (text + video) is driven by the raw scroll position,
 *    mirroring the original vanilla JS logic using React refs & state.
 *
 * Lenis / GSAP sync is handled globally in useSmoothScroll; we only register
 * ScrollTrigger here for the intro-pin.
 * ─────────────────────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

// ─── Tab data ──────────────────────────────────────────────────────────────────
interface TabDef {
  id: number;
  headingText: string;
  headingHighlight: string;
  headingHighlightPosition: 'prefix' | 'suffix' | 'middle';
  headingParts: [string, string, string]; // [before, highlight, after]
  body: string;
  bodyIsRich?: boolean;
  videoMp4: string;
  videoWebm: string;
  badge: string | null;
}

const TABS: TabDef[] = [
  {
    id: 1,
    headingText: 'Reinventing micro-mobility with Award winning design',
    headingHighlight: 'Award winning',
    headingHighlightPosition: 'middle',
    headingParts: ['Reinventing micro-mobility with ', 'Award winning', ' design'],
    body: 'Our mission is to close the gap between a scooter and a bike. Yoda is the lightest vehicle of its category, designed to be agile and fun for everyone to ride.',
    videoMp4:
      'https://assets-global.website-files.com/65ae37af356fab4845432048/65be0fdac914d702e08f70ed_Yoda-Helmet_1-transcode.mp4',
    videoWebm:
      'https://assets-global.website-files.com/65ae37af356fab4845432048/65be0fdac914d702e08f70ed_Yoda-Helmet_1-transcode.webm',
    badge:
      'https://assets-global.website-files.com/65ae37af356fab4845432048/65b0dc37d226a551affbf2ea_GDA24_HO_WINNER_MC_RGB.webp',
  },
  {
    id: 2,
    headingText: 'Best in class energy management for optimal autonomy',
    headingHighlight: 'optimal autonomy',
    headingHighlightPosition: 'suffix',
    headingParts: ['Best in class energy management for ', 'optimal autonomy', ''],
    body: '3 riding modes: 🌱 eco, ⚡️ normal & 🚀 boost — that offer up to 80 km range on one single charge with a swappable battery.',
    videoMp4:
      'https://assets-global.website-files.com/65ae37af356fab4845432048/65ae37af356fab48454320ae_BatteryRemoval_Pingpong_001-transcode.mp4',
    videoWebm:
      'https://assets-global.website-files.com/65ae37af356fab4845432048/65ae37af356fab48454320ae_BatteryRemoval_Pingpong_001-transcode.webm',
    badge: null,
  },
  {
    id: 3,
    headingText: 'Durable and effortless, all the way',
    headingHighlight: 'all the way',
    headingHighlightPosition: 'suffix',
    headingParts: ['Durable and effortless, ', 'all the way', ''],
    body: 'We spent years crafting Yoda, stripping away unnecessary components to deliver a simple and efficient mobility experience.',
    bodyIsRich: true,
    videoMp4:
      'https://assets-global.website-files.com/65ae37af356fab4845432048/65be104f9aba74d774b7f4a3_Yoda-Exploded-50-transcode.mp4',
    videoWebm:
      'https://assets-global.website-files.com/65ae37af356fab4845432048/65be104f9aba74d774b7f4a3_Yoda-Exploded-50-transcode.webm',
    badge: null,
  },
];

const TOTAL_TABS = TABS.length;

// ─── Component ─────────────────────────────────────────────────────────────────
export default function NextSection() {
  const introWrapperRef = useRef<HTMLDivElement>(null);
  const introPinRef     = useRef<HTMLDivElement>(null);
  const tabsSectionRef  = useRef<HTMLElement>(null);

  const [activeTab, setActiveTab] = useState(0);

  // ── GSAP: pin the intro text card while intro wrapper scrolls away ──────────
  useGSAP(
    () => {
      if (!introWrapperRef.current || !introPinRef.current) return;

      ScrollTrigger.create({
        trigger: introWrapperRef.current,
        start: 'top top',
        end: 'bottom top',
        pin: introPinRef.current,
        pinSpacing: false,
      });
    },
    { scope: introWrapperRef }
  );

  // ── Passive scroll listener — drives active tab via raw scroll position ─────
  // Mirrors original vanilla JS but scoped to the section's offset.
  const handleScroll = useCallback(() => {
    if (!tabsSectionRef.current) return;

    const sectionTop = tabsSectionRef.current.getBoundingClientRect().top + window.scrollY;
    const scrollPos  = window.scrollY - sectionTop;
    const windowH    = window.innerHeight + 550; // matches original +550 offset
    const lastIdx    = TOTAL_TABS - 1;

    let next = 0;
    for (let i = 0; i < TOTAL_TABS; i++) {
      if (scrollPos >= i * windowH && scrollPos < (i + 1) * windowH) {
        next = i;
      }
    }
    if (scrollPos > lastIdx * windowH) {
      next = lastIdx;
    }

    setActiveTab(next);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // ── Post-mount ScrollTrigger refresh (lets Lenis recalculate heights) ───────
  useEffect(() => {
    const id = setTimeout(() => {
      ScrollTrigger.refresh();
      window.dispatchEvent(new Event('resize'));
    }, 150);
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      {/* ──────────────────────── INTRO WRAPPER ──────────────────────── */}
      <div
        ref={introWrapperRef}
        className="relative flex justify-center items-center z-[1] bg-[#f8f8f8]"
        style={{ height: '90vh' }}
      >
        {/* Pinned by GSAP ScrollTrigger */}
        <div
          ref={introPinRef}
          id="js-pin"
          className="absolute w-full flex justify-center items-center"
          style={{ top: '50px', willChange: 'transform, opacity' }}
        >
          <div
            className="w-full text-center mx-auto px-6"
            style={{ maxWidth: '30rem' }}
          >
            <div style={{ marginBottom: '0', marginTop: '3.5rem' }}>
              <h2
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '-0.02em',
                  fontSize: '2.8125rem',
                  fontWeight: 500,
                  lineHeight: 1,
                  color: '#141414',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    borderBottom: '3px solid #61ffc9',
                    paddingBottom: '2px',
                  }}
                >
                  149€/month
                </span>{' '}
                &amp; not a single worry
              </h2>
            </div>
            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontSize: '1.125rem',
                color: '#737373',
                marginBottom: 0,
              }}
            >
              We take care of registration, insurance, and maintenance to ensure
              you have a hassle-free ride!{' '}
              <sup
                style={{
                  fontSize: '75%',
                  lineHeight: 0,
                  position: 'relative',
                  verticalAlign: 'baseline',
                  top: 0,
                }}
              >
                *including theft coverage under certain conditions.
              </sup>
            </p>
          </div>
        </div>
      </div>

      {/* ──────────────────────── TABS SECTION ───────────────────────── */}
      <section
        ref={tabsSectionRef}
        style={{
          zIndex: 2,
          borderRadius: '2rem',
          backgroundColor: '#292929',
          position: 'relative',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {/* Padding wrapper */}
        <div
          style={{
            paddingTop: '7rem',
            paddingBottom: '7rem',
            position: 'relative',
          }}
          className="max-sm:!pt-8 max-sm:!pb-0"
        >
          {/* Scroll height driver — 550 vh gives room for 3 tab transitions */}
          <div
            style={{ height: '550vh' }}
            className="max-sm:!h-[600vh]"
          >
            {/* Sticky viewport container */}
            <div
              style={{ height: '100vh', position: 'sticky', top: '5vh' }}
            >
              {/* Max-width centering */}
              <div
                style={{
                  width: '100%',
                  maxWidth: '120rem',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  height: '100%',
                }}
              >
                {/* Two-column grid */}
                <div
                  style={{
                    height: '90vh',
                    display: 'grid',
                    gridTemplateColumns: '0.4fr 1fr',
                    gap: '1.5rem',
                    paddingLeft: '3.3%',
                    paddingRight: '3.3%',
                  }}
                  className="max-sm:!grid-cols-1"
                >
                  {/* ── LEFT PANEL ── */}
                  <LeftPanel activeTab={activeTab} />

                  {/* ── RIGHT PANEL (Videos) ── */}
                  <RightPanel activeTab={activeTab} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom breathing room */}
      <div style={{ height: '50vh' }} />
    </>
  );
}

// ─── Left Panel ────────────────────────────────────────────────────────────────
function LeftPanel({ activeTab }: { activeTab: number }) {
  return (
    <div
      style={{
        borderRadius: '1.25rem',
        backgroundColor: '#424242',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        padding: '1.5rem',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translate3d(0,0,0)',
      }}
    >
      {/* Content slots — all rendered, CSS opacity controls visibility */}
      <div style={{ height: '100%', position: 'relative', flex: 1 }}>
        {TABS.map((tab, i) => (
          <div
            key={tab.id}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-around',
              textAlign: 'center',
              opacity: activeTab === i ? 1 : 0,
              transition: 'opacity 0.5s',
              paddingTop: 0,
              paddingBottom: 0,
            }}
            aria-hidden={activeTab !== i}
          >
            {/* Heading */}
            <h2
              style={{
                letterSpacing: '-0.02em',
                fontSize: '2.125rem',
                fontWeight: 500,
                lineHeight: 1.05,
                color: 'whitesmoke',
                margin: 0,
              }}
              className="max-sm:!text-[20px] max-sm:!m-0"
            >
              {tab.headingParts[0]}
              <span style={{ color: '#61ffc9' }}>{tab.headingParts[1]}</span>
              {tab.headingParts[2]}
            </h2>

            {/* Divider */}
            <div style={{ width: '100%', height: '1px', backgroundColor: '#737373' }} />

            {/* Body */}
            <p
              style={{ fontSize: '1rem', color: '#a3a3a3', margin: 0 }}
              className="max-sm:!text-[0.875rem]"
            >
              {tab.bodyIsRich ? (
                <>
                  We spent years crafting Yoda, stripping away unnecessary
                  components to deliver a <strong>simple</strong> and{' '}
                  <strong>efficient</strong> mobility experience.
                </>
              ) : (
                tab.body
              )}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1.5rem' }}>
        <OrderButton />
      </div>
    </div>
  );
}

// ─── Right Panel ───────────────────────────────────────────────────────────────
function RightPanel({ activeTab }: { activeTab: number }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        borderRadius: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translate3d(0,0,0)',
      }}
    >
      {TABS.map((tab, i) => (
        <div
          key={tab.id}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1.25rem',
            overflow: 'hidden',
            opacity: activeTab === i ? 1 : 0,
            transition: 'opacity 0.5s',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
          }}
          aria-hidden={activeTab !== i}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: 0,
            }}
          >
            <source src={tab.videoMp4} type="video/mp4" />
            <source src={tab.videoWebm} type="video/webm" />
          </video>

          {tab.badge && (
            <img
              src={tab.badge}
              alt="German Design Award Winner 2024"
              loading="lazy"
              style={{
                width: '5rem',
                marginTop: '2rem',
                marginRight: '2rem',
                objectFit: 'cover',
                position: 'relative',
                zIndex: 2,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Order Button ──────────────────────────────────────────────────────────────
function OrderButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        overflow: 'hidden',
        borderRadius: '0.6rem',
        border: '1px solid #61ffc9',
        backgroundColor: 'transparent',
        color: hovered ? '#292929' : '#fcfcfc',
        padding: '0.6rem 1.35rem',
        fontSize: '0.875rem',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        transition: 'color 0.6s',
        position: 'relative',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'translate3d(0,0,0)',
        fontFamily: 'Poppins, sans-serif',
      }}
      aria-label="Order today"
    >
      {/* Expanding fill circle — replicates .button-circlee animation */}
      <span
        style={{
          position: 'absolute',
          left: '50%',
          borderRadius: '100vw',
          backgroundColor: '#61ffc9',
          width: hovered ? '120%' : '80%',
          height: '250px',
          transform: hovered
            ? 'translate(-50%, -43%) translate3d(0,0,0)'
            : 'translate(-50%, 100%) translate3d(0,0,0)',
          transition: 'transform 0.6s ease-in-out, width 0.6s ease-in-out',
          pointerEvents: 'none',
          willChange: 'transform, width',
        }}
      />
      <span style={{ position: 'relative', zIndex: 2, fontWeight: 500 }}>
        Order today
      </span>
      {/* Arrow icon */}
      <span
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '1.25rem',
          height: '1.25rem',
          borderRadius: '100vw',
          overflow: 'hidden',
        }}
      >
        <svg
          height="1rem"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4.667 11.333L11.334 4.667"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.667 4.667H11.334V11.334"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
  );
}
