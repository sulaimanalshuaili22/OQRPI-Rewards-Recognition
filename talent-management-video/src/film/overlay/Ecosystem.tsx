/**
 * The master ecosystem model and the two scenes built on it.
 *
 *  03  From a collection of programmes to one cycle: the programmes drift as
 *      separate items, then snap into six stages on "one integrated
 *      ecosystem"; the links between stages light in reading order.
 *  13  One illustrative talent journey walks the same cycle, so the
 *      audience sees how a single person moves through the system.
 */
import type React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { IconTile } from "./Dash";
import { CARD_BG, MINI, MUTED, Person, Stage, Window } from "./Showcase";
import { CROSS_CUTTING, CYCLE, PROGRAMME_CHIPS, RING, linkPos, stagePos } from "../ecosystem";
import { cue, FPS, linesOf, SCENES } from "../timeline";
import { EASE, ramp } from "../math";
import { COLORS, FONT } from "../../theme";

const CARD_W = 330;
const CARD_H = 104;

/** Hand-placed, non-overlapping "collection" layout (one slot per programme chip). */
const SCATTER: ReadonlyArray<[number, number]> = [
  [420, 260], [1000, 230], [1520, 300],
  [300, 470], [760, 420], [1260, 450], [1640, 520],
  [520, 680], [1060, 640], [1480, 760],
];
const scatter = (i: number): [number, number] => SCATTER[i % SCATTER.length];

type DiagramState = {
  /** 0 = programmes scattered, 1 = assembled into the cycle */
  readonly assembled: number;
  /** per-stage emphasis 0..1 */
  readonly lit: (i: number) => number;
  /** per-link visibility 0..1 (link i leaves stage i) */
  readonly link: (i: number) => number;
  /** outer recognition ring 0..1 */
  readonly ring: number;
  /** the centre of the cycle */
  readonly centre: React.ReactNode;
  /**
   * Convergence (scene 03 only): per-chip travel 0..1 from its scattered slot
   * into its stage, per-stage bloom 0..1, the ring drawn 0..1 and the centre
   * 0..1. Without it, `assembled` drives everything as before.
   */
  readonly converge?: {
    readonly chip: (i: number) => number;
    readonly stage: (i: number) => number;
    readonly ringDraw: number;
    readonly centre: number;
  };
};

/** The one definitive diagram. */
/** Where a programme chip ends up: its stage, or the recognition ring. */
const chipTarget = (stage: number | "R"): [number, number] => (stage === "R" ? [RING.cx, RING.cy + RING.ry + 112] : stagePos(stage - 1));

/** The converging flight: a curve that bends through the heart of the system. */
const chipPath = (i: number, k: number): [number, number] => {
  const [sx, sy] = scatter(i);
  const [tx, ty] = chipTarget(PROGRAMME_CHIPS[i].stage);
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const cx = mx + (RING.cx - mx) * 0.3;
  const cy = my + (RING.cy - my) * 0.3;
  const u = 1 - k;
  return [u * u * sx + 2 * u * k * cx + k * k * tx, u * u * sy + 2 * u * k * cy + k * k * ty];
};

const CycleDiagram: React.FC<DiagramState> = ({ assembled, lit, link, ring, centre, converge }) => {
  const frame = useCurrentFrame();
  const { cx, cy, rx, ry } = RING;
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={COLORS.orange} />
          </marker>
        </defs>
        {/* recognition: the outer ring that runs through every stage */}
        <ellipse cx={cx} cy={cy} rx={rx + 150} ry={ry + 112} fill="none" stroke="#F7C548" strokeWidth={2} strokeDasharray="3 10" opacity={0.55 * ring} strokeDashoffset={-frame * 0.6} />
        {/* the cycle */}
        {converge ? (
          // drawn clockwise from 12 o'clock, joining the stages as they form
          <path
            d={`M ${cx} ${cy - ry} A ${rx} ${ry} 0 1 1 ${cx - 0.01} ${cy - ry}`}
            fill="none"
            stroke="rgba(156,219,217,0.32)"
            strokeWidth={2}
            pathLength={1}
            strokeDasharray={`${converge.ringDraw} 1`}
          />
        ) : (
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="rgba(156,219,217,0.16)" strokeWidth={2} opacity={assembled} />
        )}
        {/* light trails: each programme's path into the system */}
        {converge
          ? PROGRAMME_CHIPS.map((c, i) => {
              const k = converge.chip(i);
              if (k <= 0 || k >= 1) return null;
              const N = 18;
              const tail = Math.max(0, k - 0.45);
              const pts = Array.from({ length: N + 1 }, (_, n) => chipPath(i, tail + ((k - tail) * n) / N));
              return (
                <polyline
                  key={c.label}
                  points={pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}
                  fill="none"
                  stroke={c.stage === "R" ? "#F7C548" : COLORS.turquoise}
                  strokeWidth={3}
                  strokeLinecap="round"
                  opacity={0.75 * Math.sin(k * Math.PI)}
                  style={{ filter: "drop-shadow(0 0 6px rgba(0,176,185,0.8))" }}
                />
              );
            })
          : null}
        {CYCLE.map((_, i) => {
          const v = link(i);
          if (v <= 0) return null;
          // an arc from stage i to stage i+1, drawn progressively
          const a0 = -Math.PI / 2 + (i / CYCLE.length) * Math.PI * 2 + 0.24;
          const a1 = -Math.PI / 2 + ((i + 1) / CYCLE.length) * Math.PI * 2 - 0.24;
          const aEnd = a0 + (a1 - a0) * v;
          const N = 24;
          const pts = Array.from({ length: N + 1 }, (_, k) => {
            const a = a0 + ((aEnd - a0) * k) / N;
            return `${(cx + Math.cos(a) * rx).toFixed(1)},${(cy + Math.sin(a) * ry).toFixed(1)}`;
          });
          return (
            <polyline
              key={i}
              points={pts.join(" ")}
              fill="none"
              stroke={COLORS.orange}
              strokeWidth={3.5}
              strokeLinecap="round"
              markerEnd={v > 0.95 ? "url(#arrow)" : undefined}
              style={{ filter: "drop-shadow(0 0 8px rgba(255,130,0,0.6))" }}
            />
          );
        })}
      </svg>
      {/* link captions: what each stage does for the next */}
      {CYCLE.map((s, i) => {
        const v = link(i);
        if (v <= 0) return null;
        const [x, y] = linkPos(i);
        const t = ramp(v, 0.5, 1);
        return (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: x,
              top: y,
              translate: "-50% -50%",
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(8,31,44,0.92)",
              border: `1px solid ${COLORS.orange}88`,
              fontFamily: FONT,
              fontSize: 16,
              fontWeight: 600,
              color: "#FFD9B0",
              whiteSpace: "nowrap",
              opacity: t,
            }}
          >
            {s.link}
          </div>
        );
      })}
      {/* programmes: scattered first, then gathered into their stages */}
      {PROGRAMME_CHIPS.map((c, i) => {
        if (converge) {
          const k = converge.chip(i);
          const ease = EASE.inOut(k);
          const [x, y] = k > 0 ? chipPath(i, ease) : [scatter(i)[0] + Math.sin(frame / 40 + i) * 14, scatter(i)[1] + Math.cos(frame / 47 + i) * 14];
          // the chip is absorbed into its stage as the stage card blooms around it
          const o = 1 - ramp(ease, 0.82, 1);
          if (o <= 0) return null;
          return (
            <div
              key={c.label}
              style={{
                position: "absolute",
                left: x,
                top: y,
                translate: "-50% -50%",
                padding: "10px 18px",
                borderRadius: 10,
                background: CARD_BG,
                border: `1px solid ${k > 0 ? (c.stage === "R" ? "#F7C548AA" : `${COLORS.turquoise}AA`) : "rgba(255,255,255,0.12)"}`,
                boxShadow: k > 0 ? `0 0 ${24 * Math.sin(k * Math.PI)}px ${c.stage === "R" ? "#F7C548" : COLORS.turquoise}` : undefined,
                fontFamily: FONT,
                fontSize: 22,
                fontWeight: 600,
                color: COLORS.white,
                whiteSpace: "nowrap",
                opacity: o,
                scale: String(1 - 0.5 * ease),
              }}
            >
              {c.label}
            </div>
          );
        }
        const [sx, sy] = scatter(i);
        const drift = (1 - assembled) * 14;
        const target: [number, number] = c.stage === "R" ? [cx, cy + ry + 112] : stagePos((c.stage as number) - 1);
        const k = EASE.inOut(Math.min(1, Math.max(0, assembled * 1.15 - i * 0.015)));
        const x = interpolate(k, [0, 1], [sx + Math.sin(frame / 40 + i) * drift, target[0]]);
        const y = interpolate(k, [0, 1], [sy + Math.cos(frame / 47 + i) * drift, target[1]]);
        const o = 1 - ramp(k, 0.75, 1);
        if (o <= 0) return null;
        return (
          <div
            key={c.label}
            style={{
              position: "absolute",
              left: x,
              top: y,
              translate: "-50% -50%",
              padding: "10px 18px",
              borderRadius: 10,
              background: CARD_BG,
              border: "1px solid rgba(255,255,255,0.12)",
              fontFamily: FONT,
              fontSize: 22,
              fontWeight: 600,
              color: COLORS.white,
              whiteSpace: "nowrap",
              opacity: o,
              scale: String(1 - 0.3 * k),
            }}
          >
            {c.label}
          </div>
        );
      })}
      {/* the six stages */}
      {CYCLE.map((s, i) => {
        const [x, y] = stagePos(i);
        const appear = converge ? converge.stage(i) : ramp(assembled, 0.55 + i * 0.05, 0.85 + i * 0.025);
        const L = lit(i);
        if (appear <= 0) return null;
        return (
          <div
            key={s.id}
            style={{
              position: "absolute",
              left: x - CARD_W / 2,
              top: y - CARD_H / 2,
              width: CARD_W,
              height: CARD_H,
              boxSizing: "border-box",
              padding: "14px 16px",
              display: "flex",
              gap: 14,
              alignItems: "center",
              borderRadius: 14,
              background: CARD_BG,
              border: "1px solid rgba(255,255,255,0.08)",
              borderTop: `3px solid ${L > 0.5 ? COLORS.orange : COLORS.turquoise}`,
              boxShadow: L > 0.05 ? `0 -8px 34px -10px rgba(255,130,0,${0.8 * L}), 0 24px 60px rgba(0,0,0,0.5)` : "0 24px 60px rgba(0,0,0,0.5)",
              fontFamily: FONT,
              color: COLORS.white,
              opacity: converge ? Math.min(1, appear * 1.6) : appear,
              scale: String(converge ? 0.55 + 0.45 * EASE.out(appear) + 0.05 * L : 0.92 + 0.08 * appear + 0.05 * L),
            }}
          >
            <IconTile icon={s.icon} accent={L > 0.5 ? "orange" : "teal"} size={48} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 2.5, color: MUTED }}>STAGE {s.n}</div>
              <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1.15 }}>{s.title}</div>
              <div style={{ fontSize: 15, color: COLORS.lightBlue, marginTop: 2, whiteSpace: "nowrap" }}>{s.line}</div>
            </div>
          </div>
        );
      })}
      {/* recognition label on the outer ring */}
      <div style={{ position: "absolute", left: cx, top: cy + ry + 112, translate: "-50% -50%", fontFamily: FONT, textAlign: "center", opacity: ring, whiteSpace: "nowrap" }}>
        <span style={{ padding: "6px 14px", borderRadius: 999, background: "rgba(8,31,44,0.92)", border: "1px solid #F7C54888", fontSize: 17, fontWeight: 700, color: "#F7C548" }}>
          {CROSS_CUTTING.title} · <span style={{ fontWeight: 500, color: "#F5E6C0" }}>{CROSS_CUTTING.line}</span>
        </span>
      </div>
      {/* centre */}
      <div style={{ position: "absolute", left: cx - 210, top: cy - 120, width: 420, height: 240, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: FONT, opacity: converge ? converge.centre : assembled, scale: String(converge ? 0.9 + 0.1 * converge.centre : 1) }}>
        {centre}
      </div>
    </>
  );
};

/* ------------------------------------------------- 03 The ecosystem */

export const EcosystemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const sc = SCENES.ecosystem;
  const from = sc.start + Math.round(2.4 * FPS) - 10; // after the OQ lobby plate
  const to = sc.end + 12;
  const one = cue("ecosystem", 0, "It is one integrated");
  const command = cue("ecosystem", 1, "Talent Command Center");
  const each = cue("ecosystem", 1, "each programme");
  const lineEnd1 = linesOf("ecosystem")[1].end;
  const assembled = ramp(frame, one - 6, one + 40, EASE.inOut);
  // convergence: on "It is one integrated ecosystem" the programmes fly into
  // their stages in reading order (stage 1 at the top, clockwise), Rewards &
  // Recognition last, onto the ring that runs around every stage
  const FLIGHT = 40;
  const order = PROGRAMME_CHIPS.map((c, i) => {
    const stage = c.stage === "R" ? CYCLE.length : (c.stage as number) - 1;
    const within = PROGRAMME_CHIPS.slice(0, i).filter((d) => d.stage === c.stage).length;
    return one - 12 + stage * 10 + within * 5;
  });
  const chip = (i: number) => ramp(frame, order[i], order[i] + FLIGHT, (x) => x);
  const arrival = (stage: number | "R") => Math.min(...PROGRAMME_CHIPS.map((c, i) => (c.stage === stage ? order[i] + FLIGHT * 0.8 : Infinity)));
  const stageIn = (i: number) => ramp(frame, arrival(i + 1) - 4, arrival(i + 1) + 16, EASE.out);
  const pulse = (i: number) => {
    const a = arrival(i + 1);
    return ramp(frame, a - 2, a + 6) * (1 - ramp(frame, a + 8, a + 34));
  };
  const ringDraw = ramp(frame, one + 6, one + 66, EASE.inOut);
  const centreIn = ramp(frame, one + 62, one + 90, EASE.out);
  const step = Math.max(10, (lineEnd1 - 10 - each) / CYCLE.length);
  const link = (i: number) => ramp(frame, each + i * step, each + i * step + step * 0.9, EASE.inOut);
  const lit = (i: number) => {
    // a stage lights as its outgoing link starts; governance also lights on "Talent Command Center"
    const own = ramp(frame, each + i * step - 6, each + i * step + 8);
    const gov = i === 5 ? ramp(frame, command - 4, command + 12) : 0;
    return Math.max(own * (1 - ramp(frame, each + (i + 1) * step + 10, each + (i + 1) * step + 30) * 0.6), gov, 0.8 * pulse(i));
  };
  const rAt = arrival("R");
  const ring = ramp(frame, rAt - 4, rAt + 20);
  const label = ramp(frame, from + 10, from + 30) * (1 - ramp(frame, one - 16, one + 4));
  return (
    <Window from={from} to={to}>
      <Stage light="50% 48%">
        {/* the collection, named */}
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FONT, fontSize: 20, letterSpacing: 6, fontWeight: 700, color: MUTED, opacity: label }}>
          NOT A COLLECTION OF SEPARATE PROGRAMMES
        </div>
        <CycleDiagram
          assembled={assembled}
          lit={lit}
          link={link}
          ring={ring}
          converge={{ chip, stage: stageIn, ringDraw, centre: centreIn }}
          centre={
            <>
              <Img src={staticFile("brand/oq-rpi-logo-white.png")} style={{ height: 46 }} />
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 4, color: COLORS.lightBlue, marginTop: 14 }}>TALENT MANAGEMENT</div>
              <div style={{ fontSize: 30, fontWeight: 300, color: COLORS.white, marginTop: 4, lineHeight: 1.15 }}>One integrated ecosystem</div>
              <div style={{ fontSize: 16, color: COLORS.orange, marginTop: 10, opacity: ramp(frame, command, command + 16) }}>Brought together in the Talent Command Center</div>
            </>
          }
        />
      </Stage>
    </Window>
  );
};

/* ------------------------------------------ 13 One talent journey, illustrated */

const JOURNEY: ReadonlyArray<{ readonly stage: number; readonly text: string }> = [
  { stage: 0, text: "A critical role and its capability need are identified" },
  { stage: 1, text: "Talent Review assesses performance and potential" },
  { stage: 2, text: "A targeted development plan — MASAR or ROBBAN" },
  { stage: 3, text: "Named as successor; readiness is reviewed" },
  { stage: 4, text: "Ready to step into the role when it opens" },
  { stage: 5, text: "Progress tracked, plans updated for the next cycle" },
];

export const CycleJourney: React.FC = () => {
  const frame = useCurrentFrame();
  const sc = SCENES.connections;
  const line = linesOf("connections")[0];
  const from = sc.start + Math.round(2.4 * FPS) - 10; // after the office-walk plate
  // the next scene ("For every employee") opens on top of this one; meanwhile
  // the whole cycle shrinks into the small ring that scene's path grows from
  const next = cue("connections", 1, "For every employee") - 8;
  const to = next + 24;
  const shrink = ramp(frame, next - 26, next + 6, EASE.inOut);
  const sc0 = 1 - (1 - MINI.s) * shrink;
  const k0 = cue("connections", 0, "transforming data into decisions");
  const k1 = cue("connections", 0, "potential into capability");
  const k2 = cue("connections", 0, "employees into future leaders");
  // one beat per step, anchored to the narration
  const beats = [k0 - 18, k0 + 18, k1 - 4, k2 - 10, k2 + 22, line.end - 24];
  const idx = beats.reduce((acc, b, i) => (frame >= b ? i : acc), -1);
  const seg = idx < 0 ? 0 : idx;
  const t = idx < 0 ? 0 : ramp(frame, beats[seg], beats[seg] + 20, EASE.inOut);
  const [ax, ay] = stagePos(JOURNEY[Math.max(0, seg - 1)].stage);
  const [bx, by] = stagePos(JOURNEY[seg].stage);
  const px = idx <= 0 ? bx : interpolate(t, [0, 1], [ax, bx]);
  const py = idx <= 0 ? by : interpolate(t, [0, 1], [ay, by]);
  const visited = (i: number) => (idx >= 0 && JOURNEY.some((j, n) => n <= idx && j.stage === i) ? 1 : 0);
  return (
    <Window from={from} to={to} exit="fade">
      <Stage light="50% 48%">
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${RING.cx}px ${RING.cy}px`, transform: `translate(${(MINI.x - RING.cx) * shrink}px, ${(MINI.y - RING.cy) * shrink}px) scale(${sc0})` }}>
        <div style={{ position: "absolute", left: 96, top: 140, fontFamily: FONT, opacity: 1 - ramp(shrink, 0, 0.3) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 3, background: COLORS.orange }} />
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 5, color: COLORS.orange }}>ONE TALENT JOURNEY</div>
          </div>
          <div style={{ fontSize: 15, color: MUTED, marginTop: 6, letterSpacing: 1 }}>Illustrative example — not a specific employee</div>
        </div>
        <CycleDiagram
          assembled={1}
          lit={(i) => 0.35 * visited(i) + (idx >= 0 && JOURNEY[seg].stage === i ? 0.65 : 0)}
          link={(i) => (idx >= 0 && JOURNEY.some((j, n) => n > 0 && n <= idx && JOURNEY[n - 1].stage === i) ? 1 : 0)}
          ring={0.6}
          centre={
            idx >= 0 ? (
              <>
                <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: 4, color: COLORS.orange }}>STEP {seg + 1} OF {JOURNEY.length}</div>
                <div style={{ fontSize: 27, fontWeight: 500, color: COLORS.white, marginTop: 10, lineHeight: 1.25, opacity: ramp(frame, beats[seg], beats[seg] + 14) }}>{JOURNEY[seg].text}</div>
              </>
            ) : (
              <div style={{ fontSize: 26, fontWeight: 300, color: COLORS.white }}>How one person moves through the ecosystem</div>
            )
          }
        />
        {/* the person, travelling the cycle */}
        {idx >= 0 ? (
          <div style={{ position: "absolute", left: px - 26, top: py - CARD_H / 2 - 64 }}>
            <Person color={COLORS.white} size={52} glow={0.9} />
          </div>
        ) : null}
        </div>
      </Stage>
    </Window>
  );
};

export const EcosystemScenes: React.FC = () => (
  <>
    <EcosystemScene />
    <CycleJourney />
  </>
);
