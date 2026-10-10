import type React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Anchored, Chapter, Tag, Title } from "./ui";
import { Lockup, LOCKUP_W } from "./Brand";
import {
  ACCENT,
  AssistantChat,
  BigFigure,
  CommandCenterHome,
  DashCard,
  HBars,
  StatRows,
} from "./Dash";
import { add, EASE, ramp, type V3 } from "../math";
import { SET } from "../layout";
import { at, cue, FPS, linesOf, SCENES, type SceneId } from "../timeline";
import {
  CRITICAL,
  DNA_FLOW,
  DNA_INDICATORS,
  GATES,
  HOME,
  HOST,
  SEATS,
  SUCCESSION_FLOW,

  TILE,
  heroAscent,
  helixPoint,
  orgNode,
  seatPos,
  tilePos,
} from "../geometry";
import { WHY_HIGHLIGHT, workerPos } from "../world/Sets";
import { leadershipPath } from "../camera";
import {
  LEADERSHIP,
  NINE_BOX,
  PERFORMANCE,
  SECONDMENT,
  SUCCESSION,
  WORKFORCE,
  fmt,
} from "../data";
import type { IconName } from "../../components/Icons";
import { COLORS, FONT } from "../../theme";

const end = (id: SceneId, pad = 0) => SCENES[id].end + pad;
const lineEnd = (id: SceneId, n: number) => linesOf(id)[n].end;
const S = (id: SceneId) => SCENES[id].start;

/** A Talent Command Center card floating in 3D space. */
const Floating: React.FC<{
  readonly at: V3;
  readonly from: number;
  readonly to: number;
  readonly children: React.ReactNode;
  readonly refDepth?: number;
  readonly anchor?: "center" | "left" | "right";
}> = ({ at: p, from, to, children, refDepth = 14, anchor = "center" }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, from, from + 22);
  const tx = anchor === "center" ? "-50%" : anchor === "left" ? "0%" : "-100%";
  return (
    <Anchored at={p} from={from} to={to} sizeWithDistance refDepth={refDepth} maxBlur={1}>
      <div style={{ position: "absolute", transform: `translate(${tx}, -50%)`, translate: `0px ${(1 - t) * 20}px` }}>{children}</div>
    </Anchored>
  );
};

/** A Command Center card pinned to the right of the frame, sliding in on its cue. */
const ScreenCard: React.FC<{ readonly top: number; readonly from: number; readonly to: number; readonly side?: "left" | "right"; readonly children: React.ReactNode }> = ({ top, from, to, side = "right", children }) => {
  const frame = useCurrentFrame();
  const t = ramp(frame, from, from + 20, EASE.out) * (1 - ramp(frame, to - 14, to));
  if (t <= 0) return null;
  const edge = side === "right" ? { right: 90 } : { left: 96 };
  return <div style={{ position: "absolute", ...edge, top, opacity: t, translate: `${(1 - t) * (side === "right" ? 60 : -60)}px 0px` }}>{children}</div>;
};

/* 01 ---------------------------------------------------------------- */
/** The film's title on the particle field: the logo lockup and the proposition. */
const OpeningOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const from = lineEnd("opening", 1) - 6;
  const to = end("opening", 12);
  if (frame < from || frame > to) return null;
  const inT = ramp(frame, from, from + 40, EASE.out);
  const out = 1 - ramp(frame, to - 20, to, EASE.inOut);
  const sub = ramp(frame, from + 14, from + 44);
  const prop = ramp(frame, from + 26, from + 56);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
      {/* a quiet pool of dark so the particles never cross the type */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 42% 30% at 50% 50%, rgba(3,13,20,0.82) 0%, rgba(3,13,20,0.55) 55%, rgba(3,13,20,0) 100%)", opacity: inT }} />
      <Lockup width={LOCKUP_W} sub={sub} logoStyle={{ opacity: inT, filter: `blur(${(1 - inT) * 12}px)`, scale: String(0.94 + 0.06 * inT) }}>
        <div style={{ marginTop: 34, fontFamily: FONT, fontSize: 28, fontWeight: 500, color: COLORS.orange, letterSpacing: 1, whiteSpace: "nowrap", opacity: prop, translate: `0px ${(1 - prop) * 12}px`, textShadow: "0 2px 14px rgba(0,0,0,0.8)" }}>
          Protecting critical capability · Building future leaders · Advancing Omani talent
        </div>
      </Lockup>
    </AbsoluteFill>
  );
};

/** The business challenge, as the three questions Talent Management answers. */
const ChallengeQuestions: React.FC = () => {
  const frame = useCurrentFrame();
  const line = linesOf("why")[1];
  const qs: Array<[string, string]> = [
    ["which roles are critical", "Which roles are critical to the business?"],
    ["who is ready", "Who is ready to step into them?"],
    ["where capability must be built", "Where must capability be built?"],
  ];
  const from = line.start - 10;
  const to = line.end + 24;
  if (frame < from || frame > to) return null;
  const o = ramp(frame, from, from + 14) * (1 - ramp(frame, to - 14, to));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(3,13,20,0.88) 0%, rgba(3,13,20,0.6) 45%, rgba(3,13,20,0) 75%)" }} />
      <div style={{ position: "absolute", left: 110, top: 220, fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 3, background: COLORS.orange }} />
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 5, color: COLORS.orange }}>THE BUSINESS CHALLENGE</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, marginTop: 34 }}>
          {qs.map(([say, q], i) => {
            const c = cue("why", 1, say);
            const k = ramp(frame, c - 6, c + 16, EASE.out);
            return (
              <div key={q} style={{ display: "flex", alignItems: "baseline", gap: 20, opacity: k, translate: `${(1 - k) * -26}px 0px` }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: COLORS.orange }}>0{i + 1}</span>
                <span style={{ fontSize: 52, fontWeight: 300, color: COLORS.white, letterSpacing: -0.5 }}>{q}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * The five capability themes as one framework: a single spine that grows from
 * theme to theme, each theme on its own fixed row (no two text boxes ever
 * share space, at any frame), all leading to Future Readiness. Entrances are
 * masked rises on the narration; the exit lifts the whole framework together.
 */
const THEMES: ReadonlyArray<{ readonly word: string; readonly at: () => number }> = [
  { word: "Capability", at: () => cue("why", 2, "workforce capability") },
  { word: "Leadership", at: () => cue("why", 2, "leadership pipeline") },
  { word: "Performance", at: () => cue("why", 2, "leadership pipeline") + 22 },
  { word: "Succession", at: () => cue("why", 2, "secure the future") - 10 },
  { word: "Future Readiness", at: () => cue("why", 2, "secure the future") + 14 },
];
const ROW = 102;

const ThemeFramework: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = THEMES.map((t) => t.at());
  const from = cues[0] - 16;
  const exitA = end("why", -44);
  const exitB = end("why", -14);
  if (frame < from || frame > exitB) return null;
  const bg = ramp(frame, from, from + 20) * (1 - ramp(frame, exitA + 10, exitB));
  // the spine reaches each node as its theme arrives
  const reach = cues.reduce((acc, c, i) => acc + (i ? ramp(frame, cues[i - 1] + 6, c + 4, EASE.inOut) : 0), 0);
  const spineH = reach * ROW;
  const kicker = ramp(frame, from, from + 18);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(3,13,20,0.86) 0%, rgba(3,13,20,0.55) 38%, rgba(3,13,20,0) 62%)", opacity: bg }} />
      <div style={{ position: "absolute", left: 110, top: 230, fontFamily: FONT }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: kicker * (1 - ramp(frame, exitA, exitA + 16)) }}>
          <div style={{ width: 44 * kicker, height: 3, background: COLORS.orange }} />
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 5, color: COLORS.orange }}>ONE CAPABILITY FRAMEWORK</div>
        </div>
        <div style={{ position: "relative", marginTop: 40 }}>
          {/* the spine */}
          <div style={{ position: "absolute", left: 9, top: ROW / 2, width: 2, height: (THEMES.length - 1) * ROW, background: "rgba(156,219,217,0.14)", opacity: bg }} />
          <div style={{ position: "absolute", left: 8, top: ROW / 2, width: 4, height: spineH, borderRadius: 2, background: `linear-gradient(180deg, ${COLORS.turquoise}, ${COLORS.orange})`, boxShadow: `0 0 14px ${COLORS.orange}88`, opacity: bg }} />
          {THEMES.map((t, i) => {
            const c = cues[i];
            const k = ramp(frame, c - 4, c + 22, EASE.out);
            const settle = ramp(frame, c, c + 34, EASE.out);
            // exit: top row first, lifting together
            const x = ramp(frame, exitA + i * 3, exitA + 20 + i * 3, EASE.inOut);
            const last = i === THEMES.length - 1;
            const node = ramp(frame, c - 6, c + 6);
            return (
              <div key={t.word} style={{ position: "relative", height: ROW, display: "flex", alignItems: "center", opacity: 1 - x, translate: `0px ${-24 * x}px` }}>
                <div
                  style={{
                    width: last ? 22 : 16,
                    height: last ? 22 : 16,
                    marginLeft: last ? -1 : 2,
                    borderRadius: 11,
                    flexShrink: 0,
                    background: node > 0.5 ? (last ? COLORS.orange : COLORS.turquoise) : "#183442",
                    border: "3px solid #061722",
                    boxShadow: node > 0.5 ? `0 0 ${16 + 10 * (1 - settle)}px ${last ? COLORS.orange : COLORS.turquoise}` : undefined,
                    scale: String(0.6 + 0.4 * node + 0.35 * (1 - settle) * node),
                  }}
                />
                <span style={{ width: 54, marginLeft: 28, fontSize: 20, fontWeight: 700, letterSpacing: 2, color: COLORS.orange, opacity: k }}>0{i + 1}</span>
                {/* masked rise: the word comes up through its own line */}
                <div style={{ overflow: "hidden", paddingBottom: 6 }}>
                  <div
                    style={{
                      fontSize: 58,
                      fontWeight: last ? 500 : 300,
                      color: last ? COLORS.orange : COLORS.white,
                      whiteSpace: "nowrap",
                      letterSpacing: 1 + (1 - settle) * 6,
                      translate: `0px ${(1 - k) * 105}%`,
                      textShadow: "0 0 30px rgba(0,0,0,0.6)",
                      lineHeight: 1.1,
                    }}
                  >
                    {t.word}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* 02 ---------------------------------------------------------------- */
const WhyOverlay: React.FC = () => {
  const cues = [cue("why", 0, "the right talent"), cue("why", 0, "in the right roles"), cue("why", 0, "at the right time")];
  const tags: Array<[string, string]> = [
    ["Right talent", "Sr Panel Operator · Hi-Lead"],
    ["Right role", "Shift Team Lead · critical role"],
    ["Right time", "Lead Engineer · successor named"],
  ];
  const W = SET.why as V3;
  return (
    <>
      {WHY_HIGHLIGHT.map((wi, k) => (
        <Tag key={wi} at={add(workerPos(wi), [0, 1.3, 0])} from={cues[k]} to={linesOf("why")[1].start - 4} label={tags[k][0]} sub={tags[k][1]} side={k === 2 ? "left" : "right"} />
      ))}
      <Floating at={add(W, [-1, 7.5, 10])} from={S("why") + 190} to={linesOf("why")[1].start}>
        <DashCard title="Executive talent overview" sub="Every talent programme at a glance" icon="people" accent="orange" width={400}>
          <StatRows
            from={S("why") + 95}
            rows={[
              ["Employees", fmt(WORKFORCE.employees)],
              ["Critical roles mapped", fmt(SUCCESSION.criticalRoles)],
              ["Rated in the 2026 ranking", fmt(PERFORMANCE.rated2026)],
              ["MASAR alumni", fmt(LEADERSHIP.masar.alumni)],
            ]}
          />
        </DashCard>
      </Floating>
      <ChallengeQuestions />
      <ThemeFramework />
    </>
  );
};

/**
 * Performance Management as it happens: objectives assessed against target,
 * an overall rating, the feedback conversation, and recognition, each beat on
 * "assess, measure, and recognise". Illustrative (the scene's Sr Panel
 * Operator), so it carries no figures from the data.
 */
const OBJECTIVES: ReadonlyArray<{ readonly label: string; readonly fill: number; readonly mark: string; readonly hot?: boolean }> = [
  { label: "Process safety", fill: 1, mark: "Met" },
  { label: "Production targets", fill: 1, mark: "Exceeded", hot: true },
  { label: "Reliability KPIs", fill: 0.9, mark: "Met" },
  { label: "Development goals", fill: 0.75, mark: "On track" },
];

const AssessmentCard: React.FC = () => {
  const frame = useCurrentFrame();
  const assess = cue("performance", 0, "assess");
  const measure = cue("performance", 0, "measure");
  const recognise = cue("performance", 0, "recognise");
  const decisions = cue("performance", 0, "supporting strategic");
  const ring = ramp(frame, measure + 20, measure + 80, EASE.inOut);
  const rated = ramp(frame, measure + 70, measure + 86);
  const badge = ramp(frame, recognise + 34, recognise + 52, EASE.out);
  const burst = ramp(frame, recognise + 40, recognise + 76);
  const feedback = ramp(frame, recognise + 70, recognise + 88);
  const onward = ramp(frame, decisions - 4, decisions + 16);
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <DashCard title="Annual performance assessment" sub="Illustrative · objectives and KPIs" icon="review" accent="teal" width={470} source={false}>
      {/* objectives against target */}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {OBJECTIVES.map((o, i) => {
          const row = ramp(frame, assess + i * 5, assess + 16 + i * 5, EASE.out);
          const fill = ramp(frame, measure + i * 8, measure + 40 + i * 8, EASE.inOut) * o.fill;
          const done = ramp(frame, measure + 34 + i * 8, measure + 46 + i * 8);
          return (
            <div key={o.label} style={{ opacity: row, translate: `${(1 - row) * -14}px 0px` }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "#DCE6EA" }}>
                <span>{o.label}</span>
                <span style={{ fontWeight: 700, color: o.hot ? COLORS.orange : COLORS.lightBlue, opacity: done }}>{o.mark}</span>
              </div>
              <div style={{ position: "relative", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.08)", marginTop: 5 }}>
                <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 4, background: o.hot ? `linear-gradient(90deg, ${COLORS.turquoise}, ${COLORS.orange})` : ACCENT.teal }} />
                {/* the target */}
                <div style={{ position: "absolute", left: "100%", top: -4, width: 2, height: 16, marginLeft: -2, background: "rgba(255,255,255,0.45)" }} />
              </div>
            </div>
          );
        })}
      </div>
      {/* the overall assessment, the conversation, and recognition */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 18 }}>
        <div style={{ position: "relative", width: 2 * R + 14, height: 2 * R + 14, flexShrink: 0 }}>
          <svg width={2 * R + 14} height={2 * R + 14} style={{ position: "absolute", inset: 0, rotate: "-90deg" }}>
            <circle cx={R + 7} cy={R + 7} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
            <circle cx={R + 7} cy={R + 7} r={R} fill="none" stroke={COLORS.orange} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${C * 0.86 * ring} ${C}`} style={{ filter: "drop-shadow(0 0 6px rgba(255,130,0,0.7))" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", opacity: rated }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1.5, color: MUTED_TXT }}>RATING</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.white, lineHeight: 1.1 }}>Exceeds</div>
          </div>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: rated }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.orange }}>Overall</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>Exceeds target</span>
          </div>
          {/* recognition: a badge lands on the assessment */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, opacity: badge, translate: `0px ${(1 - badge) * -16}px` }}>
            <div style={{ position: "relative", width: 34, height: 34, flexShrink: 0 }}>
              <div style={{ position: "absolute", inset: -14 * burst, borderRadius: 40, border: `2px solid rgba(247,197,72,${0.8 * (1 - burst)})` }} />
              <svg width={34} height={34} viewBox="0 0 100 100" style={{ filter: "drop-shadow(0 0 10px rgba(247,197,72,0.8))" }}>
                <path d="M50 4 L62 36 L96 38 L70 60 L79 94 L50 75 L21 94 L30 60 L4 38 L38 36 Z" fill="#F7C548" />
              </svg>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#F7C548" }}>Contribution recognised</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, color: "#C9D6DB", opacity: feedback }}>
            <span style={{ width: 20, height: 20, borderRadius: 10, background: "#12B07A", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>✓</span>
            Feedback conversation held
          </div>
        </div>
      </div>
      <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)", fontSize: 15, fontWeight: 600, color: COLORS.lightBlue, opacity: onward }}>
        Informs the Talent Review and talent decisions →
      </div>
    </DashCard>
  );
};
const MUTED_TXT = "#8FA6B0";

/* 04 ---------------------------------------------------------------- */
const PerformanceOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = (s: number) => at("performance", 3.4) + s * (10.5 - 3.4) * FPS;
  const spin = frame * 0.01;
  const values = ["Process safety · verified", "Exceeds target", "High future impact", "Ready today", "Hi-Lead"];
  const flowCue = cue("performance", 1, "It is the foundation");
  const flowLabels = ["Performance results", "Talent Review", "Leadership decisions"];
  return (
    <>
      <Tag at={add(SET.performance as V3, [0, 2.0, 0])} from={at("performance", 2.4)} to={at("performance", 4.6)} label="Sr Panel Operator" sub="Polymers Operations" icon="people" />
      {DNA_INDICATORS.map((d, i) => (
        <Tag key={d.label} at={helixPoint(d.s, 0, spin)} from={grow(d.s) + 6} to={flowCue - 4} label={d.label} sub={values[i]} side={i % 2 ? "left" : "right"} accent={i % 2 ? "turquoise" : "orange"} size={22} lift={40} />
      ))}
      <ScreenCard side="left" top={190} from={cue("performance", 0, "assess") - 8} to={flowCue + 20}>
        <AssessmentCard />
      </ScreenCard>
      {DNA_FLOW.map((p, i) => (
        <Tag key={i} at={p} from={flowCue + i * 34} to={end("performance", 20)} label={flowLabels[i]} side="right" accent={i === 2 ? "orange" : "turquoise"} />
      ))}
    </>
  );
};

/** What the matrix is for: a decision input, not a verdict. */
const NineBoxNote: React.FC = () => {
  const frame = useCurrentFrame();
  const from = cue("ninebox", 0, "accelerate their development") - 10;
  const to = end("ninebox", 8);
  if (frame < from || frame > to) return null;
  const o = ramp(frame, from, from + 16) * (1 - ramp(frame, to - 12, to));
  return (
    <div style={{ position: "absolute", left: 80, bottom: 190, width: 470, opacity: o, translate: `${(1 - ramp(frame, from, from + 20, EASE.out)) * -18}px 0px` }}>
      <div style={{ padding: "18px 24px", borderRadius: 12, background: "rgba(8,31,44,0.94)", border: "1px solid rgba(156,219,217,0.25)", borderLeft: `4px solid ${COLORS.orange}`, fontFamily: FONT }}>
        <div style={{ fontSize: 26, fontWeight: 600, color: COLORS.white }}>A decision tool, not a label</div>
        <div style={{ fontSize: 19, lineHeight: 1.4, color: "#C9D6DB", marginTop: 6 }}>Placement informs development decisions. It does not decide promotion or succession on its own.</div>
      </div>
    </div>
  );
};

/* 05 ---------------------------------------------------------------- */
const NineBoxOverlay: React.FC = () => {
  const N = SET.ninebox as V3;
  const axis = (text: string) => (
    <div style={{ position: "absolute", transform: "translate(-50%,-50%)", fontFamily: FONT, fontSize: 19, letterSpacing: 5, color: COLORS.lightBlue, whiteSpace: "nowrap", textShadow: "0 0 10px #000" }}>{text}</div>
  );
  const hot = (perf: number, pot: number) => (perf === 2 && pot === 2) || (perf === 1 && pot === 2) || (perf === 2 && pot === 1);
  return (
    <>
      <Anchored at={add(N, [0, 0.2, -7.3])} from={at("ninebox", 1.4)} to={end("ninebox", 10)}>
        {axis("RUNWAY · POTENTIAL  →")}
      </Anchored>
      <Anchored at={add(N, [-7.6, 0.2, 0])} from={at("ninebox", 1.6)} to={end("ninebox", 10)}>
        {axis("PERFORMANCE  →")}
      </Anchored>
      {NINE_BOX.cells.map((row, perf) =>
        row.map((cell, pot) => (
          <Anchored key={cell.name} at={add(tilePos(perf, pot), [0, 0.4, TILE * 0.18])} from={at("ninebox", 2.2) + (perf * 3 + pot) * 4} to={end("ninebox", 10)}>
            <div style={{ position: "absolute", transform: "translate(-50%,-50%)", textAlign: "center", fontFamily: FONT, whiteSpace: "nowrap", textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.white }}>{cell.name}</div>
              <div style={{ fontSize: 14, color: hot(perf, pot) ? "#FFE2C2" : COLORS.lightBlue }}>
                {cell.n} · {cell.note}
              </div>
            </div>
          </Anchored>
        )),
      )}
      <Tag at={add(tilePos(2, 2), [0, 1.4, 0])} from={cue("ninebox", 0, "identify our future leaders")} to={end("ninebox")} label="Hi-Lead · ready today" sub={`${PERFORMANCE.hiLeadReadyToday} leaders · 2026 ranking`} icon="leadership" />
      <NineBoxNote />
      <Floating at={add(N, [10.5, 6, -6])} from={cue("ninebox", 0, "performance and potential")} to={end("ninebox", 10)} refDepth={18} anchor="left">
        <DashCard title="9-box talent matrix" sub="2026 ranking · rated employees" icon="ninebox" accent="teal" width={330}>
          <StatRows
            from={cue("ninebox", 0, "performance and potential") + 10}
            rows={[
              ["Rated in 2026", fmt(PERFORMANCE.rated2026)],
              ["High potential", fmt(PERFORMANCE.highPotential)],
              ["Technical track", fmt(PERFORMANCE.technicalTrack)],
            ]}
          />
        </DashCard>
      </Floating>
    </>
  );
};

/* 06 ---------------------------------------------------------------- */
const CriticalOverlay: React.FC = () => {
  const words: Record<string, string> = {
    Safety: "safety",
    Operations: "operations",
    "Leadership continuity": "leadership continuity",
    "Business performance": "business performance",
  };
  const icons: Record<string, IconName> = { Safety: "shield", Operations: "performance", "Leadership continuity": "leadership", "Business performance": "analytics" };
  return (
    <>
      {CRITICAL.filter((c) => c.label).map((c, i) => (
        <Tag key={c.label} at={add(orgNode(c.tier, c.k), [0, 0.4, 0])} from={cue("critical", 1, words[c.label!])} to={end("critical", 10)} label={c.label!} sub="Critical role" icon={icons[c.label!]} side={i % 2 ? "left" : "right"} />
      ))}
      <ScreenCard side="left" top={170} from={cue("critical", 0, "Not every")} to={end("critical", 10)}>
        <DashCard title="Succession & critical roles" sub="2026 cycle · SP_Nominations · CR_Positions" icon="succession" accent="teal" width={380}>
          <BigFigure label="Critical roles" value={SUCCESSION.criticalRoles} from={cue("critical", 0, "Not every") + 10} accent="teal" note="2026 cycle" />
          <StatRows
            from={cue("critical", 0, "Not every") + 20}
            rows={[
              ["Successor slots named", fmt(SUCCESSION.successorSlots)],
              ["People in the succession pipeline", fmt(SUCCESSION.peopleInPipeline)],
              ["Added by focal points", fmt(SUCCESSION.addedByFocalPoints)],
            ]}
          />
        </DashCard>
      </ScreenCard>
    </>
  );
};

/**
 * The Succession planning card exactly as supplied by OQ RPI (Talent Command
 * Center, page 03): wording and figures are reproduced verbatim, rebuilt
 * natively so it stays sharp at 1080p and animates in the film's language.
 */
const SUCCESSION_CARD = {
  title: "Succession planning",
  sub: "Page 03 · SharePoint · SP_Nominations",
  status: "Watch",
  coverage: 91,
  target: "Target 95%",
  rows: [
    ["Critical roles", 296],
    ["Roles with no successor", 26],
    ["Ready-now successors", 17],
  ] as ReadonlyArray<[string, number]>,
  note: "26 critical roles have no named successor; only 16 have ready-now cover.",
  link: "Open project",
} as const;

const TargetMark: React.FC = () => (
  <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="13" r="8" />
    <circle cx="11" cy="13" r="4" />
    <circle cx="11" cy="13" r="0.8" fill="#fff" />
    <path d="M11 13 L20 4" />
    <path d="M17 3 L20 4 L21 7" />
  </svg>
);

const SuccessionPlanningCard: React.FC<{ readonly from: number }> = ({ from }) => {
  const frame = useCurrentFrame();
  const c = SUCCESSION_CARD;
  const t = ramp(frame, from + 10, from + 50, EASE.out);
  const pct = Math.round(c.coverage * t);
  const note = ramp(frame, from + 54, from + 74, EASE.out);
  const link = ramp(frame, from + 70, from + 86);
  return (
    <div
      style={{
        width: 560,
        boxSizing: "border-box",
        padding: "22px 26px 20px",
        borderRadius: 16,
        background: "linear-gradient(160deg, rgba(13,44,58,0.97) 0%, rgba(7,26,37,0.97) 60%, rgba(5,19,28,0.98) 100%)",
        border: "1px solid rgba(0,176,185,0.35)",
        boxShadow: "0 30px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)",
        fontFamily: FONT,
        color: COLORS.white,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(145deg, #16B6C2, #0E8F99)", boxShadow: "0 6px 20px rgba(22,182,194,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <TargetMark />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 23, fontWeight: 700, lineHeight: 1.15 }}>{c.title}</div>
          <div style={{ fontSize: 14, color: MUTED_TXT, marginTop: 3 }}>{c.sub}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 16, fontWeight: 700, color: "#F7C548", alignSelf: "flex-start", marginTop: 4 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: "#F7C548", opacity: 0.55 + 0.45 * Math.abs(Math.sin(frame * 0.12)) }} />
          {c.status}
        </div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1.6, color: "#C9D6DB", marginTop: 20 }}>SUCCESSOR COVERAGE</div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
        <div style={{ fontSize: 14, color: "#C9D6DB", paddingBottom: 8 }}>{c.target}</div>
      </div>
      <div style={{ position: "relative", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.08)", marginTop: 10 }}>
        <div style={{ width: `${c.coverage * t}%`, height: "100%", borderRadius: 6, background: "linear-gradient(90deg, #0E9CA6, #16C3CF)", boxShadow: "0 0 12px rgba(22,182,194,0.5)" }} />
        {/* the 95% target */}
        <div style={{ position: "absolute", left: "95%", top: -4, width: 2, height: 20, background: "rgba(255,255,255,0.5)", opacity: t }} />
      </div>
      <div style={{ marginTop: 16 }}>
        {c.rows.map(([label, v], i) => {
          const k = ramp(frame, from + 24 + i * 7, from + 40 + i * 7, EASE.out);
          return (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderTop: "1px solid rgba(255,255,255,0.09)", opacity: k, translate: `${(1 - k) * -12}px 0px` }}>
              <span style={{ fontSize: 17, color: "#DCE6EA" }}>{label}</span>
              <span style={{ fontSize: 24, fontWeight: 800, width: 90, textAlign: "center", fontVariantNumeric: "tabular-nums" }}>{Math.round(v * ramp(frame, from + 24 + i * 7, from + 54 + i * 7))}</span>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 12,
          padding: "16px 18px",
          borderRadius: 10,
          background: "rgba(0,176,185,0.10)",
          border: "1px solid rgba(0,176,185,0.30)",
          borderLeft: "3px solid #16B6C2",
          fontSize: 16,
          fontWeight: 600,
          textAlign: "center",
          lineHeight: 1.4,
          opacity: note,
          translate: `0px ${(1 - note) * 10}px`,
        }}
      >
        {c.note}
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14, fontSize: 16, fontWeight: 700, color: COLORS.orange, opacity: link }}>{c.link} →</div>
    </div>
  );
};

/* 07 ---------------------------------------------------------------- */
const SuccessionOverlay: React.FC = () => {
  const climbStart = at("succession", 3.6);
  const climbEnd = at("succession", 10.6);
  const atClimb = (t: number) => climbStart + (climbEnd - climbStart) * t;
  const anchors: V3[] = [seatPos(3, 0, SEATS[3]), heroAscent(0), heroAscent(0.33), heroAscent(0.66), seatPos(3, 0, SEATS[3])];
  const times = [at("succession", 2.4), climbStart - 4, atClimb(0.33), atClimb(0.66), climbEnd];
  const subs = ["Critical role", "Named successor", "IDP · MASAR", "Readiness confirmed", "Business continuity"];
  return (
    <>
      {SUCCESSION_FLOW.map((label, i) => (
        <Tag key={label} at={add(anchors[i], [0, 0.5, 0])} from={times[i]} to={i === 0 ? climbEnd - 10 : i === 4 ? end("succession", 20) : times[i] + 80} label={label} sub={subs[i]} side={i % 2 ? "left" : "right"} accent={i === 0 || i === 4 ? "orange" : "turquoise"} />
      ))}
      <ScreenCard side="left" top={170} from={at("succession", 4.4)} to={end("succession", 10)}>
        {/* 86% (≈480 px): clear of the 3D role tags that pass right of the card */}
        <div style={{ scale: "0.86", transformOrigin: "0 0" }}>
          <SuccessionPlanningCard from={at("succession", 4.4)} />
        </div>
      </ScreenCard>
    </>
  );
};

/* 08 ---------------------------------------------------------------- */
/** The official ROBBAN identity (from the programme's brand sheet). */
const RobbanMark: React.FC = () => (
  <Img src={staticFile("brand/robban-logo-white.png")} style={{ width: 300, height: 300 / (1750 / 577), display: "block" }} />
);

/**
 * After the ROBBAN cohort plate the camera leaves the tunnel for open grid:
 * the programme card takes the centre of that frame as one balanced composition
 * (identity left, facts right), rising from depth and holding to the cut.
 */
const RobbanHero: React.FC<{ readonly from: number; readonly to: number }> = ({ from, to }) => {
  const frame = useCurrentFrame();
  if (frame < from || frame > to) return null;
  const k = ramp(frame, from, from + 26, EASE.out);
  const out = 1 - ramp(frame, to - 16, to, EASE.inOut);
  const fact = (i: number) => ramp(frame, from + 16 + i * 6, from + 34 + i * 6, EASE.out);
  const facts: Array<[string, string]> = [
    [String(LEADERSHIP.robban.cohort), "leaders in the 2026 cohort"],
    [LEADERSHIP.robban.dates, "five-day residential journey"],
  ];
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 48% 40% at 50% 52%, rgba(3,13,20,0.7), rgba(3,13,20,0) 100%)", opacity: k }} />
      <div style={{ position: "relative", opacity: k, scale: String(0.94 + 0.06 * k), translate: `0px ${(1 - k) * 26}px`, filter: k < 0.98 ? `blur(${(1 - k) * 6}px)` : undefined }}>
        <DashCard title="" accent="orange" width={980}>
          <div style={{ display: "flex", alignItems: "center", gap: 40, marginTop: -16 }}>
            <div style={{ flexShrink: 0 }}>
              <RobbanMark />
              <div style={{ fontSize: 16, color: "#C9D6DB", marginTop: 10, textAlign: "center" }}>Delivered with the {LEADERSHIP.robban.partner}</div>
            </div>
            <div style={{ width: 1, alignSelf: "stretch", background: "rgba(255,255,255,0.14)" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.2 }}>Robban Leadership Development Program 2026</div>
              <div style={{ display: "flex", gap: 44, marginTop: 18 }}>
                {facts.map(([v, l], i) => (
                  <div key={l} style={{ opacity: fact(i), translate: `0px ${(1 - fact(i)) * 10}px` }}>
                    <div style={{ fontSize: i ? 30 : 52, fontWeight: 800, lineHeight: 1.05, marginTop: i ? 12 : 0 }}>{v}</div>
                    <div style={{ fontSize: 16, color: "#C9D6DB", marginTop: 6 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DashCard>
      </div>
    </AbsoluteFill>
  );
};

const LeadershipOverlay: React.FC = () => {
  const start = at("leadership", 0.2);
  const robbanCue = cue("leadership", 0, "ROBBAN");
  return (
    <>
      {GATES.map((g) => {
        const p = leadershipPath(g.t);
        const arrive = start + g.t * 14 * FPS;
        return (
          <Anchored key={g.label} at={add(p, [0, 3.4, 0])} from={arrive - 40} to={arrive + 70}>
            <div style={{ position: "absolute", transform: "translate(-50%,-100%)", textAlign: "center", fontFamily: FONT, whiteSpace: "nowrap", textShadow: "0 0 18px rgba(0,0,0,0.8)" }}>
              <div style={{ fontSize: 15, color: COLORS.orange, letterSpacing: 4, fontWeight: 700 }}>{g.step.toUpperCase()}</div>
              <div style={{ fontSize: 36, color: COLORS.white, fontWeight: 300, letterSpacing: 1 }}>{g.label}</div>
              <div style={{ fontSize: 15, color: COLORS.lightBlue, marginTop: 2 }}>{g.programmes}</div>
            </div>
          </Anchored>
        );
      })}
      <RobbanHero from={robbanCue + 2.4 * FPS - 10} to={end("leadership", 10)} />
    </>
  );
};

/* 10 ---------------------------------------------------------------- */
const SecondmentOverlay: React.FC = () => {
  const words: Array<[string, string, V3]> = [
    ["Broader exposure", "broader exposure", add(SET.secondment as V3, [4, 8.5, -1])],
    ["Accelerated learning", "accelerating their learning", add(SET.secondment as V3, [-1, 10, 0.5])],
    ["New capability home", "bringing new capability home", add(SET.secondment as V3, [-6, 8, 2])],
  ];
  const c = cue("secondment", 0, "national institutions");
  return (
    <>
      <Tag at={add(HOME, [0, 5.2, 0])} from={at("secondment", 3.2)} to={end("secondment", 10)} label="OQ RPI" sub="Home organisation" icon="nationalization" />
      <Tag at={add(HOST, [0, 5.2, 0])} from={at("secondment", 3.6)} to={end("secondment", 10)} label="OQ & national institutions" sub="Host organisations" icon="secondment" side="left" accent="turquoise" />
      {words.map(([label, w, p], i) => (
        <Tag key={label} at={p} from={cue("secondment", 0, w)} to={end("secondment", 10)} label={label} side={i % 2 ? "left" : "right"} accent={i % 2 ? "turquoise" : "orange"} size={22} lift={44} />
      ))}
      <Floating at={add(SET.secondment as V3, [0, 13, -6])} from={c - 6} to={end("secondment", 10)} refDepth={22}>
        <DashCard title="Secondment management" sub="Secondees Master · host organisation analysis" icon="secondment" accent="orange" width={470}>
          <BigFigure label="Secondees on record" value={SECONDMENT.onRecord} from={c} accent="orange" note={`${SECONDMENT.outbound} outbound · ${SECONDMENT.inbound} inbound`} />
          <div style={{ marginTop: 12 }}>
            <HBars data={SECONDMENT.hosts.map((h) => ({ label: h.name, n: h.n }))} from={c + 12} width={426} color={ACCENT.orange} labelWidth={200} />
          </div>
        </DashCard>
      </Floating>
    </>
  );
};

/* 12 ---------------------------------------------------------------- */
const PlatformOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  // the Command Center hub (Showcase) carries line 0; the live screen follows for the Assistant
  const show = lineEnd("platform", 0) - 4;
  const assistant = cue("platform", 1, "Talent Assistant");
  const hl: Array<[number, number]> = [[assistant - 10, 8]];
  const current = [...hl].reverse().find(([f]) => frame >= f);
  const screenOut = ramp(frame, assistant + 10, assistant + 40, EASE.inOut);
  const inT = ramp(frame, show, show + 45, EASE.out);
  const rx = interpolate(inT, [0, 1], [16, 4]);
  const ry = interpolate(frame, [show, assistant + 40], [-14, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const z = interpolate(frame, [show, assistant + 40], [0.78, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {frame >= show ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: 2200, opacity: inT * (1 - 0.6 * screenOut) }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(3,13,20,0.55), rgba(3,13,20,0.85))" }} />
          <div style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${z})`, transformStyle: "preserve-3d" }}>
            <CommandCenterHome from={show} highlight={current?.[1]} highlightFrom={current?.[0]} />
          </div>
        </AbsoluteFill>
      ) : null}
      {frame >= assistant + 20 ? (
        <div style={{ position: "absolute", right: 120, top: 230, opacity: ramp(frame, assistant + 20, assistant + 40) * (1 - ramp(frame, end("platform", -10), end("platform", 10))), translate: `${(1 - ramp(frame, assistant + 20, assistant + 44)) * 40}px 0px` }}>
          <AssistantChat from={assistant + 30} width={640} />
        </div>
      ) : null}
    </>
  );
};

/* ---------------------------------------------------------------- */
export const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const inScene = (id: SceneId, pre = 30, post = 40) => frame >= SCENES[id].start - pre && frame <= SCENES[id].end + post;
  return (
    <AbsoluteFill>
      {inScene("opening") ? <OpeningOverlay /> : null}
      {inScene("why") ? <WhyOverlay /> : null}
      {inScene("performance") ? <PerformanceOverlay /> : null}
      {inScene("ninebox") ? <NineBoxOverlay /> : null}
      {inScene("critical") ? <CriticalOverlay /> : null}
      {inScene("succession") ? <SuccessionOverlay /> : null}
      {inScene("leadership") ? <LeadershipOverlay /> : null}
      {inScene("secondment") ? <SecondmentOverlay /> : null}
      {inScene("platform") ? <PlatformOverlay /> : null}
    </AbsoluteFill>
  );
};

/** Above the live-action plates: chapters and the closing statement. */
export const TopLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const chapters: Array<[SceneId, string, string]> = [
    ["why", "02", "Why Talent Management"],
    ["ecosystem", "03", "The Talent Management ecosystem"],
    ["performance", "04", "Performance Management"],
    ["ninebox", "05", "9-Box Talent Matrix"],
    ["critical", "06", "Critical Roles"],
    ["succession", "07", "Succession Planning"],
    ["leadership", "08", "Leadership Development · MASAR · ROBBAN"],
    ["nationalization", "09", "Nationalization"],
    ["secondment", "10", "Secondment Management"],
    ["rewards", "11", "Rewards & Recognition"],
    ["platform", "12", "Talent Command Center"],
    ["connections", "13", "How everything connects"],
  ];
  return (
    <AbsoluteFill>
      {chapters.map(([id, n, l]) => (
        <Chapter key={id} id={id} index={n} label={l} />
      ))}
      {frame >= S("future") ? (
        <Title
          from={cue("future", 0, "The future")}
          to={cue("future", 1, "By investing") - 6}
          lines={[
            { text: "The future is not built by systems.", size: 60, weight: 300, tracking: 1 },
            { text: "It is built by people.", size: 72, weight: 600, color: COLORS.orange, tracking: 0, delay: Math.max(0, cue("future", 0, "It is built") - cue("future", 0, "The future")) },
          ]}
        />
      ) : null}
    </AbsoluteFill>
  );
};

