import type React from "react";
import { useMemo } from "react";
import * as THREE from "three";
import { useCurrentFrame } from "remotion";
import { Constellation, makeGalaxy } from "./Constellation";
import { Refinery, sampleRefinery } from "./Refinery";
import {
  Beam,
  Figures,
  Floor,
  GlowPoints,
  LightArc,
  Links,
  Orb,
  Ring,
  emissiveInstancedMaterial,
  hash,
} from "./primitives";
import { HDR, SET } from "../layout";
import { add, arc, clamp, EASE, lerp3, ramp, type V3 } from "../math";
import { at, cue, FPS, LOGO_HIT, SCENES } from "../timeline";
import { leadershipPath } from "../camera";
import {
  AWARDS,
  BEACONS,
  CORE,
  CRITICAL,
  DNA_FLOW,
  ECO_RADIUS,
  FLOWS,
  GATES,
  HOME,
  HOST,
  LEVELS,
  PROGRAMS,
  SEATS,
  STAGES,
  TERRACE,
  TIERS,
  TILE,
  TOWER_R,
  heroAscent,
  helixPoint,
  orgNode,
  orgParent,
  programPos,
  seatPos,
  stagePos,
  terraceBase,
  tilePos,
} from "../geometry";

const v = (p: V3) => p as unknown as [number, number, number];
const mulc = (c: V3, k: number): V3 => [c[0] * k, c[1] * k, c[2] * k];

/* =================================================================== 01 */
export const OpeningSet: React.FC = () => {
  const frame = useCurrentFrame();
  const galaxy = useMemo(() => makeGalaxy(1800, 16, 1), []);
  const O = SET.opening as V3;
  const burst = at("opening", 4.2);
  const pre = frame < burst;
  const breath = 0.82 + 0.18 * Math.sin(frame * 0.16);
  const charge = ramp(frame, at("opening", 2.4), burst, EASE.in);
  const appear = ramp(frame, at("opening", 0.3), at("opening", 2.2));
  const seedR = pre ? (0.045 + 0.05 * charge) * breath * appear : 0;
  const shock = ramp(frame, burst, burst + 45);
  const linkReveal = ramp(frame, burst + 25, burst + 170, EASE.inOut);
  return (
    <group>
      <Orb position={O} radius={seedR} color={[4.5, 2.4, 0.7]} />
      {pre ? <pointLight position={v(O)} intensity={4 + charge * 40} distance={9} color="#ff9a30" /> : null}
      {shock > 0 && shock < 1 ? (
        <Ring position={O} radius={0.3 + shock * 18} tube={0.035} color={mulc([2.4, 1.0, 0.05], 1 - shock)} rotation={[Math.PI / 2 - 0.35, 0, 0]} />
      ) : null}
      <Constellation
        galaxy={galaxy}
        origin={O}
        burstAt={burst}
        burstFrames={120}
        linkReveal={linkReveal}
        rotation={frame * 0.0016}
      />
    </group>
  );
};

/* =================================================================== 02 */
const WORKERS: V3[] = [
  [-12, 0, -1], [-9.5, 0, -1.5], [-6, 0, 1.2], [-3, 0, 6.3], [-1.5, 0, 6.6], [0.5, 0, 6.2],
  [3, 0, 7], [6.5, 0, -2.8], [10.5, 0, -2.6], [13.8, 0, 1.2], [14.2, 0, 8.5], [11, 0, 6.5],
  [-15.5, 0, 5], [-16.5, 0, -2], [4.5, 0, 1.2], [-6.5, 0, 7.8], [8, 0, 9], [1.8, 0, -5.8],
  [-2.5, 0, -6.5], [16, 0, -5.5], [-10, 0, 8.5], [-4.5, 0, 2],
];
export const WHY_HIGHLIGHT = [1, 9, 14] as const;
export const workerPos = (i: number): V3 => add(SET.why as V3, WORKERS[i]);

export const WhySet: React.FC = () => {
  const frame = useCurrentFrame();
  const W = SET.why as V3;
  const build = ramp(frame, at("why", -0.6), at("why", 4.2), EASE.inOut);
  const cues = [
    cue("why", 0, "the right talent"),
    cue("why", 0, "in the right roles"),
    cue("why", 0, "at the right time"),
  ];
  return (
    <group>
      <Floor center={W} radius={46} cell={1.2} reveal={ramp(frame, at("why", -1), at("why", 3.5))} />
      <Refinery origin={W} build={build} />
      <Figures
        count={WORKERS.length}
        write={(i, o) => {
          const p = workerPos(i);
          const show = ramp(frame, at("why", 2.5) + i * 2, at("why", 3.5) + i * 2);
          o.p.set(p[0], p[1], p[2]);
          o.s = 0.9 * show;
          o.rotY = hash(i, 3) * 6.28 + Math.sin(frame * 0.02 + i) * 0.2;
          const hi = WHY_HIGHLIGHT.indexOf(i as 1 | 9 | 14);
          const on = hi >= 0 ? ramp(frame, cues[hi], cues[hi] + 12) : 0;
          const base: V3 = [0.12, 0.45, 0.5];
          const c = lerp3(base, HDR.orange, on);
          o.c.setRGB(c[0], c[1], c[2]);
        }}
      />
      {WHY_HIGHLIGHT.map((wi, k) => {
        const on = ramp(frame, cues[k], cues[k] + 15);
        const p = workerPos(wi);
        return on > 0 ? (
          <group key={wi}>
            <Ring position={add(p, [0, 0.03, 0])} radius={0.7 + 0.15 * Math.sin(frame * 0.12)} tube={0.03} color={mulc(HDR.orange, on)} />
            <Beam position={add(p, [0, 7, 0])} height={7} radius={0.9} color={[1.0, 0.45, 0.05]} opacity={0.35 * on} />
          </group>
        ) : null;
      })}
    </group>
  );
};

/* =================================================================== 03 */
export const EcosystemSet: React.FC = () => {
  const frame = useCurrentFrame();
  const E = SET.ecosystem as V3;
  const hubIn = ramp(frame, at("ecosystem", 0.2), at("ecosystem", 2.2));
  const ringCue = cue("ecosystem", 1, "Each programme");
  const ringLink = ramp(frame, ringCue, ringCue + 90, EASE.inOut);
  const spin = frame * 0.004;
  const nodes = PROGRAMS.map((_, i) => programPos(i));
  const appear = (i: number) => ramp(frame, at("ecosystem", 1.4) + i * 7, at("ecosystem", 2.4) + i * 7);
  return (
    <group>
      <Floor center={add(E, [0, -6, 0])} radius={34} cell={1.5} reveal={hubIn} />
      {/* hub */}
      <Orb position={E} radius={1.15 * hubIn} color={[3.4, 1.4, 0.15]} />
      <Orb position={E} radius={0.6 * hubIn} color={[5, 3.5, 1.5]} />
      <mesh position={v(E)} rotation={[spin, spin * 1.3, 0]} scale={hubIn}>
        <icosahedronGeometry args={[2.1, 1]} />
        <meshBasicMaterial color={new THREE.Color(0, 1.0, 1.1)} wireframe toneMapped={false} />
      </mesh>
      <Ring position={E} radius={3.0 * hubIn} tube={0.03} color={[0.1, 1.2, 1.3]} rotation={[Math.PI / 2 + 0.4, spin * 2, 0]} />
      <Ring position={E} radius={3.6 * hubIn} tube={0.02} color={[2, 0.8, 0.05]} rotation={[Math.PI / 2 - 0.5, -spin * 1.5, 0.3]} />
      <pointLight position={v(E)} intensity={40 * hubIn} distance={30} color="#ff9030" />
      {/* orbit guide */}
      <Ring position={add(E, [0, 0, 0])} radius={ECO_RADIUS * hubIn} tube={0.012} color={[0.1, 0.4, 0.45]} rotation={[Math.PI / 2 - 0.27, 0, 0]} />
      {/* programmes */}
      {nodes.map((p, i) => (
        <group key={i}>
          <Orb position={p} radius={0.42 * appear(i)} color={i % 3 === 0 ? [2.6, 1.0, 0.05] : [0.1, 1.5, 1.6]} />
          <mesh position={v(p)} scale={appear(i)}>
            <sphereGeometry args={[0.85, 32, 20]} />
            <meshStandardMaterial color="#9cdbd9" metalness={0.1} roughness={0.05} transparent opacity={0.16} />
          </mesh>
          <LightArc from={E} to={p} lift={1.8} progress={appear(i)} color={[0.05, 0.9, 1.0]} radius={0.025} />
          {i < nodes.length ? (
            <LightArc
              from={p}
              to={nodes[(i + 1) % nodes.length]}
              lift={0.6}
              progress={clamp(ringLink * nodes.length - i)}
              color={[2.2, 0.85, 0.04]}
              radius={0.03}
            />
          ) : null}
        </group>
      ))}
      {/* data pulses: hub → programmes, then programme → next programme */}
      <GlowPoints
        count={72}
        write={(i, o) => {
          const n = i % 12;
          const kind = Math.floor(i / 12) % 6;
          const t = (frame * 0.012 + hash(i, 2)) % 1;
          const p = kind < 3 ? arc(E, nodes[n], 1.8, t) : arc(nodes[n], nodes[(n + 1) % 12], 0.6, t);
          o.p.set(p[0], p[1], p[2]);
          const k = kind < 3 ? appear(n) : clamp(ringLink * 12 - n);
          const c = kind < 3 ? HDR.ice : HDR.orange;
          o.c.setRGB(c[0] * k, c[1] * k, c[2] * k);
          o.size = 0.14 * k;
        }}
      />
    </group>
  );
};

/* =================================================================== 04 */
export const PerformanceSet: React.FC = () => {
  const frame = useCurrentFrame();
  const P = SET.performance as V3;
  const dissolve = ramp(frame, at("performance", 3.0), at("performance", 6.5), EASE.inOut);
  const grow = ramp(frame, at("performance", 3.4), at("performance", 10.5), EASE.inOut);
  const spin = frame * 0.01;
  const flowCue = cue("performance", 1, "It creates");
  const flow1 = ramp(frame, flowCue, flowCue + 40, EASE.inOut);
  const flow2 = ramp(frame, flowCue + 35, flowCue + 75, EASE.inOut);
  const rungs = 30;
  return (
    <group>
      <Floor center={P} radius={30} cell={1} reveal={ramp(frame, at("performance", -0.6), at("performance", 2))} />
      {/* the employee */}
      <Figures
        count={36}
        write={(i, o) => {
          if (i === 0) {
            o.p.set(P[0], P[1], P[2]);
            o.s = 1.05 * (1 - dissolve * 0.85);
            const k = 1 - dissolve;
            o.c.setRGB(HDR.orange[0] * (0.35 + 0.65 * k), HDR.orange[1] * (0.35 + 0.65 * k), HDR.orange[2]);
            return;
          }
          const a = hash(i, 5) * Math.PI * 2;
          const r = 6 + hash(i, 6) * 12;
          o.p.set(P[0] + Math.cos(a) * r, P[1], P[2] + Math.sin(a) * r);
          o.s = 0.85;
          o.rotY = a + Math.PI;
          o.c.setRGB(0.06, 0.22, 0.25);
        }}
      />
      <Ring position={add(P, [0, 0.04, 0])} radius={0.9} tube={0.03} color={HDR.orange} />
      {/* talent DNA: streams of data rising out of the employee */}
      <GlowPoints
        count={900}
        write={(i, o) => {
          const strand = (i % 2) as 0 | 1;
          const s = (hash(i, 7) + frame * (0.0025 + 0.002 * hash(i, 8))) % 1;
          if (s > grow) {
            o.size = 0;
            o.p.set(P[0], P[1], P[2]);
            return;
          }
          const p = helixPoint(s, strand, spin);
          const jitter = 0.12 * (hash(i, 9) - 0.5);
          // very low points still emerge from the body
          const body: V3 = add(P, [0, 0.9, 0]);
          const near = clamp(s * 6);
          const q = lerp3(body, p, near);
          o.p.set(q[0] + jitter, q[1], q[2] + jitter);
          const c = i % 7 === 0 ? HDR.white : strand ? HDR.turquoise : HDR.orange;
          const k = 0.6 + 0.4 * hash(i, 10);
          o.c.setRGB(c[0] * k, c[1] * k, c[2] * k);
          o.size = 0.06 + 0.05 * hash(i, 11);
        }}
      />
      <Links
        count={rungs}
        write={(i, o) => {
          const s = (i + 0.5) / rungs;
          if (s > grow) return;
          const a = helixPoint(s, 0, spin);
          const b = helixPoint(s, 1, spin);
          o.a.set(a[0], a[1], a[2]);
          o.b.set(b[0], b[1], b[2]);
          o.c.setRGB(0.5, 0.9, 1.0);
        }}
      />
      {/* "Performance results → talent reviews → leadership decisions" */}
      <LightArc from={DNA_FLOW[0]} to={DNA_FLOW[1]} lift={1.2} progress={flow1} color={[2.6, 1.0, 0.05]} radius={0.04} />
      <LightArc from={DNA_FLOW[1]} to={DNA_FLOW[2]} lift={1.2} progress={flow2} color={[2.6, 1.0, 0.05]} radius={0.04} />
      {DNA_FLOW.map((p, i) => (
        <Orb key={i} position={p} radius={0.22 * (i === 0 ? ramp(frame, flowCue - 10, flowCue) : i === 1 ? flow1 : flow2)} color={HDR.orange} />
      ))}
      <pointLight position={v(add(P, [0, 6, 0]))} intensity={30 * grow} distance={20} color="#ff9030" />
    </group>
  );
};

/* =================================================================== 05 */
const NB_COUNT = 150;
const nbTarget = (i: number): [number, number] => {
  if (i === 0) return [2, 2];
  const r = hash(i, 41);
  // distribution skewed to the centre (core talent) with a healthy top-right
  const perf = r < 0.2 ? 0 : r < 0.72 ? 1 : 2;
  const r2 = hash(i, 42);
  const pot = r2 < 0.25 ? 0 : r2 < 0.75 ? 1 : 2;
  return [perf, pot];
};

export const NineBoxSet: React.FC = () => {
  const frame = useCurrentFrame();
  const N = SET.ninebox as V3;
  const tilesIn = (k: number) => ramp(frame, at("ninebox", 0.2) + k * 4, at("ninebox", 1.4) + k * 4);
  const heroLand = cue("ninebox", 0, "identify future leaders");
  const hot = ramp(frame, heroLand, heroLand + 20);
  const tileMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0f2a38", metalness: 0.4, roughness: 0.15, transparent: true, opacity: 0.55 }),
    [],
  );
  return (
    <group>
      <Floor center={add(N, [0, -0.2, 0])} radius={26} cell={1} reveal={tilesIn(0)} />
      {[0, 1, 2].map((perf) =>
        [0, 1, 2].map((pot) => {
          const k = pot * 3 + perf;
          const isHot = perf === 2 && pot === 2;
          const warm = (perf === 2 && pot === 1) || (perf === 1 && pot === 2);
          const t = tilesIn(k);
          const p = tilePos(perf, pot);
          const lift = isHot ? hot * 0.7 : 0;
          const edge: V3 = isHot ? lerp3([0.1, 1.2, 1.3], HDR.orange, hot) : warm ? [1.4, 0.55, 0.05] : [0.05, 0.9, 1.0];
          return (
            <group key={k} position={[p[0], p[1] + lift - (1 - t) * 3, p[2]]} scale={[t, 1, t]}>
              <mesh material={tileMat}>
                <boxGeometry args={[TILE - 0.35, 0.16, TILE - 0.35]} />
              </mesh>
              <lineSegments>
                <edgesGeometry args={[new THREE.BoxGeometry(TILE - 0.35, 0.16, TILE - 0.35)]} />
                <lineBasicMaterial color={new THREE.Color(...edge)} toneMapped={false} />
              </lineSegments>
              {isHot && hot > 0 ? (
                <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[TILE - 0.5, TILE - 0.5]} />
                  <meshBasicMaterial color={new THREE.Color(1.6 * hot, 0.6 * hot, 0.02)} transparent opacity={0.35} toneMapped={false} />
                </mesh>
              ) : null}
            </group>
          );
        }),
      )}
      {hot > 0 ? <Beam position={add(tilePos(2, 2), [0, 9, 0])} height={9} radius={2.4} color={[1.2, 0.5, 0.05]} opacity={0.3 * hot} /> : null}
      {/* employees streaming in and settling by performance × potential */}
      <GlowPoints
        count={NB_COUNT}
        write={(i, o) => {
          const [perf, pot] = nbTarget(i);
          const tile = tilePos(perf, pot);
          const jx = (hash(i, 43) - 0.5) * (TILE - 1.2);
          const jz = (hash(i, 44) - 0.5) * (TILE - 1.2);
          const target: V3 = [tile[0] + jx, tile[1] + 0.35 + (perf === 2 && pot === 2 ? hot * 0.7 : 0), tile[2] + jz];
          const start: V3 = add(N, [-26 + hash(i, 45) * 4, 6 + hash(i, 46) * 4, 12 + hash(i, 47) * 6]);
          const t0 = i === 0 ? heroLand - 50 : at("ninebox", 1.2) + hash(i, 48) * 150;
          const t = ramp(frame, t0, t0 + 55, EASE.inOut);
          const p = arc(start, target, 4, t);
          const bob = t >= 1 ? Math.sin(frame * 0.08 + i) * 0.06 : 0;
          o.p.set(p[0], p[1] + bob, p[2]);
          const c = i === 0 ? HDR.orange : perf + pot >= 3 ? HDR.ice : HDR.dim;
          const k = clamp(t * 4);
          o.c.setRGB(c[0] * k, c[1] * k, c[2] * k);
          o.size = (i === 0 ? 0.32 : 0.15) * clamp(t * 3);
        }}
      />
      <pointLight position={v(add(tilePos(2, 2), [0, 3, 0]))} intensity={25 * hot} distance={14} color="#ff9030" />
    </group>
  );
};

/* =================================================================== 06 */
export const CriticalSet: React.FC = () => {
  const frame = useCurrentFrame();
  const C = SET.critical as V3;
  const reveal = ramp(frame, at("critical", 0.1), at("critical", 2.6), EASE.inOut);
  const scanStart = cue("critical", 1, "Critical Roles");
  const scanY = 13.5 - ramp(frame, scanStart, scanStart + 110, EASE.inOut) * 13;
  const scanning = frame > scanStart && frame < scanStart + 115;
  const nodes: Array<{ tier: number; k: number; p: V3 }> = [];
  TIERS.forEach((t, tier) => {
    for (let k = 0; k < t.n; k++) nodes.push({ tier, k, p: orgNode(tier, k) });
  });
  const crit = (tier: number, k: number) => CRITICAL.some((c) => c.tier === tier && c.k === k);
  const ignite = (p: V3) => (frame > scanStart ? clamp((13.5 - scanY - (13.5 - (p[1] - C[1]))) / 0.8 + 1) : 0);
  return (
    <group>
      <Floor center={C} radius={28} cell={1} reveal={reveal} />
      <Links
        count={nodes.length}
        write={(i, o) => {
          const n = nodes[i];
          if (n.tier === 0) return;
          const parent = orgNode(n.tier - 1, orgParent(n.tier, n.k));
          const t = clamp(reveal * 4 - n.tier);
          o.a.set(parent[0], parent[1], parent[2]);
          o.b.set(parent[0] + (n.p[0] - parent[0]) * t, parent[1] + (n.p[1] - parent[1]) * t, parent[2] + (n.p[2] - parent[2]) * t);
          const on = crit(n.tier, n.k) ? ignite(n.p) : 0;
          const c = lerp3([0.12, 0.45, 0.5], [1.6, 0.6, 0.03], on);
          o.c.setRGB(c[0], c[1], c[2]);
        }}
      />
      {nodes.map((n, i) => {
        const isCrit = crit(n.tier, n.k);
        const on = isCrit ? ignite(n.p) : 0;
        const t = clamp(reveal * 4 - n.tier + 0.3);
        const r = (n.tier === 0 ? 0.55 : n.tier === 1 ? 0.42 : n.tier === 2 ? 0.32 : 0.24) * t;
        const pulse = (frame * 0.02 + i * 0.13) % 1;
        return (
          <group key={i}>
            <mesh position={v(n.p)}>
              <octahedronGeometry args={[r * (1 + on * 0.35), 0]} />
              <meshStandardMaterial
                color={isCrit && on > 0 ? "#ff8200" : "#2a4655"}
                emissive={new THREE.Color(...(isCrit ? lerp3([0.05, 0.25, 0.28], [2.4, 0.9, 0.04], on) : ([0.05, 0.25, 0.28] as V3)))}
                metalness={0.5}
                roughness={0.25}
                toneMapped={false}
              />
            </mesh>
            {on > 0 ? (
              <>
                <Ring position={n.p} radius={r * (2 + pulse * 4)} tube={0.02} color={mulc(HDR.orange, on * (1 - pulse))} rotation={[Math.PI / 2, 0, 0]} />
                <Beam position={add(n.p, [0, 9, 0])} height={9} radius={0.5} color={[1.2, 0.45, 0.04]} opacity={0.28 * on} />
              </>
            ) : null}
          </group>
        );
      })}
      {scanning ? (
        <Ring position={add(C, [0, scanY, 0])} radius={1 + (13.5 - scanY) * 0.75} tube={0.05} color={[0.2, 1.8, 1.9]} />
      ) : null}
    </group>
  );
};

/* =================================================================== 07 */
export const SuccessionSet: React.FC = () => {
  const frame = useCurrentFrame();
  const S = SET.succession as V3;
  const reveal = ramp(frame, at("succession", -0.5), at("succession", 2));
  const vacancy = at("succession", 2.4);
  const climbStart = at("succession", 3.6);
  const climbEnd = at("succession", 10.6);
  const climb = ramp(frame, climbStart, climbEnd, EASE.inOut);
  const vacant = frame > vacancy && climb < 1;
  const blink = vacant ? 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(frame * 0.5)) : 1;
  const hero = heroAscent(climb);
  return (
    <group>
      <Floor center={S} radius={22} cell={1} reveal={reveal} />
      {/* central light pipe */}
      <mesh position={v(add(S, [0, LEVELS[3] / 2, 0]))}>
        <cylinderGeometry args={[0.07, 0.07, LEVELS[3] * reveal, 12]} />
        <meshBasicMaterial color={new THREE.Color(0.2, 1.6, 1.7)} toneMapped={false} />
      </mesh>
      {LEVELS.map((y, li) => (
        <Ring
          key={li}
          position={add(S, [0, y, 0])}
          radius={TOWER_R * clamp(reveal * 4 - li * 0.6)}
          tube={li === 3 ? 0.06 : 0.04}
          color={li === 3 ? HDR.orange : [0.1, 1.2, 1.3]}
        />
      ))}
      <GlowPoints
        count={SEATS.reduce((a, b) => a + b, 0)}
        write={(i, o) => {
          let li = 0;
          let k = i;
          while (k >= SEATS[li]) {
            k -= SEATS[li];
            li++;
          }
          const p = seatPos(li, k, SEATS[li]);
          o.p.set(p[0], p[1] + 0.25, p[2]);
          const isVacant = li === 3 && k === 0;
          const isHeroStart = li === 0 && k === 2;
          let c: V3 = li === 3 ? HDR.orange : HDR.ice;
          let kk = clamp(reveal * 4 - li * 0.6);
          if (isVacant) {
            c = HDR.orange;
            kk *= climb >= 1 ? 1.4 : frame > vacancy ? blink * 0.3 : 1;
          }
          if (isHeroStart && frame > climbStart) kk *= 0.25;
          o.c.setRGB(c[0] * kk, c[1] * kk, c[2] * kk);
          o.size = li === 3 ? 0.42 : 0.3;
        }}
      />
      {/* other successors drifting up between levels (development in progress) */}
      <GlowPoints
        count={40}
        write={(i, o) => {
          const li = i % 3;
          const t = (frame * 0.004 + hash(i, 71)) % 1;
          const a = hash(i, 72) * Math.PI * 2 + t * 1.5;
          const r = TOWER_R * (0.55 + 0.3 * hash(i, 73));
          o.p.set(S[0] + Math.cos(a) * r, S[1] + LEVELS[li] + t * 4, S[2] + Math.sin(a) * r);
          const k = reveal * Math.sin(t * Math.PI);
          o.c.setRGB(HDR.ice[0] * k * 0.6, HDR.ice[1] * k * 0.6, HDR.ice[2] * k * 0.6);
          o.size = 0.12;
        }}
      />
      {/* the hero successor */}
      {frame > climbStart - 10 ? (
        <>
          <GlowPoints
            count={50}
            write={(i, o) => {
              const t = clamp(climb - i * 0.006);
              const p = heroAscent(t);
              o.p.set(p[0], p[1] + 0.25, p[2]);
              const k = (1 - i / 50) * (i === 0 ? 1.5 : 0.7);
              o.c.setRGB(HDR.orange[0] * k, HDR.orange[1] * k, HDR.orange[2] * k);
              o.size = i === 0 ? 0.45 : 0.14;
            }}
          />
          <pointLight position={v(add(hero, [0, 0.5, 0]))} intensity={20} distance={8} color="#ff9030" />
        </>
      ) : null}
      {climb >= 1 ? <Beam position={add(seatPos(3, 0, SEATS[3]), [0, 8, 0])} height={8} radius={1.1} color={[1.2, 0.5, 0.05]} opacity={0.35 * ramp(frame, climbEnd, climbEnd + 20)} /> : null}
    </group>
  );
};

/* =================================================================== 08 */
export const LeadershipSet: React.FC = () => {
  const frame = useCurrentFrame();
  const L = SET.leadership as V3;
  const travel = ramp(frame, at("leadership", 0.2), at("leadership", 14.2), (t) => t);
  const pathGeom = useMemo(() => {
    const pts = Array.from({ length: 80 }, (_, i) => new THREE.Vector3(...leadershipPath(i / 79)));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 240, 0.09, 8, false);
  }, []);
  const glowCount = Math.floor((pathGeom.index!.count / 8) * clamp(travel + 0.08)) * 8;
  pathGeom.setDrawRange(0, glowCount);
  return (
    <group>
      <Floor center={add(L, [0, -0.6, 0])} radius={32} cell={1.2} />
      <mesh geometry={pathGeom}>
        <meshBasicMaterial color={new THREE.Color(2.4, 0.95, 0.05)} toneMapped={false} />
      </mesh>
      {/* faint full route ahead */}
      <GlowPoints
        count={120}
        write={(i, o) => {
          const t = i / 119;
          const p = leadershipPath(t);
          o.p.set(p[0], p[1], p[2]);
          const k = t > travel ? 0.35 : 0;
          o.c.setRGB(0.1 * k, 0.9 * k, 1.0 * k);
          o.size = 0.07;
        }}
      />
      {GATES.map((g, i) => {
        const p = leadershipPath(g.t);
        const ahead = leadershipPath(Math.min(1, g.t + 0.01));
        const yaw = Math.atan2(ahead[0] - p[0], ahead[2] - p[2]);
        const passed = ramp(frame, at("leadership", 0.2) + g.t * 14 * FPS - 6, at("leadership", 0.2) + g.t * 14 * FPS + 10);
        const c = lerp3([0.1, 1.1, 1.2], [3.0, 1.2, 0.06], passed);
        return (
          <group key={i} position={v(p)} rotation={[0, yaw, 0]}>
            <mesh rotation={[0, 0, 0]}>
              <torusGeometry args={[2.6, 0.06, 10, 80, Math.PI]} />
              <meshBasicMaterial color={new THREE.Color(...c)} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 0]}>
              <torusGeometry args={[2.95, 0.015, 6, 80, Math.PI]} />
              <meshBasicMaterial color={new THREE.Color(0.1, 0.6, 0.65)} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
      {/* the hero and its trail */}
      <GlowPoints
        count={60}
        write={(i, o) => {
          const t = clamp(travel - i * 0.0035);
          const p = leadershipPath(t);
          o.p.set(p[0], p[1] + 0.5, p[2]);
          const k = (1 - i / 60) * (i === 0 ? 1.6 : 0.8);
          o.c.setRGB(HDR.orange[0] * k, HDR.orange[1] * k, HDR.orange[2] * k);
          o.size = i === 0 ? 0.5 : 0.16;
        }}
      />
      <pointLight position={v(add(leadershipPath(travel), [0, 1.2, 0]))} intensity={30} distance={10} color="#ff9030" />
      {/* future leaders collaborating along the route */}
      <Figures
        count={16}
        write={(i, o) => {
          const t = (i + 0.5) / 16;
          const p = leadershipPath(t);
          const side = i % 2 ? 3.5 : -3.5;
          o.p.set(p[0], L[1] - 0.6, p[2] + side);
          o.rotY = side > 0 ? Math.PI : 0;
          const lit = travel > t ? 1 : 0.3;
          o.c.setRGB(0.15 * lit, 0.55 * lit, 0.6 * lit);
          o.s = 0.85;
        }}
      />
    </group>
  );
};

/* =================================================================== 09 */
export const NationalizationSet: React.FC = () => {
  const frame = useCurrentFrame();
  const Q = SET.nationalization as V3;
  const count = STAGES.length * TERRACE.cols;
  const mat = useMemo(() => emissiveInstancedMaterial(0.45, 0.6, 0.22), []);
  const mesh = useMemo(() => new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat, count), [mat, count]);
  const growth = ramp(frame, at("nationalization", 0.0), at("nationalization", 12), (t) => t);
  const m = useMemo(() => new THREE.Matrix4(), []);
  const c = useMemo(() => new THREE.Color(), []);
  for (let row = 0; row < STAGES.length; row++) {
    for (let col = 0; col < TERRACE.cols; col++) {
      const i = row * TERRACE.cols + col;
      const base = terraceBase(row, col);
      const delay = row * 0.12 + hash(i, 81) * 0.25;
      const h = (0.5 + 2.2 * hash(i, 82) + row * 0.5) * clamp((growth - delay) / 0.45);
      m.makeScale(0.72, Math.max(0.001, h), 0.72);
      m.setPosition(base[0], base[1] + h / 2, base[2]);
      mesh.setMatrixAt(i, m);
      // share of national talent rises over time and up the terraces
      const national = hash(i, 83) < 0.35 + 0.5 * growth - row * 0.05;
      const k = 0.5 + 0.5 * hash(i, 84);
      if (national) c.setRGB(0.62 * k, 0.17 * k, 0.0);
      else c.setRGB(0.02 * k, 0.11 * k, 0.13 * k);
      mesh.setColorAt(i, c);
    }
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  return (
    <group>
      <Floor center={add(Q, [0, -0.02, -8])} radius={34} cell={1} />
      <primitive object={mesh} frustumCulled={false} />
      {/* young professionals advancing up the terraces */}
      <GlowPoints
        count={70}
        write={(i, o) => {
          const row = Math.floor(hash(i, 85) * 4);
          const col = Math.floor(hash(i, 86) * TERRACE.cols);
          const t = (frame * 0.006 + hash(i, 87)) % 1;
          const a = terraceBase(row, col);
          const b = terraceBase(row + 1, col);
          const p = arc(add(a, [0, 3.2, 0]), add(b, [0, 3.6, 0]), 1.8, t);
          o.p.set(p[0], p[1], p[2]);
          const k = Math.sin(t * Math.PI) * clamp(growth * 3);
          o.c.setRGB(HDR.orange[0] * k, HDR.orange[1] * k, HDR.orange[2] * k);
          o.size = 0.16;
        }}
      />
      <pointLight position={v(add(Q, [0, 12, -10]))} intensity={30} distance={40} color="#ff9a40" />
    </group>
  );
};

/* =================================================================== 10 */
export const SecondmentSet: React.FC = () => {
  const frame = useCurrentFrame();
  const X = SET.secondment as V3;
  const reveal = ramp(frame, at("secondment", -0.4), at("secondment", 2));
  const cluster = useMemo(() => {
    const n = 220;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const th = hash(i, 91) * Math.PI * 2;
      const ph = Math.acos(2 * hash(i, 92) - 1);
      const r = 2.2 + 1.6 * Math.pow(hash(i, 93), 0.5);
      arr[i * 3] = r * Math.sin(ph) * Math.cos(th);
      arr[i * 3 + 1] = r * Math.cos(ph) * 0.7 + 2.5;
      arr[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    return arr;
  }, []);
  const bridges = [
    { lift: 5, dz: -1.5 },
    { lift: 7.5, dz: 0.5 },
    { lift: 4, dz: 2 },
  ];
  const bridgeIn = ramp(frame, at("secondment", 1.2), at("secondment", 4), EASE.inOut);
  return (
    <group>
      <Floor center={X} radius={30} cell={1.2} reveal={reveal} />
      {[HOME, HOST].map((c, ci) => (
        <group key={ci} position={v(c)} rotation={[0, frame * 0.004 * (ci ? -1 : 1), 0]}>
          <GlowPoints
            count={220}
            write={(i, o) => {
              o.p.set(cluster[i * 3], cluster[i * 3 + 1], cluster[i * 3 + 2]);
              const col = ci === 0 ? (i % 5 === 0 ? HDR.orange : HDR.ice) : i % 5 === 0 ? HDR.turquoise : HDR.ice;
              const k = reveal * (0.5 + 0.5 * hash(i, 94 + ci));
              o.c.setRGB(col[0] * k, col[1] * k, col[2] * k);
              o.size = 0.1;
            }}
          />
          <Ring position={[0, 0.03, 0]} radius={4.2 * reveal} tube={0.03} color={ci === 0 ? HDR.orange : HDR.turquoise} />
        </group>
      ))}
      {bridges.map((b, i) => (
        <LightArc
          key={i}
          from={add(HOME, [-3, 2.5, b.dz])}
          to={add(HOST, [3, 2.5, b.dz])}
          lift={b.lift}
          progress={bridgeIn}
          color={i === 1 ? [2.2, 0.85, 0.04] : [0.05, 1.0, 1.1]}
          radius={0.03}
        />
      ))}
      {/* people travelling both ways, leaving knowledge trails */}
      <GlowPoints
        count={18 * 10}
        write={(i, o) => {
          const traveller = Math.floor(i / 10);
          const tail = i % 10;
          const b = bridges[traveller % 3];
          const dir = traveller % 2;
          const t0 = (frame * 0.0065 + hash(traveller, 95)) % 1;
          const t = clamp(t0 - tail * 0.012);
          const from = add(HOME, [-3, 2.5, b.dz]);
          const to = add(HOST, [3, 2.5, b.dz]);
          const p = dir ? arc(to, from, b.lift, t) : arc(from, to, b.lift, t);
          o.p.set(p[0], p[1], p[2]);
          const col = dir ? HDR.turquoise : HDR.orange;
          const k = bridgeIn * (1 - tail / 10) * (tail === 0 ? 1.4 : 0.6);
          o.c.setRGB(col[0] * k, col[1] * k, col[2] * k);
          o.size = tail === 0 ? 0.24 : 0.1;
        }}
      />
    </group>
  );
};

/* =================================================================== 11 */
const STAGE_R_OUTER = 6.6;
export const RewardsSet: React.FC = () => {
  const frame = useCurrentFrame();
  const R = SET.rewards as V3;
  const reveal = ramp(frame, at("rewards", -0.4), at("rewards", 1.6));
  const n = 14;
  const honoured = [2, 6, 11];
  const spots = [at("rewards", 2.0), at("rewards", 4.6), at("rewards", 7.2)];
  return (
    <group>
      <Floor center={R} radius={22} cell={1} reveal={reveal} />
      <Ring position={add(R, [0, 0.03, 0])} radius={STAGE_R_OUTER * reveal} tube={0.04} color={[0.1, 1.0, 1.1]} />
      <Figures
        count={n}
        write={(i, o) => {
          const p = stagePos(i, n);
          o.p.set(p[0], p[1], p[2]);
          o.rotY = Math.atan2(R[0] - p[0], R[2] - p[2]);
          const h = honoured.indexOf(i);
          const on = h >= 0 ? ramp(frame, spots[h], spots[h] + 15) : 0;
          const c = lerp3([0.1, 0.4, 0.45], HDR.orange, on);
          o.c.setRGB(c[0] * reveal, c[1] * reveal, c[2] * reveal);
          o.s = 0.95;
        }}
      />
      {honoured.map((hi, k) => {
        const on = ramp(frame, spots[k], spots[k] + 20);
        const p = stagePos(hi, n);
        return on > 0 ? (
          <group key={hi}>
            <Beam position={add(p, [0, 12, 0])} height={12} radius={1.3} color={[1.4, 0.95, 0.5]} opacity={0.45 * on} />
            <Ring position={add(p, [0, 0.04, 0])} radius={0.9} tube={0.04} color={mulc(HDR.orange, on)} />
            <pointLight position={v(add(p, [0, 3.2, 0]))} intensity={22 * on} distance={7} color="#ffd9a0" />
          </group>
        ) : null;
      })}
      {/* rising sparks around the honoured */}
      <GlowPoints
        count={160}
        write={(i, o) => {
          const k = i % 3;
          const p0 = stagePos(honoured[k], n);
          const on = ramp(frame, spots[k], spots[k] + 25);
          const t = (frame * 0.008 + hash(i, 101)) % 1;
          const a = hash(i, 102) * Math.PI * 2;
          const r = 0.4 + hash(i, 103) * 1.2;
          o.p.set(p0[0] + Math.cos(a) * r, p0[1] + 0.3 + t * 6, p0[2] + Math.sin(a) * r);
          const kk = on * Math.sin(t * Math.PI) * 0.9;
          o.c.setRGB(2.6 * kk, 1.5 * kk, 0.35 * kk);
          o.size = 0.06;
        }}
      />
      <pointLight position={v(add(R, [0, 6, 0]))} intensity={15 * reveal} distance={20} color="#9cdbd9" />
    </group>
  );
};

/* =================================================================== 12 */
export const PlatformSet: React.FC = () => {
  const frame = useCurrentFrame();
  const A = SET.platform as V3;
  const reveal = ramp(frame, at("platform", -0.6), at("platform", 2.2));
  const spin = frame * 0.006;
  const think = 0.85 + 0.15 * Math.sin(frame * 0.2);
  return (
    <group>
      <Floor center={A} radius={26} cell={1} reveal={reveal} color={[0.0, 0.38, 0.42]} />
      <Orb position={CORE} radius={1.0 * reveal * think} color={[3.6, 1.6, 0.25]} />
      <Orb position={CORE} radius={0.55 * reveal} color={[6, 4.4, 2]} />
      <mesh position={v(CORE)} rotation={[spin, spin * 1.4, 0]} scale={reveal}>
        <icosahedronGeometry args={[2.2, 2]} />
        <meshBasicMaterial color={new THREE.Color(0.05, 1.1, 1.2)} wireframe toneMapped={false} />
      </mesh>
      <mesh position={v(CORE)} rotation={[-spin * 0.6, spin, spin * 0.3]} scale={reveal}>
        <icosahedronGeometry args={[3.3, 1]} />
        <meshBasicMaterial color={new THREE.Color(0.04, 0.35, 0.38)} wireframe toneMapped={false} />
      </mesh>
      {[0, 1, 2].map((k) => (
        <Ring
          key={k}
          position={CORE}
          radius={(4.2 + k * 0.9) * reveal}
          tube={0.02}
          color={k === 1 ? [2.4, 0.9, 0.04] : [0.05, 1.0, 1.1]}
          rotation={[Math.PI / 2 + 0.3 * (k - 1), spin * (k + 1) * 0.7, 0.2 * k]}
        />
      ))}
      {/* insight streams flowing from the core out to the dashboards */}
      <GlowPoints
        count={520}
        write={(i, o) => {
          const shell = 2.6 + 4.5 * ((frame * 0.004 + hash(i, 111)) % 1);
          const th = hash(i, 112) * Math.PI * 2 + spin * 0.5;
          const ph = Math.acos(2 * hash(i, 113) - 1);
          o.p.set(
            CORE[0] + shell * Math.sin(ph) * Math.cos(th),
            CORE[1] + shell * Math.cos(ph) * 0.6,
            CORE[2] + shell * Math.sin(ph) * Math.sin(th),
          );
          const fade = 1 - (shell - 2.6) / 4.5;
          const c = i % 4 === 0 ? HDR.orange : HDR.ice;
          const k = reveal * fade * 0.8;
          o.c.setRGB(c[0] * k, c[1] * k, c[2] * k);
          o.size = 0.06;
        }}
      />
      <pointLight position={v(CORE)} intensity={50 * reveal} distance={26} color="#ff9030" />
      <pointLight position={v(add(A, [0, 8, 8]))} intensity={20 * reveal} distance={26} color="#36d5dd" />
    </group>
  );
};

/* =================================================================== 13 */
export const OverviewSet: React.FC = () => {
  const frame = useCurrentFrame();
  const M = SET.overview as V3;
  const reveal = ramp(frame, at("connections", -1), at("connections", 3), EASE.inOut);
  const ids = Object.keys(BEACONS) as Array<keyof typeof BEACONS>;
  const flowStart = at("connections", 3.2);
  const flowStep = 1.5 * FPS;
  const flowOn = (i: number) => ramp(frame, flowStart + i * flowStep, flowStart + i * flowStep + 30, EASE.inOut);
  const inFlow = (id: string) => FLOWS.some((f) => f.from === id || f.to === id);
  return (
    <group>
      <Floor center={M} radius={90} cell={2} reveal={reveal} color={[0.0, 0.3, 0.34]} />
      {ids.map((id) => {
        const b = BEACONS[id];
        const main = inFlow(id);
        const c: V3 = main ? HDR.orange : [0.1, 1.1, 1.2];
        const h = main ? 9 : 5;
        return (
          <group key={id}>
            <Orb position={add(b.pos, [0, 1, 0])} radius={(main ? 1.3 : 0.9) * reveal} color={c} />
            <mesh position={v(add(b.pos, [0, h / 2, 0]))}>
              <cylinderGeometry args={[0.1, 0.1, h * reveal, 8]} />
              <meshBasicMaterial color={new THREE.Color(...mulc(c, 0.6))} toneMapped={false} />
            </mesh>
            <Ring position={add(b.pos, [0, 0.2, 0])} radius={(main ? 2.8 : 1.8) * reveal} tube={0.08} color={mulc(c, 0.8)} />
          </group>
        );
      })}
      {FLOWS.map((f, i) => (
        <LightArc
          key={i}
          from={add(BEACONS[f.from].pos, [0, 1, 0])}
          to={add(BEACONS[f.to].pos, [0, 1, 0])}
          lift={7}
          progress={flowOn(i)}
          color={[3.0, 1.15, 0.05]}
          radius={0.16}
        />
      ))}
      <GlowPoints
        count={FLOWS.length * 8}
        write={(i, o) => {
          const fi = Math.floor(i / 8);
          const f = FLOWS[fi];
          const on = flowOn(fi);
          const t = (frame * 0.01 + (i % 8) / 8) % 1;
          const p = arc(add(BEACONS[f.from].pos, [0, 1, 0]), add(BEACONS[f.to].pos, [0, 1, 0]), 7, t);
          o.p.set(p[0], p[1], p[2]);
          const k = on >= 1 ? 1.2 : 0;
          o.c.setRGB(HDR.white[0] * k, HDR.white[1] * k, HDR.white[2] * k);
          o.size = 0.6;
        }}
      />
    </group>
  );
};

/* =================================================================== 14 */
export const FutureSet: React.FC = () => {
  const frame = useCurrentFrame();
  const F = SET.future as V3;
  const galaxy = useMemo(() => makeGalaxy(2400, 22, 5), []);
  const from = useMemo(() => {
    const s = sampleRefinery(2400, [0, 0, 0]);
    return s;
  }, []);
  const morphAt = at("future", 6.2);
  const build = ramp(frame, at("future", -0.5), at("future", 2.6), EASE.inOut);
  const dissolve = ramp(frame, morphAt, morphAt + 120, EASE.inOut);
  const galaxyOrigin: V3 = add(F, [0, 10, 0]);
  // the refinery samples are relative to the refinery origin; express them
  // relative to the galaxy origin so the nodes lift off the structures
  const rel = useMemo(() => {
    const out = new Float32Array(from.length);
    for (let i = 0; i < from.length / 3; i++) {
      out[i * 3] = from[i * 3];
      out[i * 3 + 1] = from[i * 3 + 1] - 10;
      out[i * 3 + 2] = from[i * 3 + 2];
    }
    return out;
  }, [from]);
  const linkReveal = ramp(frame, morphAt + 60, morphAt + 200, EASE.inOut);
  const final = ramp(frame, LOGO_HIT - 20, LOGO_HIT + 30);
  const end = SCENES.future.end;
  const fadeAll = 1 - ramp(frame, end - 40, end, EASE.inOut);
  return (
    <group>
      <Floor center={F} radius={60} cell={1.5} reveal={build} />
      <Refinery origin={F} build={build} dissolve={dissolve} />
      <Constellation
        galaxy={galaxy}
        origin={galaxyOrigin}
        burstAt={morphAt}
        burstFrames={200}
        from={rel}
        linkReveal={linkReveal}
        rotation={(frame - morphAt) * 0.0012}
        opacity={(1 + final * 0.6) * fadeAll}
        sizeScale={1.15}
        pulseCount={360}
      />
      {final > 0 ? <Ring position={galaxyOrigin} radius={2 + final * 30} tube={0.06} color={mulc([2.6, 1.0, 0.05], 1 - final)} rotation={[Math.PI / 2 - 0.2, 0, 0]} /> : null}
    </group>
  );
};

export { AWARDS };
