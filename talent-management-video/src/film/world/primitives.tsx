import type React from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";
import { arc, type V3 } from "../math";

/* ------------------------------------------------------------------ mounting */

/** Mount children only inside [from, to] (saves render time for distant sets). */
export const Active: React.FC<{
  readonly from: number;
  readonly to: number;
  readonly children: React.ReactNode;
}> = ({ from, to, children }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  return <>{children}</>;
};

/* ------------------------------------------------------------------ glow points */

export type PointOut = { p: THREE.Vector3; size: number; c: THREE.Color };
export type PointWriter = (i: number, o: PointOut) => void;

const POINT_VERT = /* glsl */ `
  attribute float size;
  attribute vec3 color;
  uniform float uProj;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    vColor = color;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_PointSize = max(0.0, size * uProj / max(0.001, -mv.z));
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAG = /* glsl */ `
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec3 vColor;
  varying float vDepth;
  void main() {
    vec2 d = gl_PointCoord - 0.5;
    float r = length(d) * 2.0;
    float a = 1.0 - smoothstep(0.55, 1.0, r);
    if (a < 0.35) discard;
    float core = 1.0 + 1.6 * (1.0 - smoothstep(0.0, 0.5, r));
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    vec3 col = mix(vColor * core, uFogColor, clamp(fog, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Thousands of glowing nodes in one draw call. HDR colours (> 1) bloom; the
 * points write depth so depth-of-field treats them as real objects.
 */
export const GlowPoints: React.FC<{
  readonly count: number;
  readonly write: PointWriter;
}> = ({ count, write }) => {
  useCurrentFrame();
  const { camera, scene, size } = useThree();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("size", new THREE.BufferAttribute(new Float32Array(count), 1));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        uniforms: {
          uProj: { value: 1 },
          uFogColor: { value: new THREE.Color("#03111A") },
          uFogDensity: { value: 0.01 },
        },
        toneMapped: false,
      }),
    [],
  );
  const o = useMemo<PointOut>(() => ({ p: new THREE.Vector3(), size: 0, c: new THREE.Color() }), []);

  const pos = geom.attributes.position.array as Float32Array;
  const col = geom.attributes.color.array as Float32Array;
  const siz = geom.attributes.size.array as Float32Array;
  for (let i = 0; i < count; i++) {
    o.size = 0;
    write(i, o);
    pos[i * 3] = o.p.x;
    pos[i * 3 + 1] = o.p.y;
    pos[i * 3 + 2] = o.p.z;
    col[i * 3] = o.c.r;
    col[i * 3 + 1] = o.c.g;
    col[i * 3 + 2] = o.c.b;
    siz[i] = o.size;
  }
  geom.attributes.position.needsUpdate = true;
  geom.attributes.color.needsUpdate = true;
  geom.attributes.size.needsUpdate = true;

  const cam = camera as THREE.PerspectiveCamera;
  mat.uniforms.uProj.value = size.height / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
  if (scene.fog instanceof THREE.FogExp2) {
    mat.uniforms.uFogDensity.value = scene.fog.density;
    (mat.uniforms.uFogColor.value as THREE.Color).copy(scene.fog.color);
  }
  return <points geometry={geom} material={mat} frustumCulled={false} />;
};

/* ------------------------------------------------------------------ lines */

export type LineOut = { a: THREE.Vector3; b: THREE.Vector3; c: THREE.Color };
export type LineWriter = (i: number, o: LineOut) => void;

/** Many straight links in one draw call (HDR vertex colours). */
export const Links: React.FC<{
  readonly count: number;
  readonly write: LineWriter;
  readonly opacity?: number;
}> = ({ count, write, opacity = 1 }) => {
  useCurrentFrame();
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(count * 6), 3));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  );
  mat.opacity = opacity;
  const o = useMemo<LineOut>(
    () => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Color() }),
    [],
  );
  const pos = geom.attributes.position.array as Float32Array;
  const col = geom.attributes.color.array as Float32Array;
  for (let i = 0; i < count; i++) {
    o.c.setRGB(0, 0, 0);
    write(i, o);
    pos.set([o.a.x, o.a.y, o.a.z, o.b.x, o.b.y, o.b.z], i * 6);
    col.set([o.c.r, o.c.g, o.c.b, o.c.r, o.c.g, o.c.b], i * 6);
  }
  geom.attributes.position.needsUpdate = true;
  geom.attributes.color.needsUpdate = true;
  return <lineSegments geometry={geom} material={mat} frustumCulled={false} />;
};

/* ------------------------------------------------------------------ light arcs */

/** A glowing tube along an arc between two points, drawn on by `progress`. */
export const LightArc: React.FC<{
  readonly from: V3;
  readonly to: V3;
  readonly lift: number;
  readonly progress: number;
  readonly color: V3;
  readonly radius?: number;
}> = ({ from, to, lift, progress, color, radius = 0.05 }) => {
  const geom = useMemo(() => {
    const pts = Array.from({ length: 48 }, (_, i) => new THREE.Vector3(...arc(from, to, lift, i / 47)));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 96, radius, 6, false);
  }, [from, to, lift, radius]);
  const index = geom.index!;
  geom.setDrawRange(0, Math.floor((index.count / 6) * Math.max(0, Math.min(1, progress))) * 6);
  if (progress <= 0) return null;
  return (
    <mesh geometry={geom}>
      <meshBasicMaterial color={new THREE.Color(...color)} toneMapped={false} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ floor grid */

const GRID_VERT = /* glsl */ `
  varying vec3 vW;
  varying float vDepth;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vW = w.xyz;
    vec4 mv = viewMatrix * w;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const GRID_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uBase;
  uniform vec2 uCenter;
  uniform float uRadius;
  uniform float uCell;
  uniform float uReveal;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec3 vW;
  varying float vDepth;
  float gridLine(vec2 p, float cell) {
    vec2 q = p / cell;
    vec2 g = abs(fract(q - 0.5) - 0.5) / fwidth(q);
    return 1.0 - min(min(g.x, g.y), 1.0);
  }
  void main() {
    float minor = gridLine(vW.xz, uCell);
    float major = gridLine(vW.xz, uCell * 5.0);
    float r = length(vW.xz - uCenter) / uRadius;
    float fade = 1.0 - smoothstep(0.35, 1.0, r);
    float reveal = 1.0 - smoothstep(uReveal - 0.15, uReveal, r);
    vec3 col = uBase + uColor * (minor * 0.35 + major * 0.9) * fade * reveal;
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    float alpha = fade * reveal;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(mix(col, uFogColor, clamp(fog, 0.0, 1.0)), alpha);
  }
`;

/** Holographic engineering grid floor that fades radially; `reveal` 0→1 spreads it out. */
export const Floor: React.FC<{
  readonly center: V3;
  readonly radius?: number;
  readonly cell?: number;
  readonly reveal?: number;
  readonly color?: V3;
}> = ({ center, radius = 40, cell = 1, reveal = 1.2, color = [0.0, 0.32, 0.36] }) => {
  const { scene } = useThree();
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GRID_VERT,
        fragmentShader: GRID_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color() },
          uBase: { value: new THREE.Color(0.006, 0.018, 0.026) },
          uCenter: { value: new THREE.Vector2() },
          uRadius: { value: 1 },
          uCell: { value: 1 },
          uReveal: { value: 1 },
          uFogColor: { value: new THREE.Color("#03111A") },
          uFogDensity: { value: 0.01 },
        },
        toneMapped: false,
        transparent: true,
      }),
    [],
  );
  (mat.uniforms.uColor.value as THREE.Color).setRGB(...color);
  (mat.uniforms.uCenter.value as THREE.Vector2).set(center[0], center[2]);
  mat.uniforms.uRadius.value = radius;
  mat.uniforms.uCell.value = cell;
  mat.uniforms.uReveal.value = reveal * 1.15;
  if (scene.fog instanceof THREE.FogExp2) {
    mat.uniforms.uFogDensity.value = scene.fog.density;
    (mat.uniforms.uFogColor.value as THREE.Color).copy(scene.fog.color);
  }
  return (
    <mesh position={center} rotation={[-Math.PI / 2, 0, 0]} material={mat}>
      <planeGeometry args={[radius * 2.2, radius * 2.2]} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ light beams */

const BEAM_VERT = /* glsl */ `
  varying float vY;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vY = uv.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vY;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float edge = pow(abs(dot(vN, vV)), 1.6);
    float grad = pow(vY, 1.4);
    gl_FragColor = vec4(uColor * edge * grad * uOpacity, 1.0);
  }
`;

/** Soft volumetric light shaft (additive cone), apex at `position`, pointing down. */
export const Beam: React.FC<{
  readonly position: V3;
  readonly height: number;
  readonly radius: number;
  readonly color: V3;
  readonly opacity: number;
}> = ({ position, height, radius, color, opacity }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: BEAM_VERT,
        fragmentShader: BEAM_FRAG,
        uniforms: { uColor: { value: new THREE.Color() }, uOpacity: { value: 1 } },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      }),
    [],
  );
  (mat.uniforms.uColor.value as THREE.Color).setRGB(...color);
  mat.uniforms.uOpacity.value = opacity;
  if (opacity <= 0.001) return null;
  return (
    <mesh position={[position[0], position[1] - height / 2, position[2]]} material={mat}>
      <cylinderGeometry args={[0.05, radius, height, 32, 1, true]} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ materials */

/**
 * Lit, metallic-ish material whose per-instance colour also drives emission,
 * so HDR instance colours glow (bloom) while the surface still catches light.
 */
export const emissiveInstancedMaterial = (emit = 0.8, metalness = 0.3, roughness = 0.4) => {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color("#ffffff"),
    metalness,
    roughness,
    toneMapped: false,
  });
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
       #if defined( USE_INSTANCING_COLOR ) || defined( USE_COLOR )
         totalEmissiveRadiance += vColor.rgb * ${emit.toFixed(3)};
       #endif`,
    );
  };
  return m;
};

/* ------------------------------------------------------------------ people */

export type FigureOut = { p: THREE.Vector3; s: number; c: THREE.Color; rotY: number };
export type FigureWriter = (i: number, o: FigureOut) => void;

/** Instanced stylised people (body + head) with emissive tint. */
export const Figures: React.FC<{
  readonly count: number;
  readonly write: FigureWriter;
}> = ({ count, write }) => {
  useCurrentFrame();
  const body = useMemo(() => new THREE.CapsuleGeometry(0.16, 0.62, 4, 10), []);
  const head = useMemo(() => new THREE.SphereGeometry(0.15, 14, 10), []);
  const mat = useMemo(() => emissiveInstancedMaterial(0.9), []);
  const bodyMesh = useMemo(() => new THREE.InstancedMesh(body, mat, count), [body, mat, count]);
  const headMesh = useMemo(() => new THREE.InstancedMesh(head, mat, count), [head, mat, count]);
  const o = useMemo<FigureOut>(
    () => ({ p: new THREE.Vector3(), s: 1, c: new THREE.Color(), rotY: 0 }),
    [],
  );
  const m = useMemo(() => new THREE.Matrix4(), []);
  const q = useMemo(() => new THREE.Quaternion(), []);
  const sc = useMemo(() => new THREE.Vector3(), []);
  const tp = useMemo(() => new THREE.Vector3(), []);
  for (let i = 0; i < count; i++) {
    o.s = 1;
    o.rotY = 0;
    o.c.setRGB(0.2, 0.5, 0.55);
    write(i, o);
    q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, o.rotY);
    sc.setScalar(o.s);
    tp.set(o.p.x, o.p.y + 0.47 * o.s, o.p.z);
    m.compose(tp, q, sc);
    bodyMesh.setMatrixAt(i, m);
    tp.set(o.p.x, o.p.y + 1.05 * o.s, o.p.z);
    m.compose(tp, q, sc);
    headMesh.setMatrixAt(i, m);
    bodyMesh.setColorAt(i, o.c);
    headMesh.setColorAt(i, o.c);
  }
  bodyMesh.instanceMatrix.needsUpdate = true;
  headMesh.instanceMatrix.needsUpdate = true;
  if (bodyMesh.instanceColor) bodyMesh.instanceColor.needsUpdate = true;
  if (headMesh.instanceColor) headMesh.instanceColor.needsUpdate = true;
  return (
    <>
      <primitive object={bodyMesh} frustumCulled={false} />
      <primitive object={headMesh} frustumCulled={false} />
    </>
  );
};

/* ------------------------------------------------------------------ misc */

/** Emissive glowing sphere (bloom does the halo). */
export const Orb: React.FC<{
  readonly position: V3;
  readonly radius: number;
  readonly color: V3;
  readonly segments?: number;
}> = ({ position, radius, color, segments = 24 }) => {
  if (radius <= 0) return null;
  return (
    <mesh position={position}>
      <sphereGeometry args={[radius, segments, segments]} />
      <meshBasicMaterial color={new THREE.Color(...color)} toneMapped={false} />
    </mesh>
  );
};

/** Flat glowing ring lying in the XZ plane (or rotated). */
export const Ring: React.FC<{
  readonly position: V3;
  readonly radius: number;
  readonly tube?: number;
  readonly color: V3;
  readonly rotation?: V3;
  readonly arc?: number;
}> = ({ position, radius, tube = 0.04, color, rotation = [Math.PI / 2, 0, 0], arc: arcLen = Math.PI * 2 }) => {
  if (radius <= 0 || arcLen <= 0) return null;
  return (
    <mesh position={position} rotation={rotation as [number, number, number]}>
      <torusGeometry args={[radius, tube, 8, 96, arcLen]} />
      <meshBasicMaterial color={new THREE.Color(...color)} toneMapped={false} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  );
};

/** Deterministic pseudo-random in [0,1) from integers. */
export const hash = (i: number, salt = 0) => {
  const s = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};
