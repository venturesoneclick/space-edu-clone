import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FlyingPosters from './FlyingPosters';
import { posterImageUrls } from '../data/postersData';

gsap.registerPlugin(ScrollTrigger);

export default function FlyingPostersSection() {
  const trackRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const next = Number(self.progress.toFixed(4));
        setScrollProgress((prev) => (prev === next ? prev : next));
      },
    });

    const syncFromRect = () => {
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      const next = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
      setScrollProgress(next);
    };

    syncFromRect();
    ScrollTrigger.refresh();

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section
      ref={trackRef}
      className="relative w-full h-[300vh] bg-[#020408]"
    >
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-[#020408]">
        <h2 className="absolute text-[10vw] md:text-[8vw] font-serif font-light tracking-tighter text-white/10 select-none pointer-events-none z-0 text-center leading-none">
          Our Services
        </h2>
        <FlyingPosters
          progress={scrollProgress}
          items={posterImageUrls}
          planeWidth={400}
          planeHeight={380}
          distortion={2.5}
          scrollEase={0.08}
          cameraFov={45}
          cameraZ={20}
          className="absolute inset-0 z-10"
        />
      </div>
    </section>
  );
}
