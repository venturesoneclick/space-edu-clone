import { useRef, useEffect, type FC } from 'react';
import {
  Renderer,
  Camera,
  Transform,
  Plane,
  Program,
  Mesh,
  Texture,
} from 'ogl';
import './FlyingPosters.css';

const vertexShader = `
precision highp float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform float uPosition;
uniform float uTime;
uniform float uSpeed;
uniform vec3 distortionAxis;
uniform vec3 rotationAxis;
uniform float uDistortion;

varying vec2 vUv;
varying vec3 vNormal;

float PI = 3.141592653589793238;
mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
      oc * axis.x * axis.x + c,         oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
      oc * axis.x * axis.y + axis.z * s,oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
      oc * axis.z * axis.x - axis.y * s,oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
      0.0,                              0.0,                                0.0,                                1.0
    );
}

vec3 rotate(vec3 v, vec3 axis, float angle) {
  mat4 m = rotationMatrix(axis, angle);
  return (m * vec4(v, 1.0)).xyz;
}

float qinticInOut(float t) {
  return t < 0.5
    ? 16.0 * pow(t, 5.0)
    : -0.5 * abs(pow(2.0 * t - 2.0, 5.0)) + 1.0;
}

void main() {
  vUv = uv;

  float norm = 0.5;
  vec3 newpos = position;
  float offset = (dot(distortionAxis, position) + norm / 2.) / norm;
  float localprogress = clamp(
    (fract(uPosition * 5.0 * 0.01) - 0.01 * uDistortion * offset) / (1. - 0.01 * uDistortion),
    0.,
    2.
  );
  localprogress = qinticInOut(localprogress) * PI;
  newpos = rotate(newpos, rotationAxis, localprogress);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newpos, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform sampler2D tMap;

varying vec2 vUv;

void main() {
  vec2 imageSize = uImageSize;
  vec2 planeSize = uPlaneSize;

  float imageAspect = imageSize.x / imageSize.y;
  float planeAspect = planeSize.x / planeSize.y;
  vec2 scale = vec2(1.0, 1.0);

  if (planeAspect > imageAspect) {
      scale.x = imageAspect / planeAspect;
  } else {
      scale.y = planeAspect / imageAspect;
  }

  vec2 uv = vUv * scale + (1.0 - scale) * 0.5;

  gl_FragColor = texture2D(tMap, uv);
}
`;

function lerp(p1: number, p2: number, t: number) {
  return p1 + (p2 - p1) * t;
}

function map(num: number, min1: number, max1: number, min2: number, max2: number) {
  return ((num - min1) / (max1 - min1)) * (max2 - min2) + min2;
}

function autoBind(self: object) {
  const proto = Object.getPrototypeOf(self);
  Object.getOwnPropertyNames(proto).forEach((key) => {
    if (key === 'constructor') return;
    const desc = Object.getOwnPropertyDescriptor(proto, key);
    if (desc && typeof desc.value === 'function') {
      (self as Record<string, unknown>)[key] = (desc.value as (...args: unknown[]) => unknown).bind(self);
    }
  });
}

interface ScrollState {
  current: number;
  target: number;
  last: number;
  ease: number;
}

interface Screen {
  width: number;
  height: number;
}

interface Viewport {
  width: number;
  height: number;
}

type OglGl = ConstructorParameters<typeof Texture>[0];

class Media {
  extra = 0;
  y = 0;
  height = 0;
  heightTotal = 0;
  padding = 0;
  gl: OglGl;
  geometry: Plane;
  scene: Transform;
  program!: Program;
  plane!: Mesh;
  texture!: Texture;
  screen: Screen;
  viewport: Viewport;
  image: string;
  length: number;
  index: number;
  planeWidth: number;
  planeHeight: number;
  distortion: number;

  constructor({
    gl,
    geometry,
    scene,
    screen,
    viewport,
    image,
    length,
    index,
    planeWidth,
    planeHeight,
    distortion,
  }: {
    gl: OglGl;
    geometry: Plane;
    scene: Transform;
    screen: Screen;
    viewport: Viewport;
    image: string;
    length: number;
    index: number;
    planeWidth: number;
    planeHeight: number;
    distortion: number;
  }) {
    this.gl = gl;
    this.geometry = geometry;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.image = image;
    this.length = length;
    this.index = index;
    this.planeWidth = planeWidth;
    this.planeHeight = planeHeight;
    this.distortion = distortion;
    this.createShader();
    this.createMesh();
    this.onResize();
  }

  createShader() {
    this.texture = new Texture(this.gl, { generateMipmaps: false });

    this.program = new Program(this.gl, {
      depthTest: false,
      depthWrite: false,
      fragment: fragmentShader,
      vertex: vertexShader,
      uniforms: {
        tMap: { value: this.texture },
        uPosition: { value: 0 },
        uPlaneSize: { value: [0, 0] },
        uImageSize: { value: [0, 0] },
        uSpeed: { value: 0 },
        rotationAxis: { value: [0, 1, 0] },
        distortionAxis: { value: [1, 1, 0] },
        uDistortion: { value: this.distortion },
        uViewportSize: { value: [this.viewport.width, this.viewport.height] },
        uTime: { value: 0 },
      },
      cullFace: false,
    });

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = this.image;
    img.onload = () => {
      this.texture.image = img;
      this.program.uniforms.uImageSize.value = [img.naturalWidth, img.naturalHeight];
    };
  }

  createMesh() {
    this.plane = new Mesh(this.gl, {
      geometry: this.geometry,
      program: this.program,
    });
    this.plane.setParent(this.scene);
  }

  setScale() {
    this.plane.scale.x = (this.viewport.width * this.planeWidth) / this.screen.width;
    this.plane.scale.y = (this.viewport.height * this.planeHeight) / this.screen.height;
    this.plane.position.x = 0;
    this.program.uniforms.uPlaneSize.value = [this.plane.scale.x, this.plane.scale.y];
  }

  onResize({ screen, viewport }: { screen?: Screen; viewport?: Viewport } = {}) {
    if (screen) this.screen = screen;
    if (viewport) {
      this.viewport = viewport;
      this.program.uniforms.uViewportSize.value = [this.viewport.width, this.viewport.height];
    }
    this.setScale();
    this.padding = 5;
    this.height = this.plane.scale.y + this.padding;
    this.heightTotal = this.height * this.length;
    this.y = -this.heightTotal / 2 + (this.index + 0.5) * this.height;
  }

  update(scroll: ScrollState) {
    this.plane.position.y = this.y - scroll.current - this.extra;

    const position = map(
      this.plane.position.y,
      -this.viewport.height,
      this.viewport.height,
      5,
      15,
    );

    this.program.uniforms.uPosition.value = position;
    this.program.uniforms.uTime.value += 0.04;
    this.program.uniforms.uSpeed.value = scroll.current;

    const planeHeight = this.plane.scale.y;
    const viewportHeight = this.viewport.height;
    const topEdge = this.plane.position.y + planeHeight / 2;
    const bottomEdge = this.plane.position.y - planeHeight / 2;

    if (topEdge < -viewportHeight / 2) {
      this.extra -= this.heightTotal;
    } else if (bottomEdge > viewportHeight / 2) {
      this.extra += this.heightTotal;
    }
  }

  destroy() {
    try {
      this.plane.setParent(null);
    } catch {
      /* already detached */
    }
    try {
      this.program.remove();
    } catch {
      /* program already gone */
    }
    this.texture.image = undefined;
  }
}

class CanvasApp {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  renderer: Renderer;
  gl: OglGl;
  camera: Camera;
  scene: Transform;
  planeGeometry!: Plane;
  medias: Media[] = [];
  screen: Screen = { width: 0, height: 0 };
  viewport: Viewport = { width: 0, height: 0 };
  scroll: ScrollState;
  items: string[];
  planeWidth: number;
  planeHeight: number;
  distortion: number;
  cameraFov: number;
  cameraZ: number;
  progress = 0;
  rafId = 0;
  running = true;
  needsRender = true;

  constructor({
    container,
    canvas,
    items,
    planeWidth,
    planeHeight,
    distortion,
    scrollEase,
    cameraFov,
    cameraZ,
  }: {
    container: HTMLElement;
    canvas: HTMLCanvasElement;
    items: string[];
    planeWidth: number;
    planeHeight: number;
    distortion: number;
    scrollEase: number;
    cameraFov: number;
    cameraZ: number;
  }) {
    this.container = container;
    this.canvas = canvas;
    this.items = items;
    this.planeWidth = planeWidth;
    this.planeHeight = planeHeight;
    this.distortion = distortion;
    this.cameraFov = cameraFov;
    this.cameraZ = cameraZ;
    this.scroll = { ease: scrollEase, current: 0, target: 0, last: 0 };
    autoBind(this);
    this.createRenderer();
    this.createCamera();
    this.createScene();
    this.onResize();
    this.createGeometry();
    this.createMedias();
    this.addEventListeners();
    this.update();
  }

  createRenderer() {
    this.renderer = new Renderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      dpr: Math.min(window.devicePixelRatio || 1, 1.5),
    });
    this.gl = this.renderer.gl;
    if (!this.gl) {
      throw new Error('WebGL context could not be created for FlyingPosters');
    }
    this.gl.clearColor(0, 0, 0, 0);
  }

  createCamera() {
    this.camera = new Camera(this.gl);
    this.camera.fov = this.cameraFov;
    this.camera.position.z = this.cameraZ;
  }

  createScene() {
    this.scene = new Transform();
  }

  createGeometry() {
    this.planeGeometry = new Plane(this.gl, {
      heightSegments: 1,
      widthSegments: 100,
    });
  }

  createMedias() {
    this.medias = this.items.map(
      (image, index) =>
        new Media({
          gl: this.gl,
          geometry: this.planeGeometry,
          scene: this.scene,
          screen: this.screen,
          viewport: this.viewport,
          image,
          length: this.items.length,
          index,
          planeWidth: this.planeWidth,
          planeHeight: this.planeHeight,
          distortion: this.distortion,
        }),
    );
  }

  onResize = () => {
    const rect = this.container.getBoundingClientRect();
    this.screen = { width: Math.max(rect.width, 1), height: Math.max(rect.height, 1) };
    this.renderer.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.renderer.setSize(this.screen.width, this.screen.height);
    const canvasW = this.gl.canvas.width || 1;
    const canvasH = this.gl.canvas.height || 1;
    this.camera.perspective({
      aspect: canvasW / canvasH,
    });

    const fov = (this.camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;
    this.viewport = { height, width };

    this.medias.forEach((media) =>
      media.onResize({ screen: this.screen, viewport: this.viewport }),
    );
  };

  setProgress(progress: number) {
    this.progress = Math.min(Math.max(progress, 0), 1);
    this.needsRender = true;
  }

  update = () => {
    if (!this.running) return;

    const totalTravel = this.medias[0]?.heightTotal ?? 0;
    this.scroll.target = this.progress * totalTravel;
    this.scroll.current = lerp(this.scroll.current, this.scroll.target, this.scroll.ease);

    const texturesReady = this.medias.every((media) => Boolean(media.texture.image));
    if (!texturesReady) this.needsRender = true;

    const delta = Math.abs(this.scroll.current - this.scroll.target);
    const moving = delta > 0.0004;

    if (this.needsRender || moving || Math.abs(this.scroll.current - this.scroll.last) > 0.0004) {
      this.medias.forEach((media) => media.update(this.scroll));
      this.renderer.render({ scene: this.scene, camera: this.camera });
      this.scroll.last = this.scroll.current;
      this.needsRender = false;
    }

    this.rafId = requestAnimationFrame(this.update);
  };

  addEventListeners() {
    window.addEventListener('resize', this.onResize, { passive: true });
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.onResize);

    this.medias.forEach((media) => {
      try { media.destroy(); } catch { /* noop */ }
    });
    this.medias = [];
    try { this.planeGeometry?.remove(); } catch { /* noop */ }
  }
}

export interface FlyingPostersProps {
  progress?: number;
  items?: string[];
  planeWidth?: number;
  planeHeight?: number;
  distortion?: number;
  scrollEase?: number;
  cameraFov?: number;
  cameraZ?: number;
  className?: string;
}

const FlyingPosters: FC<FlyingPostersProps> = ({
  progress = 0,
  items = [],
  planeWidth = 320,
  planeHeight = 320,
  distortion = 3,
  scrollEase = 0.08,
  cameraFov = 45,
  cameraZ = 20,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const instanceRef = useRef<CanvasApp | null>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    try {
      instanceRef.current = new CanvasApp({
        container: containerRef.current,
        canvas: canvasRef.current,
        items,
        planeWidth,
        planeHeight,
        distortion,
        scrollEase,
        cameraFov,
        cameraZ,
      });
      instanceRef.current.setProgress(progress);
    } catch (err) {
      console.error('FlyingPosters failed to start', err);
      instanceRef.current = null;
    }

    return () => {
      try { instanceRef.current?.destroy(); } catch { /* noop */ }
      instanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, planeWidth, planeHeight, distortion, scrollEase, cameraFov, cameraZ]);

  useEffect(() => {
    instanceRef.current?.setProgress(progress);
  }, [progress]);

  return (
    <div
      ref={containerRef}
      className={`posters-container${className ? ` ${className}` : ''}`}
    >
      <canvas ref={canvasRef} className="posters-canvas" />
    </div>
  );
};

export default FlyingPosters;
