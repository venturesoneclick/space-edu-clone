/**
 * GearboxScene.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Three.js WebGL scene: 9-stage planetary gearbox exploded → assembled.
 *
 * Scroll contract:
 *   • The parent section has id="gearbox-pin-container" with height: 400vh.
 *   • Inside sits a sticky top-0 h-screen div that holds this canvas.
 *   • ScrollTrigger maps page scroll inside that 400 vh track to [0 → 1].
 *   • progress 0 = all parts at exploded Y positions.
 *   • progress 1 = all parts converged to assembled Y positions.
 *
 * Cleanup contract:
 *   • Every geometry and material is disposed on unmount.
 *   • GSAP ticker callback and all ScrollTrigger instances are killed.
 *   • renderer.domElement is removed from DOM.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  createGearGeometry,
  createBearingRing,
  createCarrierPlate,
} from '../utils/gearGeometry';

gsap.registerPlugin(ScrollTrigger);

// ─── Types ────────────────────────────────────────────────────────────────────

interface PartDescriptor {
  mesh: THREE.Object3D;
  initialY: number;
  assembledY: number;
  rotSpeed: number;
  rotDir: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GearboxScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Renderer ──────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#EDEDED');

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );
    camera.position.set(3.4, 5.8, 6.8);
    camera.lookAt(0, 0, 0);

    // ── Lighting ──────────────────────────────────────────────────────────────
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
    keyLight.position.set(6, 12, 8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width  = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xbad7ff, 1.5);
    rimLight.position.set(-6, 4, -6);
    scene.add(rimLight);

    // ── PBR Materials ─────────────────────────────────────────────────────────
    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8dc,
      metalness: 0.94,
      roughness: 0.2,
      envMapIntensity: 1.2,
    });

    const darkSteelMat = new THREE.MeshStandardMaterial({
      color: 0x484d52,
      metalness: 0.88,
      roughness: 0.28,
    });

    const bronzeMat = new THREE.MeshStandardMaterial({
      color: 0xd9a464,
      metalness: 0.85,
      roughness: 0.3,
    });

    // ── Assembly Group ────────────────────────────────────────────────────────
    const parts: PartDescriptor[] = [];
    const assembly = new THREE.Group();
    scene.add(assembly);

    // Track all geometries for disposal
    const allGeos: THREE.BufferGeometry[] = [];
    const mkMesh = (
      geo: THREE.BufferGeometry,
      mat: THREE.Material,
    ): THREE.Mesh => {
      allGeos.push(geo);
      return new THREE.Mesh(geo, mat);
    };

    // ── 1. Top Cover Retaining Flange ─────────────────────────────────────────
    const topCapGeo  = createCarrierPlate(1.9, 0.2, 8, 1.5, 0.08);
    const topCapMesh = mkMesh(topCapGeo, steelMat);
    topCapMesh.rotation.x = Math.PI / 2;
    assembly.add(topCapMesh);
    parts.push({ mesh: topCapMesh, initialY: 4.6, assembledY: 1.1, rotSpeed: 0.4, rotDir: 1 });

    // ── 2. Upper Roller Bearing Race ──────────────────────────────────────────
    const upperBearingGeo  = createBearingRing(1.65, 1.35, 0.18);
    const upperBearingMesh = mkMesh(upperBearingGeo, darkSteelMat);
    upperBearingMesh.rotation.x = Math.PI / 2;
    assembly.add(upperBearingMesh);
    parts.push({ mesh: upperBearingMesh, initialY: 3.8, assembledY: 0.9, rotSpeed: 0.8, rotDir: -1 });

    // ── 3. Main Annulus / Outer Ring Gear Housing ─────────────────────────────
    const ringHousingGeo  = createBearingRing(2.1, 1.7, 0.45);
    const ringHousingMesh = mkMesh(ringHousingGeo, steelMat);
    ringHousingMesh.rotation.x = Math.PI / 2;
    assembly.add(ringHousingMesh);
    parts.push({ mesh: ringHousingMesh, initialY: 2.8, assembledY: 0.65, rotSpeed: 0.2, rotDir: 1 });

    // ── 4. Needle Retainer Ring (Bronze) ──────────────────────────────────────
    const needleGeo  = createBearingRing(1.5, 1.2, 0.1);
    const needleMesh = mkMesh(needleGeo, bronzeMat);
    needleMesh.rotation.x = Math.PI / 2;
    assembly.add(needleMesh);
    parts.push({ mesh: needleMesh, initialY: 2.1, assembledY: 0.4, rotSpeed: 1.2, rotDir: 1 });

    // ── 5. Planetary Pinion Cluster (5 gears on pins) ─────────────────────────
    const pinGroup  = new THREE.Group();
    const pinCount  = 5;
    const pinOrbit  = 0.95;
    for (let i = 0; i < pinCount; i++) {
      const angle    = (i * Math.PI * 2) / pinCount;
      const pinionGeo = createGearGeometry({ teeth: 12, pitchRadius: 0.26, holeRadius: 0.08, thickness: 0.55 });
      allGeos.push(pinionGeo);
      const pinion = new THREE.Mesh(pinionGeo, steelMat);
      pinion.position.set(Math.cos(angle) * pinOrbit, 0, Math.sin(angle) * pinOrbit);
      pinion.rotation.x = Math.PI / 2;
      pinGroup.add(pinion);
    }
    assembly.add(pinGroup);
    parts.push({ mesh: pinGroup, initialY: 1.3, assembledY: 0.15, rotSpeed: 2.4, rotDir: -1 });

    // ── 6. Main Planetary Carrier Plate ───────────────────────────────────────
    const carrierGeo  = createCarrierPlate(1.7, 0.24, 5, pinOrbit, 0.12);
    const carrierMesh = mkMesh(carrierGeo, steelMat);
    carrierMesh.rotation.x = Math.PI / 2;
    assembly.add(carrierMesh);
    parts.push({ mesh: carrierMesh, initialY: 0.1, assembledY: -0.1, rotSpeed: 0.5, rotDir: 1 });

    // ── 7. Stepped Input Shaft & Sun Gear ─────────────────────────────────────
    const shaftGroup    = new THREE.Group();
    const shaftCylGeo   = new THREE.CylinderGeometry(0.38, 0.44, 1.4, 32);
    allGeos.push(shaftCylGeo);
    const shaftMesh     = new THREE.Mesh(shaftCylGeo, steelMat);
    shaftGroup.add(shaftMesh);

    const sunGeo  = createGearGeometry({ teeth: 18, pitchRadius: 0.5, holeRadius: 0.2, thickness: 0.4 });
    allGeos.push(sunGeo);
    const sunMesh = new THREE.Mesh(sunGeo, darkSteelMat);
    sunMesh.rotation.x = Math.PI / 2;
    shaftGroup.add(sunMesh);
    assembly.add(shaftGroup);
    parts.push({ mesh: shaftGroup, initialY: -1.0, assembledY: -0.4, rotSpeed: 3.2, rotDir: 1 });

    // ── 8. Lower Satellite Planetary Cluster (4 gears) ────────────────────────
    const lowerGroup  = new THREE.Group();
    const lowerCount  = 4;
    const lowerRadius = 1.05;
    for (let i = 0; i < lowerCount; i++) {
      const angle    = (i * Math.PI * 2) / lowerCount;
      const lowerGeo = createGearGeometry({ teeth: 16, pitchRadius: 0.38, holeRadius: 0.1, thickness: 0.32 });
      allGeos.push(lowerGeo);
      const lowerGear = new THREE.Mesh(lowerGeo, steelMat);
      lowerGear.position.set(Math.cos(angle) * lowerRadius, 0, Math.sin(angle) * lowerRadius);
      lowerGear.rotation.x = Math.PI / 2;
      lowerGroup.add(lowerGear);
    }
    assembly.add(lowerGroup);
    parts.push({ mesh: lowerGroup, initialY: -2.2, assembledY: -0.75, rotSpeed: 2.0, rotDir: -1 });

    // ── 9. Bottom Heavy Spur Output Plate ─────────────────────────────────────
    const basePlateGeo  = createGearGeometry({ teeth: 48, pitchRadius: 1.85, holeRadius: 0.35, thickness: 0.28 });
    const basePlateMesh = mkMesh(basePlateGeo, darkSteelMat);
    basePlateMesh.rotation.x = Math.PI / 2;
    assembly.add(basePlateMesh);
    parts.push({ mesh: basePlateMesh, initialY: -3.4, assembledY: -1.1, rotSpeed: 0.3, rotDir: 1 });

    // ── Set initial exploded positions ────────────────────────────────────────
    parts.forEach((p) => { p.mesh.position.y = p.initialY; });

    // ── GSAP ScrollTrigger — scrub maps scroll to assembly progress ───────────
    const scrollObj    = { progress: 0 };
    const pinContainer = document.getElementById('gearbox-pin-container');

    const st = gsap.timeline({
      scrollTrigger: {
        trigger: pinContainer ?? '#gearbox-pin-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    }).to(scrollObj, {
      progress: 1,
      ease: 'none',
      onUpdate: () => {
        const p = scrollObj.progress;

        // Lerp each part from exploded → assembled Y; rotate per gear physics
        parts.forEach((part) => {
          part.mesh.position.y = THREE.MathUtils.lerp(part.initialY, part.assembledY, p);
          part.mesh.rotation.y = p * Math.PI * 6 * part.rotSpeed * part.rotDir;
        });

        // Gentle orbital tilt and zoom mimicking reference video
        assembly.rotation.y = p * Math.PI * 0.85;
        assembly.rotation.z = Math.sin(p * Math.PI) * 0.12;

        camera.position.y = THREE.MathUtils.lerp(5.8, 4.2, p);
        camera.position.z = THREE.MathUtils.lerp(6.8, 5.4, p);
        camera.lookAt(0, 0, 0);
      },
    });

    // ── Render loop (driven by GSAP ticker in parent hook) ───────────────────
    const tick = () => renderer.render(scene, camera);
    gsap.ticker.add(tick);

    // ── Resize handler ────────────────────────────────────────────────────────
    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(tick);
      st.scrollTrigger?.kill();
      st.kill();

      // Dispose all tracked geometries
      allGeos.forEach((g) => g.dispose());

      // Dispose materials
      steelMat.dispose();
      darkSteelMat.dispose();
      bronzeMat.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
    />
  );
};

