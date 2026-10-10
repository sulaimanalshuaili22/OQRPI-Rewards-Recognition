import type React from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { GlowPoints, Links, hash } from "./primitives";
import { HDR } from "../layout";
import { clamp, EASE, type V3 } from "../math";

export type Galaxy = {
  readonly pos: Float32Array;
  readonly lead: Uint8Array;
  readonly edges: Uint32Array;
};

/** Workforce constellation: department clusters along spiral arms, with nearest-neighbour links. */
export const makeGalaxy = (count: number, radius: number, seed = 1): Galaxy => {
  const pos = new Float32Array(count * 3);
  const lead = new Uint8Array(count);
  const clusters = 11;
  for (let i = 0; i < count; i++) {
    const c = i % clusters;
    const arm = c % 3;
    const along = 0.18 + 0.82 * (c / clusters);
    const ang = arm * ((Math.PI * 2) / 3) + along * 3.4;
    const cx = Math.cos(ang) * along * radius;
    const cz = Math.sin(ang) * along * radius;
    const spread = radius * (0.1 + 0.07 * hash(c, seed + 3));
    const r = Math.pow(hash(i, seed), 0.7) * spread;
    const th = hash(i, seed + 1) * Math.PI * 2;
    const ph = Math.acos(2 * hash(i, seed + 2) - 1);
    pos[i * 3] = cx + r * Math.sin(ph) * Math.cos(th);
    pos[i * 3 + 1] = r * Math.cos(ph) * 0.55 + (hash(i, seed + 5) - 0.5) * radius * 0.06;
    pos[i * 3 + 2] = cz + r * Math.sin(ph) * Math.sin(th);
    lead[i] = hash(i, seed + 7) > 0.93 ? 1 : 0;
  }
  // two nearest neighbours per node (bounded search over a sample for speed)
  const edges: number[] = [];
  const step = 3;
  for (let i = 0; i < count; i += 1) {
    let b1 = -1;
    let b2 = -1;
    let d1 = Infinity;
    let d2 = Infinity;
    for (let j = i % step; j < count; j += step) {
      if (j === i) continue;
      const dx = pos[i * 3] - pos[j * 3];
      const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
      const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
      const d = dx * dx + dy * dy + dz * dz;
      if (d < d1) {
        d2 = d1;
        b2 = b1;
        d1 = d;
        b1 = j;
      } else if (d < d2) {
        d2 = d;
        b2 = j;
      }
    }
    if (b1 >= 0) edges.push(i, b1);
    if (b2 >= 0 && i % 2 === 0) edges.push(i, b2);
  }
  return { pos, lead, edges: new Uint32Array(edges) };
};

type Props = {
  readonly galaxy: Galaxy;
  readonly origin: V3;
  /** frame at which the nodes start flying out of the seed */
  readonly burstAt: number;
  readonly burstFrames?: number;
  /** optional per-node start positions (e.g. sampled from the refinery) */
  readonly from?: Float32Array;
  readonly linkReveal: number;
  readonly opacity?: number;
  readonly rotation?: number;
  readonly pulseCount?: number;
  readonly sizeScale?: number;
};

export const Constellation: React.FC<Props> = ({
  galaxy,
  origin,
  burstAt,
  burstFrames = 90,
  from,
  linkReveal,
  opacity = 1,
  rotation = 0,
  pulseCount = 240,
  sizeScale = 1,
}) => {
  const frame = useCurrentFrame();
  const n = galaxy.pos.length / 3;
  const edgeCount = galaxy.edges.length / 2;
  const cur = useMemo(() => new Float32Array(n * 3), [n]);

  for (let i = 0; i < n; i++) {
    const delay = hash(i, 21) * burstFrames * 0.35;
    const t = clamp((frame - burstAt - delay) / (burstFrames * 0.65));
    const e = EASE.out(t);
    const sx = from ? from[i * 3] : 0;
    const sy = from ? from[i * 3 + 1] : 0;
    const sz = from ? from[i * 3 + 2] : 0;
    cur[i * 3] = sx + (galaxy.pos[i * 3] - sx) * e;
    cur[i * 3 + 1] = sy + (galaxy.pos[i * 3 + 1] - sy) * e;
    cur[i * 3 + 2] = sz + (galaxy.pos[i * 3 + 2] - sz) * e;
  }
  const started = frame >= burstAt;

  return (
    <group position={origin} rotation={[0, rotation, 0]}>
      {started ? (
        <GlowPoints
          count={n}
          write={(i, o) => {
            o.p.set(cur[i * 3], cur[i * 3 + 1], cur[i * 3 + 2]);
            const tw = 0.75 + 0.25 * Math.sin(frame * 0.07 + i * 1.7);
            const isLead = galaxy.lead[i] === 1;
            const c = isLead ? HDR.orange : hash(i, 4) > 0.5 ? HDR.ice : HDR.dim;
            const k = (isLead ? 1 : 0.55 + 0.45 * hash(i, 6)) * tw * opacity;
            o.c.setRGB(c[0] * k, c[1] * k, c[2] * k);
            o.size = (isLead ? 0.16 : 0.07 + 0.05 * hash(i, 8)) * sizeScale;
          }}
        />
      ) : null}
      {linkReveal > 0 ? (
        <Links
          count={edgeCount}
          opacity={opacity}
          write={(i, o) => {
            const a = galaxy.edges[i * 2];
            const b = galaxy.edges[i * 2 + 1];
            o.a.set(cur[a * 3], cur[a * 3 + 1], cur[a * 3 + 2]);
            o.b.set(cur[b * 3], cur[b * 3 + 1], cur[b * 3 + 2]);
            const vis = clamp((linkReveal - hash(i, 9) * 0.8) / 0.2);
            const k = 0.22 * vis;
            o.c.setRGB(0.25 * k, 0.75 * k, 0.8 * k);
          }}
        />
      ) : null}
      {linkReveal > 0.3 && pulseCount > 0 ? (
        <GlowPoints
          count={pulseCount}
          write={(i, o) => {
            const e = Math.floor(hash(i, 12) * edgeCount);
            const a = galaxy.edges[e * 2];
            const b = galaxy.edges[e * 2 + 1];
            const t = (frame * (0.012 + 0.02 * hash(i, 13)) + hash(i, 14)) % 1;
            o.p.set(
              cur[a * 3] + (cur[b * 3] - cur[a * 3]) * t,
              cur[a * 3 + 1] + (cur[b * 3 + 1] - cur[a * 3 + 1]) * t,
              cur[a * 3 + 2] + (cur[b * 3 + 2] - cur[a * 3 + 2]) * t,
            );
            const k = clamp((linkReveal - 0.3) / 0.3) * opacity;
            o.c.setRGB(HDR.orange[0] * k, HDR.orange[1] * k, HDR.orange[2] * k);
            o.size = 0.06 * sizeScale;
          }}
        />
      ) : null}
    </group>
  );
};

/** Ambient dust that always surrounds the camera: real foreground/mid/background parallax. */
export const Dust: React.FC<{ readonly camPos: V3; readonly count?: number; readonly box?: number }> = ({
  camPos,
  count = 900,
  box = 46,
}) => {
  const frame = useCurrentFrame();
  const v = useMemo(() => new THREE.Vector3(), []);
  return (
    <GlowPoints
      count={count}
      write={(i, o) => {
        const bx = hash(i, 31) * box + Math.sin(frame * 0.004 + i) * 1.2;
        const by = hash(i, 32) * box + frame * 0.004 * (0.5 + hash(i, 35));
        const bz = hash(i, 33) * box;
        const wrap = (b: number, c: number) => ((((b - c) % box) + box) % box) - box / 2;
        v.set(
          camPos[0] + wrap(bx, camPos[0]),
          camPos[1] + wrap(by, camPos[1]),
          camPos[2] + wrap(bz, camPos[2]),
        );
        o.p.copy(v);
        const warm = hash(i, 34) > 0.8;
        const k = 0.35 + 0.35 * hash(i, 36);
        o.c.setRGB(warm ? 1.2 * k : 0.5 * k, warm ? 0.55 * k : 0.85 * k, warm ? 0.08 * k : 0.9 * k);
        o.size = 0.035 + 0.04 * hash(i, 37);
      }}
    />
  );
};
