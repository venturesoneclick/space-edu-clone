/**
 * gearGeometry.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Procedural precision gear meshes using THREE.Shape + THREE.ExtrudeGeometry.
 * All geometry is centered on creation so GSAP Y-axis lerp stays intuitive.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import * as THREE from 'three';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GearOptions {
  teeth: number;
  pitchRadius: number;
  holeRadius: number;
  thickness: number;
  toothHeight?: number;
  bevelThickness?: number;
  bevelSize?: number;
}

// ─── Spur / Sun / Ring Gear ───────────────────────────────────────────────────

/**
 * Generates a flat spur gear with square-ish tooth profiles via two-point
 * alternation between root radius and tip radius around the pitch circle.
 */
export function createGearGeometry(options: GearOptions): THREE.BufferGeometry {
  const {
    teeth,
    pitchRadius,
    holeRadius,
    thickness,
    toothHeight   = 0.22,
    bevelThickness = 0.04,
    bevelSize      = 0.03,
  } = options;

  const shape       = new THREE.Shape();
  const rootRadius  = pitchRadius - toothHeight * 0.55;
  const tipRadius   = pitchRadius + toothHeight * 0.55;
  const totalSteps  = teeth * 2;
  const stepAngle   = (Math.PI * 2) / totalSteps;

  for (let i = 0; i < totalSteps; i++) {
    const angle       = i * stepAngle;
    const isToothTip  = i % 2 === 1;
    const r           = isToothTip ? tipRadius : rootRadius;
    const x           = Math.cos(angle) * r;
    const y           = Math.sin(angle) * r;

    if (i === 0) shape.moveTo(x, y);
    else         shape.lineTo(x, y);
  }
  shape.closePath();

  // Central bore
  if (holeRadius > 0) {
    const hole = new THREE.Path();
    hole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    shape.holes.push(hole);
  }

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize,
    bevelThickness,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

// ─── Bearing Ring / Annulus Housing ──────────────────────────────────────────

/**
 * Produces a hollow annular ring — used for bearing races and ring gear housings.
 */
export function createBearingRing(
  outerRadius: number,
  innerRadius: number,
  height: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

  const hole = new THREE.Path();
  hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  geo.center();
  return geo;
}

// ─── Carrier Plate ────────────────────────────────────────────────────────────

/**
 * Generates a planetary carrier plate with a central bore plus equidistant
 * pin holes for planet gears.
 */
export function createCarrierPlate(
  radius: number,
  thickness: number,
  pinCount: number,
  pinOrbitRadius: number,
  pinRadius: number,
): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

  // Central shaft bore
  const centerBore = new THREE.Path();
  centerBore.absarc(0, 0, radius * 0.28, 0, Math.PI * 2, true);
  shape.holes.push(centerBore);

  // Pin holes arranged around orbit circle
  for (let i = 0; i < pinCount; i++) {
    const angle  = (i * Math.PI * 2) / pinCount;
    const px     = Math.cos(angle) * pinOrbitRadius;
    const py     = Math.sin(angle) * pinOrbitRadius;
    const pinHole = new THREE.Path();
    pinHole.absarc(px, py, pinRadius, 0, Math.PI * 2, true);
    shape.holes.push(pinHole);
  }

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
  });
  geo.center();
  return geo;
}

