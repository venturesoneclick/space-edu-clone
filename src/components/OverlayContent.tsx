import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SpecularButton from './SpecularButton';

gsap.registerPlugin(ScrollTrigger);

export default function OverlayContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const stages = gsap.utils.toArray('.scroll-stage') as HTMLElement[];

    stages.forEach((stage, i) => {
      const content = stage.querySelector('.content-block');
      if (!content) return;

      const isLast   = i === stages.length - 1; // Stage 4 — content sits at bottom
      const isStage3 = i === 2;                  // Stage 3 — sticky dwell section

      if (isLast) {
        // Content is at the bottom of a 150vh section, so trigger when the
        // bottom of the stage approaches the viewport bottom.
        gsap.fromTo(content,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: stage,
              start: "70% bottom",
              end: "bottom bottom",
              scrub: 0.6,
            },
          }
        );
        // No fade-out for the last stage — let it stay visible.
        return;
      }

      // Stage 3 gets a generous dwell window; all others use a standard 50/50 split.
      const fadeInEnd    = isStage3 ? "20% center" : "center center";
      const fadeOutStart = isStage3 ? "80% center" : "center center";

      gsap.fromTo(content,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: stage,
            start: "top center",
            end: fadeInEnd,
            scrub: 0.5,
          },
        }
      );

      gsap.to(content, {
        opacity: 0,
        y: -50,
        scrollTrigger: {
          trigger: stage,
          start: fadeOutStart,
          end: "bottom center",
          scrub: 0.5,
        },
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div id="main-scroll-container" ref={containerRef} className="relative z-10 w-full pointer-events-none">
      
      {/* Stage 1: Initial View */}
      <section className="scroll-stage h-[100vh] flex items-center px-6 md:px-24">
        <div className="content-block max-w-xl pointer-events-auto mt-24">
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6">
            <span className="block">Building India's next</span>
            <span className="block -mt-3 md:-mt-4">generation</span>
            <span className="block">of businesses.</span>
          </h1>
          <p className="text-white/70 text-lg mb-10 leading-relaxed font-light">
            OneClick Ventures is a platform-first venture engine based in Pune. We explore market gaps, engage the right buyers, and enable every brand we build with shared infrastructure, compliance, and go-to-market systems — so businesses reach revenue faster than they thought possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <a href="#how-we-work" className="bg-white text-void px-8 py-4 rounded-full font-medium hover:bg-accent-cyan hover:text-void transition-colors uppercase tracking-wider text-sm flex items-center gap-2 cursor-pointer">
              See How We Work <span>→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Stage 2: The Terminator */}
      <section className="scroll-stage h-[100vh] flex items-center justify-end px-6 md:px-24">
        <div className="content-block max-w-lg pointer-events-auto text-right">
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight mb-6">
            Everything your business needs. Under one firm.
          </h2>
          <p className="text-white/70 text-lg mb-8 leading-relaxed font-light ml-auto">
            With every service under one roof and one accountable team, your supply chain moves the way your business demands: predictably, transparently, and without excuses.
            <br/><br/>
            That means no finger-pointing between vendors. No delays lost in handoffs. Just one team, accountable from origin to destination.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-end items-center">
            <SpecularButton
              size="md"
              radius={999}
              tintOpacity={0}
              blur={0}
              textColor="#ffffff"
              lineColor="#ffffff"
              baseColor="#525252"
              intensity={1}
              shineSize={10}
              shineFade={40}
              thickness={1}
              speed={0.35}
              followMouse
              proximity={250}
              autoAnimate={false}
            >
              Learn More About Us &rsaquo;
            </SpecularButton>
          </div>
        </div>
      </section>

      {/* Stage 3: The Blue Marble */}
      <section className="scroll-stage h-[200vh] flex items-start justify-center px-6">
        <div className="content-block max-w-2xl pointer-events-auto text-center sticky top-[50vh] -translate-y-1/2">
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight mb-6">
            See the whole of it in a single frame
          </h2>
          <p className="text-text-muted text-lg mb-8 leading-relaxed font-light mx-auto max-w-xl">
            Step back far enough and the coastlines, the currents and the weather stop being separate subjects. Six sessions follow one planet from its molten-first hour out to the thin shell of air holding all of it together.
          </p>
          <button className="bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-void px-10 py-4 rounded-full font-medium transition-all uppercase tracking-wider text-sm mx-auto block cursor-pointer">
            START THE MODULE
          </button>
        </div>
      </section>

      {/* Stage 4: Planet Earth */}
      <section className="scroll-stage h-[150vh] flex flex-col justify-end px-6 md:px-24 pb-32">
        <div className="content-block max-w-5xl mx-auto w-full pointer-events-auto text-center">
          <h1
            className="font-serif text-[8vw] leading-tight tracking-tighter mb-8"
            style={{
              background: 'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.4) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            RELIABILITY<br />AT EVERY MILESTONE
          </h1>
          <p className="text-white/70 text-xl max-w-2xl mx-auto mb-12 font-light">
            End-to-End Business Validation.<br/>
            We provide comprehensive business validation to ensure your next venture is market-ready and operationally flawless.
          </p>
        </div>
      </section>

    </div>
  );
}
