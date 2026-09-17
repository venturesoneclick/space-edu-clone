import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TEXTURES = {
  day: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  normal: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
  specular: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
  clouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
};

// We inject a custom GLSL chunk to handle the day/night terminator blending properly
const customShaderInject = (shader: any) => {
  shader.uniforms.sunDirection = { value: new THREE.Vector3(1, 0, 0) };

  shader.vertexShader = `
    varying vec3 vNormalView;
    varying vec3 vPositionView;
    ${shader.vertexShader}
  `.replace(
    `#include <defaultnormal_vertex>`,
    `#include <defaultnormal_vertex>
     vNormalView = normalize(normalMatrix * normal);
     vPositionView = (modelViewMatrix * vec4(position, 1.0)).xyz;
    `
  );

  shader.fragmentShader = `
    uniform vec3 sunDirection;
    varying vec3 vNormalView;
    varying vec3 vPositionView;
    ${shader.fragmentShader}
  `.replace(
    `#include <map_fragment>`,
    `
    #include <map_fragment>
    
    // Calculate diffuse lighting (dot product of normal and sun direction in view space)
    vec3 viewSunDir = normalize( (viewMatrix * vec4(sunDirection, 0.0)).xyz );
    float intensity = dot(normalize(vNormalView), viewSunDir);
    
    // Smoothstep for a soft terminator line
    float dayMix = smoothstep(-0.2, 0.2, intensity);
    
    // Night color (dark blue void with slight city light tint approximation if texture is missing)
    vec3 nightColor = vec3(0.02, 0.03, 0.06);
    
    diffuseColor.rgb = mix(nightColor, diffuseColor.rgb, dayMix);
    `
  );
};

export default function EarthCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Strict Mode double-mount prevention
    if (containerRef.current.children.length > 0) {
      containerRef.current.innerHTML = '';
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    const manager = new THREE.LoadingManager();
    manager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      setProgress(Math.round((itemsLoaded / itemsTotal) * 100));
    };
    manager.onError = (url) => {
      console.error('Error loading texture:', url);
      setLoaded(true); // Force bypass loading screen if a texture fails
    };
    manager.onLoad = () => setLoaded(true);

    const textureLoader = new THREE.TextureLoader(manager);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.5);
    sunLight.position.set(5, 0, 2);
    scene.add(sunLight);

    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    // 1. Base Earth
    const earthGeo = new THREE.SphereGeometry(2, 64, 64);
    const earthMat = new THREE.MeshPhongMaterial({
      map: textureLoader.load(TEXTURES.day),
      normalMap: textureLoader.load(TEXTURES.normal),
      specularMap: textureLoader.load(TEXTURES.specular),
      shininess: 15,
    });
    
    earthMat.onBeforeCompile = (shader) => {
      shader.uniforms.sunDirection = { value: sunLight.position.clone().normalize() };
      customShaderInject(shader);
    };

    const earthMesh = new THREE.Mesh(earthGeo, earthMat);
    earthGroup.add(earthMesh);

    // 2. Clouds
    const cloudGeo = new THREE.SphereGeometry(2.015, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map: textureLoader.load(TEXTURES.clouds),
      transparent: true,
      opacity: 0.8,
      blending: THREE.NormalBlending,
      side: THREE.FrontSide,
      depthWrite: false
    });
    
    cloudMat.onBeforeCompile = (shader) => {
      shader.uniforms.sunDirection = { value: sunLight.position.clone().normalize() };
      customShaderInject(shader);
    };

    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    earthGroup.add(cloudMesh);

    // 3. Atmosphere Glow (Fresnel)
    const atmosGeo = new THREE.SphereGeometry(2.08, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
          gl_FragColor = vec4(0.2, 0.7, 1.0, 1.0) * intensity;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // Initial Camera Setup
    camera.position.set(0, 0, 5);

    // GSAP ScrollTrigger Orchestration - Strictly Slaved
    const setupScrollAnimation = () => {
      const scrollTriggerRef = ScrollTrigger.create({
        trigger: '#main-scroll-container',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        animation: gsap.timeline()
          // Stage 1 (0-20%): Close low-orbit oblique view
          .set(camera.position, { x: 1.5, y: -0.5, z: 2.5 })
          .set(earthGroup.rotation, { x: 0.2, y: 0.5, z: 0 })
          
          // Stage 2 (20-40%): The Terminator
          .to(camera.position, { x: 0, y: 0, z: 3.5, ease: "power1.inOut" }, "stage2")
          .to(earthGroup.rotation, { y: 2.2, ease: "power1.inOut" }, "stage2")
          
          // Stage 3 (40-70%): The Blue Marble
          .to(camera.position, { x: 0, y: 0, z: 6, ease: "power2.inOut" }, "stage3")
          .to(earthGroup.rotation, { y: 3.5, x: 0, ease: "power2.inOut" }, "stage3")
          
          // Stage 4 (70-100%): Planet Earth Frame
          .to(camera.position, { x: 0, y: 1.5, z: 5.5, ease: "power2.inOut" }, "stage4")
          .to(earthGroup.rotation, { y: 4.5, x: 0.4, ease: "power2.inOut" }, "stage4")
      });
      return scrollTriggerRef;
    };

    let st: ScrollTrigger | null = null;
    // Delay creation slightly to ensure DOM is ready
    setTimeout(() => {
      st = setupScrollAnimation();
    }, 100);

    // Render loop bound to GSAP ticker
    // NO autonomous rotation to meet the prompt's exact constraint!
    const onTick = () => {
      renderer.render(scene, camera);
    };

    gsap.ticker.add(onTick);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      gsap.ticker.remove(onTick);
      if (st) st.kill();
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <>
      {/* Loading Overlay */}
      {!loaded && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void text-white">
          <div className="font-mono text-sm tracking-widest mb-4">INITIALIZING TELEMETRY</div>
          <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-accent-cyan transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </>
  );
}
