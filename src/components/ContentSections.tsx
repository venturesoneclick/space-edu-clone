import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FoldText from './FoldText';
import SplitText from './SplitText';
import ScrollStack, { ScrollStackItem } from './ScrollStack';

gsap.registerPlugin(ScrollTrigger);

export default function ContentSections() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Refresh ScrollTrigger and Lenis to ensure proper calculations for the new DOM height
    setTimeout(() => {
      ScrollTrigger.refresh();
      // If lenis is attached to window, triggering a resize event helps it recalculate
      window.dispatchEvent(new Event('resize'));
    }, 100);

    // Staggered reveal for section contents
    const sections = gsap.utils.toArray('.content-section') as HTMLElement[];
    sections.forEach((sec) => {
      gsap.fromTo(
        sec.querySelectorAll('.reveal-elem'),
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 80%',
          },
        }
      );
    });
  }, []);

  return (
    <div
      id="content-layer"
      ref={containerRef}
      className="relative z-30 w-full min-h-screen bg-[#020408] before:absolute before:inset-x-0 before:-top-28 before:h-28 before:bg-gradient-to-t before:from-[#020408] before:to-transparent before:pointer-events-none pb-24"
    >

      {/* Section 1 ("Milestone") */}
      <section className="content-section min-h-[60vh] flex flex-col justify-center px-6 md:px-24 pt-32">
        <h1 className="reveal-elem font-serif mb-8">
          <FoldText
            text={"We move freight.\nWe own\nthe outcome."}
            splitBy="word"
            hinge="top"
            trigger="scroll"
            duration={0.65}
            stagger={0.055}
            ease="power3.out"
            perspective={700}
            creaseShading={0.55}
            fontSize="clamp(2.2rem, 7vw, 5.5rem)"
            fontWeight={300}
            color="#ffffff"
          />
        </h1>
        <p className="reveal-elem text-white/70 text-xl md:text-2xl max-w-3xl font-light leading-relaxed">
          <SplitText
            text="Whether you're an entrepreneur looking for a platform to scale, a manufacturer looking for distribution and growth support, or a brand looking for operational muscle, we're open to the conversation. We move fast. Expect a response within 24 hours."
            splitType="words"
            tag="span"
            delay={18}
            duration={0.9}
            ease="power3.out"
            from={{ opacity: 0, y: 24 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.05}
            rootMargin="-60px"
            textAlign="left"
            className="text-white/70 text-xl md:text-2xl font-light leading-relaxed"
          />
        </p>
      </section>

      {/* Section 2 — ScrollStack cards */}
      <section className="content-section" style={{ height: '130vh' }}>
        <ScrollStack
          itemDistance={100}
          itemScale={0.03}
          itemStackDistance={30}
          stackPosition="20%"
          scaleEndPosition="10%"
          baseScale={0.85}
          blurAmount={0}
          rotationAmount={0}
        >
          <ScrollStackItem itemClassName="bg-[#f5f3ef] border border-white/20">
            <h2 className="text-gray-900 text-4xl font-serif tracking-wide mb-5 font-bold">01 / Explore</h2>
            <p className="text-gray-900 font-light leading-relaxed text-2xl text-justify hyphens-auto">
              With every service under one roof and one accountable team, your supply chain moves the way your business demands: predictably, transparently, and without excuses.
              <br/><br/>
              That means no finger-pointing between vendors. No delays lost in handoffs. Just one team, accountable from origin to destination.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-[#f5f3ef] border border-white/20">
            <h2 className="text-gray-900 text-4xl font-serif tracking-wide mb-5 font-bold">02 / Engage</h2>
            <p className="text-gray-900 font-light leading-relaxed text-2xl text-justify hyphens-auto">
              Strategy without market pull is theory. We get brands in front of the right buyers, activate distribution channels, and build early traction that turns validated ideas into operating businesses with real revenue.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-[#f5f3ef] border border-white/20">
            <h2 className="text-gray-900 text-4xl font-serif tracking-wide mb-5 font-bold">03 / Enable</h2>
            <p className="text-gray-900 font-light leading-relaxed text-2xl text-justify hyphens-auto">
              Every venture in our portfolio runs on shared infrastructure — technology, compliance, finance, and GTM frameworks. Built once, hardened over time, and deployed across every brand we launch.
            </p>
          </ScrollStackItem>

          <ScrollStackItem itemClassName="bg-[#f5f3ef] border border-white/20">
            <h2 className="text-gray-900 text-4xl font-serif tracking-wide mb-5 font-bold">04 / Scale</h2>
            <p className="text-gray-900 font-light leading-relaxed text-2xl text-justify hyphens-auto">
              Building compounding advantages — brand equity, distribution moats, and shared infrastructure — that make every subsequent venture faster to launch and easier to win.
            </p>
          </ScrollStackItem>
        </ScrollStack>
      </section>
    </div>
  );
}
