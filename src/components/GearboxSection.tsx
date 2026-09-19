/**
 * GearboxSection.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Layout orchestrator for the mechanical gearbox scroll-assembly animation.
 *
 * DOM shape:
 *   <section>                       ← outer section (z-context, bg)
 *     <div id="gearbox-pin-container" style="height:400vh">
 *       ← ScrollTrigger's trigger + scroll runway
 *       <div class="sticky top-0 h-screen overflow-hidden">
 *         ← viewport-pinned window
 *         <GearboxScene />          ← Three.js canvas (absolute, fills sticky div)
 *         <GearboxTelemetry />      ← HUD overlay (absolute, fills sticky div)
 *       </div>
 *     </div>
 *     <div>                         ← downstream specs section
 *       ...
 *     </div>
 *   </section>
 *
 * The `id="gearbox-pin-container"` is the ScrollTrigger trigger used inside
 * GearboxScene. The sticky child means we use CSS stickiness (not GSAP pin),
 * which plays well with Lenis smooth scroll.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { GearboxScene }    from './GearboxScene';
import { GearboxTelemetry } from './GearboxTelemetry';

export function GearboxSection() {
  return (
    <section className="relative w-full bg-[#EDEDED]">

      {/* ── 400 vh scroll runway — ScrollTrigger trigger ────────────────────── */}
      <div id="gearbox-pin-container" style={{ height: '400vh' }}>

        {/* Sticky viewport: canvas + HUD live here */}
        <div className="sticky top-0 w-full overflow-hidden" style={{ height: '100vh' }}>
          <GearboxScene />
          <GearboxTelemetry />
        </div>
      </div>

      {/* ── Downstream engineering specs ─────────────────────────────────────── */}
      <div
        className="relative w-full px-8 md:px-24 py-28"
        style={{ borderTop: '1px solid #d4d4d4', backgroundColor: '#f5f5f5' }}
      >
        <div className="max-w-5xl mx-auto">
          <span
            className="font-mono text-xs text-neutral-400 tracking-widest uppercase"
          >
            Engineering Specifications
          </span>
          <h2
            className="text-4xl md:text-6xl font-light tracking-tight mt-3"
            style={{ fontFamily: 'Poppins, sans-serif', color: '#141414' }}
          >
            Precision Built for High-Load Environments.
          </h2>
          <p className="mt-6 text-neutral-600 max-w-2xl leading-relaxed">
            Every tooth profile, roller bearing race, and carrier pin is machined
            to aerospace-grade tolerances, ensuring quiet operation, maximum
            efficiency, and dependable power transfer.
          </p>

          {/* Spec grid */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-8">
            {SPECS.map((spec) => (
              <div key={spec.label}>
                <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                  {spec.label}
                </div>
                <div
                  className="text-2xl font-light"
                  style={{ fontFamily: 'Poppins, sans-serif', color: '#141414' }}
                >
                  {spec.value}
                </div>
                <div className="font-mono text-xs text-neutral-500 mt-1">
                  {spec.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}

// ─── Spec data ────────────────────────────────────────────────────────────────

const SPECS = [
  { label: 'Gear Ratio',     value: '48:1',           sub: 'Multi-stage epicyclic' },
  { label: 'Peak Torque',    value: '1,850 Nm',        sub: 'Continuous rated' },
  { label: 'Efficiency',     value: '98.4%',           sub: 'At rated speed' },
  { label: 'Service Life',   value: '50,000 h',        sub: 'L10 bearing rating' },
];

