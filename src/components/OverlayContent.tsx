import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function OverlayContent() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const stages = gsap.utils.toArray('.scroll-stage') as HTMLElement[];

    stages.forEach((stage) => {
      const content = stage.querySelector('.content-block');
      if (content) {
        gsap.fromTo(content, 
          { opacity: 0, y: 50 },
          { 
            opacity: 1, 
            y: 0, 
            scrollTrigger: {
              trigger: stage,
              start: "top center",
              end: "center center",
              scrub: 0.5
            }
          }
        );
        gsap.to(content, {
          opacity: 0,
          y: -50,
          scrollTrigger: {
            trigger: stage,
            start: "center center",
            end: "bottom center",
            scrub: 0.5
          }
        });
      }
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
          <div className="font-mono text-accent-cyan text-sm tracking-widest mb-6 border border-accent-cyan/30 bg-accent-cyan/10 inline-block px-3 py-1 rounded">
            (1) AUTUMN COHORT - 2026
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-light leading-tight mb-6">
            Take the seat<br/>by the window
          </h1>
          <p className="text-text-muted text-lg mb-8 leading-relaxed font-light">
            One planet, six weeks, and a telescope feed that never cuts away. You keep the recordings, the raw imagery and the reading list for a year after the cohort closes.
          </p>
          <div className="flex flex-col gap-4 mb-8">
            <div className="font-mono text-xs text-text-subtle tracking-widest">SIX LIVE SESSIONS - RECORDED FOR A YEAR - STARTS 14 OCTOBER</div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
            <button className="bg-white text-void px-8 py-4 rounded-full font-medium hover:bg-accent-cyan hover:text-void transition-colors uppercase tracking-wider text-sm flex items-center gap-2 cursor-pointer">
              Reserve a ticket <span>→</span>
            </button>
            <a href="#" className="text-sm font-medium hover:text-white transition-colors border-b border-white/30 pb-1">Read the syllabus first</a>
          </div>
          <p className="text-xs text-text-subtle mt-8 opacity-70">
            Early Bird pricing held for a week. Tickets transferred freely up to 48 hours before the first session.
          </p>
        </div>
      </section>

      {/* Stage 2: The Terminator */}
      <section className="scroll-stage h-[100vh] flex items-center justify-end px-6 md:px-24">
        <div className="content-block max-w-lg pointer-events-auto text-right">
          <div className="font-mono text-accent-dawn text-sm tracking-widest mb-6">
            SESSION 04
          </div>
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-tight mb-6">
            Half of it is always dark.<br/>That half never sleeps.
          </h2>
          <p className="text-text-muted text-lg mb-8 leading-relaxed font-light ml-auto">
            The line between day and night crosses the surface at 1,670 kilometres an hour, and almost everything worth watching happens along it: storm systems spinning up, ice shelves letting go, the ocean giving back the heat it spent all day taking in.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-end items-center">
            <a href="#" className="text-sm font-medium hover:text-white transition-colors">SEE THE SYLLABUS</a>
            <button className="border border-white/30 hover:border-white px-8 py-3 rounded-full font-medium transition-colors uppercase tracking-wider text-sm cursor-pointer">
              WATCH THE SESSION &gt;
            </button>
          </div>
        </div>
      </section>

      {/* Stage 3: The Blue Marble */}
      <section className="scroll-stage h-[100vh] flex items-center justify-center px-6">
        <div className="content-block max-w-2xl pointer-events-auto text-center mt-[40vh]">
          <div className="font-mono text-white/50 text-sm tracking-widest mb-6">
            MODULE 01 - THE BLUE MARBLE
          </div>
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
          <h3 className="font-mono text-accent-cyan text-xl tracking-widest mb-2">PLANET</h3>
          <h1 className="font-serif text-[15vw] leading-none tracking-tighter mb-8 bg-gradient-to-b from-white to-white/40 text-transparent bg-clip-text">
            EARTH
          </h1>
          <p className="text-text-muted text-xl max-w-2xl mx-auto mb-12 font-light">
            Learn more about this fascinating miracle that we call our home, Planet Earth. Course enrollment starts today. Early Bird tickets typically last a week, don't miss out!
          </p>
          <button className="bg-accent-cyan text-void px-12 py-5 rounded-full font-bold hover:bg-white transition-colors uppercase tracking-widest text-lg mb-24 shadow-[0_0_40px_rgba(56,189,248,0.3)] cursor-pointer">
            GET STARTED
          </button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-12 text-left">
            <div>
              <div className="text-text-subtle font-mono text-sm mb-2">DIAMETER</div>
              <div className="text-3xl font-light">12,742 <span className="text-lg text-text-muted">KM</span></div>
            </div>
            <div>
              <div className="text-text-subtle font-mono text-sm mb-2">ORBITAL SPEED</div>
              <div className="text-3xl font-light">29.78 <span className="text-lg text-text-muted">KM/S</span></div>
            </div>
            <div>
              <div className="text-text-subtle font-mono text-sm mb-2">WATER COVERAGE</div>
              <div className="text-3xl font-light">71<span className="text-lg text-text-muted">%</span></div>
            </div>
            <div>
              <div className="text-text-subtle font-mono text-sm mb-2">AGE</div>
              <div className="text-3xl font-light">4.54 <span className="text-lg text-text-muted">BN YRS</span></div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
