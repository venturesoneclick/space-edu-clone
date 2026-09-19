/**
 * GearboxTelemetry.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Technical engineering overlay that lives inside the sticky viewport container.
 *
 * Uses `absolute` positioning (NOT fixed) so it disappears naturally when the
 * user scrolls past the gearbox section — no z-index bleed into other sections.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { Disc, Activity, Layers, Cpu } from 'lucide-react';

export function GearboxTelemetry() {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-8 md:p-14">

      {/* ── Top header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Disc
            className="w-5 h-5 text-neutral-700"
            style={{ animation: 'spin 8s linear infinite' }}
          />
          <span className="font-mono text-xs uppercase tracking-widest text-neutral-700 font-semibold">
            Series-9 Planetary Transmission
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-6 font-mono text-[11px] text-neutral-500 uppercase tracking-wider">
          <span>Tolerance: +/- 0.002 mm</span>
          <span>Material: 316L Stainless</span>
          <span>Status: Assembly Active</span>
        </div>
      </div>

      {/* ── Centre callout ────────────────────────────────────────────────────── */}
      <div className="flex flex-col items-start max-w-sm">
        <span className="font-mono text-[11px] text-neutral-500 tracking-widest uppercase mb-2">
          Precision Kinematics
        </span>
        <h2
          className="text-3xl md:text-5xl font-light tracking-tight leading-none"
          style={{ fontFamily: 'Poppins, sans-serif', color: '#141414' }}
        >
          Modular Drive Unit
        </h2>
        <p className="mt-4 text-xs md:text-sm text-neutral-600 leading-relaxed">
          High-torque multi-stage epicyclic reduction system with integrated
          roller bearings and high surface hardness.
        </p>
      </div>

      {/* ── Bottom telemetry gauges ────────────────────────────────────────────── */}
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6"
        style={{ borderTop: '1px solid #d4d4d4' }}
      >
        <TelemetryCell icon={<Activity className="w-4 h-4 text-neutral-600" />} label="Input Ratio"    value="48:1 Epicyclic" />
        <TelemetryCell icon={<Layers   className="w-4 h-4 text-neutral-600" />} label="Sub-Assemblies" value="9 Key Stages"   />
        <TelemetryCell icon={<Cpu      className="w-4 h-4 text-neutral-600" />} label="Torque Rating"  value="1,850 Nm Max"  />
        <TelemetryCell
          icon={<span className="w-2 h-2 rounded-full bg-emerald-500" style={{ animation: 'pulse 2s ease-in-out infinite' }} />}
          label="Kinematic Sync"
          value="100% Locked"
        />
      </div>
    </div>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function TelemetryCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-wider">{label}</div>
        <div className="font-mono text-xs font-semibold text-neutral-800">{value}</div>
      </div>
    </div>
  );
}

