import type React from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useCurrentFrame } from "remotion";
import { GlowPoints, Orb, hash } from "./primitives";
import { HDR } from "../layout";
import { clamp, type V3 } from "../math";

type Part = {
  readonly geom: THREE.BufferGeometry;
  readonly pos: V3;
  readonly rot?: V3;
};

const cyl = (r: number, h: number, seg = 28) => new THREE.CylinderGeometry(r, r, h, seg, 1);

/** Static refinery layout in local space (ground at y = 0, spans ~±20 in x, ±12 in z). */
const buildParts = (): { parts: Part[]; pipes: THREE.CatmullRomCurve3[]; windows: V3[] } => {
  const parts: Part[] = [];
  // distillation columns
  const columns: Array<[number, number, number, number]> = [
    [-14, -4, 0.9, 13],
    [-11, -6, 1.1, 16],
    [-8, -3.5, 0.75, 11],
    [-12.5, 1.5, 0.6, 9],
  ];
  for (const [x, z, r, h] of columns) {
    parts.push({ geom: cyl(r, h), pos: [x, h / 2, z] });
    parts.push({ geom: new THREE.SphereGeometry(r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), pos: [x, h, z] });
    for (let y = 2; y < h - 1; y += 2.4) {
      parts.push({ geom: new THREE.TorusGeometry(r + 0.12, 0.05, 6, 32), pos: [x, y, z], rot: [Math.PI / 2, 0, 0] });
    }
  }
  // spherical storage
  for (const [x, z, r] of [
    [6, -6, 2.6],
    [12, -6, 2.6],
    [9, 0.5, 2.2],
  ] as Array<[number, number, number]>) {
    parts.push({ geom: new THREE.SphereGeometry(r, 32, 20), pos: [x, r + 1.1, z] });
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      parts.push({ geom: cyl(0.12, r + 1.1, 8), pos: [x + Math.cos(a) * r * 0.8, (r + 1.1) / 2, z + Math.sin(a) * r * 0.8] });
    }
  }
  // cylindrical tanks
  for (const [x, z] of [
    [16, 5],
    [16.5, -1.5],
  ] as Array<[number, number]>) {
    parts.push({ geom: cyl(3, 5, 40), pos: [x, 2.5, z] });
    parts.push({ geom: new THREE.CylinderGeometry(2.6, 3, 0.6, 40), pos: [x, 5.3, z] });
  }
  // pipe rack
  for (let x = -6; x <= 4; x += 2.5) {
    parts.push({ geom: new THREE.BoxGeometry(0.25, 4.2, 0.25), pos: [x, 2.1, 3.2] });
    parts.push({ geom: new THREE.BoxGeometry(0.25, 4.2, 0.25), pos: [x, 2.1, 5.2] });
    parts.push({ geom: new THREE.BoxGeometry(0.25, 0.25, 2.2), pos: [x, 4.2, 4.2] });
  }
  // control room
  parts.push({ geom: new THREE.BoxGeometry(7, 3.2, 4.5), pos: [-1, 1.6, 9.5] });
  // flare stack
  parts.push({ geom: cyl(0.35, 22, 12), pos: [-18, 11, 7] });
  // cooling towers (hyperboloid-ish)
  for (const [x, z] of [
    [2, -9],
    [-3, -10],
  ] as Array<[number, number]>) {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 12; i++) {
      const y = (i / 12) * 8;
      pts.push(new THREE.Vector2(2.4 - Math.sin((i / 12) * Math.PI) * 0.9, y));
    }
    parts.push({ geom: new THREE.LatheGeometry(pts, 36), pos: [x, 0, z] });
  }
  // pipes along the rack and between units
  const P = (pts: number[][]) => new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p[0], p[1], p[2])), false, "catmullrom", 0.05);
  const pipes = [
    P([[-14, 3.6, -4], [-14, 3.6, 3.6], [-6, 3.6, 3.6], [4, 3.6, 3.6], [9, 3.6, 3.6], [9, 3.4, 0.5]]),
    P([[-11, 4.0, -6], [-11, 4.0, 4.4], [4, 4.0, 4.4], [12, 4.0, 4.4], [12, 3.8, -6]]),
    P([[-8, 3.2, -3.5], [-8, 3.2, 4.8], [4, 3.2, 4.8], [16, 3.2, 4.8], [16, 3.0, 5]]),
    P([[6, 1.0, -6], [6, 1.0, -2], [16.5, 1.0, -2], [16.5, 1.0, -1.5]]),
  ];
  for (const c of pipes) {
    parts.push({ geom: new THREE.TubeGeometry(c, 120, 0.16, 8, false), pos: [0, 0, 0] });
  }
  const windows: V3[] = [];
  for (let i = 0; i < 6; i++) windows.push([-3.6 + i * 1.05, 2.2, 11.78]);
  return { parts, pipes, windows };
};

/** Points sampled over the refinery silhouette (used to morph it into the workforce). */
export const sampleRefinery = (n: number, origin: V3): Float32Array => {
  const out = new Float32Array(n * 3);
  const towers: Array<[number, number, number, number]> = [
    [-14, -4, 0.9, 13], [-11, -6, 1.1, 16], [-8, -3.5, 0.75, 11], [-12.5, 1.5, 0.6, 9],
    [6, -6, 2.6, 5], [12, -6, 2.6, 5], [9, 0.5, 2.2, 4.4], [16, 5, 3, 5], [16.5, -1.5, 3, 5],
    [-18, 7, 0.35, 22], [2, -9, 2, 8], [-3, -10, 2, 8], [-1, 9.5, 3, 3.2],
  ];
  for (let i = 0; i < n; i++) {
    const t = towers[i % towers.length];
    const a = hash(i, 51) * Math.PI * 2;
    const y = hash(i, 52) * t[3];
    out[i * 3] = origin[0] + t[0] + Math.cos(a) * t[2];
    out[i * 3 + 1] = origin[1] + y;
    out[i * 3 + 2] = origin[2] + t[1] + Math.sin(a) * t[2];
  }
  return out;
};

type Props = {
  readonly origin: V3;
  /** 0 → nothing, 1 → fully materialised (scan rises from the ground) */
  readonly build: number;
  /** 0 → solid, 1 → dissolved away (scan descends from the top) */
  readonly dissolve?: number;
  readonly flowOn?: boolean;
};

/** Holographic digital twin of the RPI refinery: lit metal, glowing edges, live product flow. */
export const Refinery: React.FC<Props> = ({ origin, build, dissolve = 0, flowOn = true }) => {
  const frame = useCurrentFrame();
  const { gl } = useThree();
  gl.localClippingEnabled = true;
  const { parts, pipes, windows } = useMemo(buildParts, []);
  const planes = useMemo(
    () => ({
      up: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
      down: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0),
    }),
    [],
  );
  const top = origin[1] + 23;
  planes.up.constant = origin[1] - 0.5 + build * 24;
  planes.down.constant = top - dissolve * 24.5;
  const metal = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color("#5b7482"),
        metalness: 0.75,
        roughness: 0.34,
        envMapIntensity: 1.4,
      }),
    [],
  );
  const edgeMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: new THREE.Color(0.0, 0.55, 0.6),
        transparent: true,
        opacity: 0.55,
        toneMapped: false,
      }),
    [],
  );
  metal.clippingPlanes = [planes.up, planes.down];
  edgeMat.clippingPlanes = [planes.up, planes.down];
  const edges = useMemo(() => parts.map((p) => new THREE.EdgesGeometry(p.geom, 25)), [parts]);
  const scanY = origin[1] - 0.5 + build * 24;
  const scanY2 = top - dissolve * 24.5;
  const flare = 0.75 + 0.25 * Math.sin(frame * 0.41) * Math.cos(frame * 0.23);
  const visible = build > 0.001 && dissolve < 0.999;
  if (!visible) return null;
  return (
    <group>
      <group position={origin}>
        {parts.map((p, i) => (
          <group key={i} position={p.pos} rotation={(p.rot ?? [0, 0, 0]) as [number, number, number]}>
            <mesh geometry={p.geom} material={metal} />
            <lineSegments geometry={edges[i]} material={edgeMat} />
          </group>
        ))}
        {/* control room windows */}
        {build > 0.3
          ? windows.map((w, i) => (
              <mesh key={`w${i}`} position={w}>
                <planeGeometry args={[0.8, 0.9]} />
                <meshBasicMaterial color={new THREE.Color(2.2 * (1 - dissolve), 1.4 * (1 - dissolve), 0.5 * (1 - dissolve))} toneMapped={false} />
              </mesh>
            ))
          : null}
        {/* flare */}
        {build > 0.95 && dissolve < 0.2 ? (
          <>
            <Orb position={[-18, 22.6, 7]} radius={0.45 * flare} color={[4, 1.6, 0.1]} />
            <Orb position={[-18, 23.3, 7]} radius={0.25 * flare} color={[5, 3.6, 1.2]} />
            <pointLight position={[-18, 23, 7]} intensity={60 * flare} distance={40} color="#ff8a1a" />
          </>
        ) : null}
        <pointLight position={[-1, 4, 13]} intensity={25 * build} distance={18} color="#ffb060" />
        <pointLight position={[10, 8, -2]} intensity={18 * build} distance={26} color="#2fd0d8" />
      </group>
      {/* product flow along the pipes */}
      {flowOn && build > 0.9 ? (
        <GlowPoints
          count={pipes.length * 26}
          write={(i, o) => {
            const c = pipes[i % pipes.length];
            const t = (frame * 0.0045 + hash(i, 61)) % 1;
            const p = c.getPointAt(t);
            o.p.set(origin[0] + p.x, origin[1] + p.y + 0.2, origin[2] + p.z);
            const col = i % pipes.length === 1 ? HDR.turquoise : HDR.orange;
            const k = (1 - dissolve) * clamp((build - 0.9) * 10);
            o.c.setRGB(col[0] * k, col[1] * k, col[2] * k);
            o.size = 0.13;
          }}
        />
      ) : null}
      {/* scan planes (the twin materialising / dissolving) */}
      {build < 1 ? (
        <mesh position={[origin[0], scanY, origin[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[23.5, 26, 96]} />
          <meshBasicMaterial color={new THREE.Color(0, 0.5, 0.55)} transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </mesh>
      ) : null}
      {dissolve > 0 && dissolve < 1 ? (
        <mesh position={[origin[0], scanY2, origin[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[23.5, 26, 96]} />
          <meshBasicMaterial color={new THREE.Color(1.2, 0.5, 0.02)} transparent opacity={0.6} toneMapped={false} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} fog={false} />
        </mesh>
      ) : null}
    </group>
  );
};
