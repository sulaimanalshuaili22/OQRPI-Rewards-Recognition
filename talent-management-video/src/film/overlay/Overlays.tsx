import type React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Anchored, Chapter, Tag, Title } from "./ui";
import {
  ACCENT,
  AssistantChat,
  BigFigure,
  CommandCenterHome,
  DashCard,
  HBars,
  StatRows,
  VBars,
} from "./Dash";
import { add, EASE, ramp, type V3 } from "../math";
import { SET } from "../layout";
import { at, cue, FPS, linesOf, SCENES, type SceneId } from "../timeline";
import {
  AWARDS,
  BEACONS,
  CRITICAL,
  DNA_FLOW,
  DNA_INDICATORS,
  FLOWS,
  GATES,
  HOME,
  HOST,
  CORE,
  PROGRAMS,
  SEATS,
  STAGES,
  SUCCESSION_FLOW,

  TILE,
  awardPos,
  heroAscent,
  helixPoint,
  orgNode,
  programPos,
  seatPos,
  stagePos,
  terraceBase,
  tilePos,
} from "../geometry";
import { WHY_HIGHLIGHT, workerPos } from "../world/Sets";
import { leadershipPath } from "../camera";
import {
  LEADERSHIP,
  NATIONALIZATION,
  NINE_BOX,
  PERFORMANCE,
  REWARDS,
  SECONDMENT,
  SUCCESSION,
  WORKFORCE,
  fmt,
} from "../data";
import { Icon, type IconName } from "../../components/Icons";
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

/* 01 ---------------------------------------------------------------- */
const OpeningOverlay: React.FC = () => (
  <Title
    from={lineEnd("opening", 1) - 6}
    to={end("opening", 12)}
    lines={[
      { text: "OQ RPI TALENT MANAGEMENT", size: 74, weight: 300, tracking: 16 },
      { text: "Building Tomorrow's Talent, Together", size: 34, weight: 500, color: COLORS.orange, tracking: 1.5, delay: 26 },
    ]}
  />
);

/* 02 ---------------------------------------------------------------- */
const WhyOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = [cue("why", 0, "the right talent"), cue("why", 0, "in the right roles"), cue("why", 0, "at the right time")];
  const tags: Array<[string, string]> = [
    ["Right talent", "Sr Panel Operator · Hi-Lead"],
    ["Right role", "Shift Team Lead · critical role"],
    ["Right time", "Lead Engineer · successor named"],
  ];
  const W = SET.why as V3;
  const pillars: Array<{ word: string; c: number; p: V3 }> = [
    { word: "Capability", c: cue("why", 1, "workforce capability"), p: add(W, [-7, 9, 3]) },
    { word: "Leadership", c: cue("why", 1, "leadership pipeline"), p: add(W, [-1, 10.5, -1]) },
    { word: "Performance", c: cue("why", 1, "leadership pipeline") + 20, p: add(W, [5, 9.5, -4]) },
    { word: "Succession", c: cue("why", 1, "secure the future") - 8, p: add(W, [10, 11, -7]) },
    { word: "Future Readiness", c: cue("why", 1, "secure the future") + 14, p: add(W, [14, 9, -10]) },
  ];
  return (
    <>
      {WHY_HIGHLIGHT.map((wi, k) => (
        <Tag key={wi} at={add(workerPos(wi), [0, 1.3, 0])} from={cues[k]} to={cue("why", 1, "OQ RPI Talent Management exists") - 4} label={tags[k][0]} sub={tags[k][1]} side={k === 2 ? "left" : "right"} />
      ))}
      <Floating at={add(W, [-1, 7.5, 10])} from={S("why") + 190} to={cue("why", 1, "OQ RPI Talent Management exists")}>
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
      {pillars.map((p, i) => (
        <Anchored key={p.word} at={p.p} from={p.c} to={end("why", -20)} inF={18} outF={18}>
          <div style={{ position: "absolute", transform: "translate(-50%,-50%)", display: "flex", alignItems: "baseline", gap: 14, fontFamily: FONT, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 22, color: COLORS.orange, fontWeight: 600, letterSpacing: 2 }}>0{i + 1}</span>
            <span style={{ fontSize: 64, fontWeight: 300, color: COLORS.white, letterSpacing: 2 + (1 - ramp(frame, p.c, p.c + 30)) * 14, textShadow: "0 0 30px rgba(0,0,0,0.7)" }}>{p.word}</span>
          </div>
        </Anchored>
      ))}
    </>
  );
};

/* 03 ---------------------------------------------------------------- */
const EcosystemOverlay: React.FC = () => (
  <>
    {PROGRAMS.map((p, i) => {
      const from = at("ecosystem", 2.4) + i * 7;
      const pos = programPos(i);
      const left = pos[0] < (SET.ecosystem as V3)[0];
      return (
        <Anchored key={p.label} at={add(pos, [0, 1.1, 0])} from={from} to={end("ecosystem", 30)}>
          <div
            style={{
              position: "absolute",
              transform: `translate(${left ? "-100%" : "0"}, -100%) translate(${left ? -10 : 10}px, -6px)`,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px 8px 8px",
              borderRadius: 10,
              background: "linear-gradient(165deg, rgba(18,52,62,0.9), rgba(7,22,31,0.9))",
              borderTop: `2px solid ${i % 3 === 0 ? COLORS.orange : COLORS.turquoise}`,
              fontFamily: FONT,
              fontSize: 19,
              fontWeight: 600,
              color: COLORS.white,
              whiteSpace: "nowrap",
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 7, background: i % 3 === 0 ? COLORS.orange : COLORS.turquoise, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name={p.icon as IconName} size={18} color="#fff" strokeWidth={2} />
            </div>
            {p.label}
          </div>
        </Anchored>
      );
    })}
    <Title
      at={add(SET.ecosystem as V3, [0, 8.2, 0])}
      from={cue("ecosystem", 0, "It is one integrated")}
      to={cue("ecosystem", 1, "each programme") + 40}
      lines={[{ text: "One integrated ecosystem.", size: 58, weight: 300, tracking: 1 }]}
    />
  </>
);

/* 04 ---------------------------------------------------------------- */
const PerformanceOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = (s: number) => at("performance", 3.4) + s * (10.5 - 3.4) * FPS;
  const spin = frame * 0.01;
  const values = ["Process safety · verified", "Exceeds target", "High future impact", "6 active", "Ready today", "Hi-Lead"];
  const flowCue = cue("performance", 1, "It is the foundation");
  const flowLabels = ["Performance results", "Talent Review", "Leadership decisions"];
  return (
    <>
      <Tag at={add(SET.performance as V3, [0, 2.0, 0])} from={at("performance", 2.4)} to={at("performance", 4.6)} label="Sr Panel Operator" sub="Polymers Operations" icon="people" />
      {DNA_INDICATORS.map((d, i) => (
        <Tag key={d.label} at={helixPoint(d.s, 0, spin)} from={grow(d.s) + 6} to={flowCue - 4} label={d.label} sub={values[i]} side={i % 2 ? "left" : "right"} accent={i % 2 ? "turquoise" : "orange"} size={22} lift={40} />
      ))}
      <Floating at={add(SET.performance as V3, [-5, 8.5, 1])} from={at("performance", 5.2)} to={flowCue + 20} refDepth={16}>
        <DashCard title="Performance & potential" sub="Master ranking 2024–2026" icon="ninebox" accent="teal" width={380}>
          <BigFigure label="Rated in the 2026 ranking" value={PERFORMANCE.rated2026} from={at("performance", 5.6)} accent="teal" />
          <StatRows
            from={at("performance", 6.2)}
            rows={[
              ["High potentials", fmt(PERFORMANCE.highPotential)],
              ["Hi-Lead · ready today", fmt(PERFORMANCE.hiLeadReadyToday)],
              ["Moved up since 2025", fmt(PERFORMANCE.movedUpSince2025)],
            ]}
          />
        </DashCard>
      </Floating>
      {DNA_FLOW.map((p, i) => (
        <Tag key={i} at={p} from={flowCue + i * 34} to={end("performance", 20)} label={flowLabels[i]} side="right" accent={i === 2 ? "orange" : "turquoise"} />
      ))}
    </>
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
      <Floating at={add(SET.critical as V3, [-13, 12, -2])} from={cue("critical", 0, "Not every")} to={end("critical", 10)} refDepth={26}>
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
      </Floating>
    </>
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
      <Floating at={add(SET.succession as V3, [-5, 10, 4])} from={at("succession", 4.4)} to={end("succession", 10)} refDepth={13}>
        <DashCard title="Bench strength" sub="Critical roles by named successors" icon="succession" accent="teal" width={360}>
          <VBars data={SUCCESSION.benchByNamed.map((b) => ({ label: b.label, n: b.n }))} from={at("succession", 4.8)} width={310} height={110} color={ACCENT.teal} />
        </DashCard>
      </Floating>
    </>
  );
};

/* 08 ---------------------------------------------------------------- */
const RobbanMark: React.FC = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg width={42} height={30} viewBox="0 0 42 30">
      <polygon points="0,0 26,0 42,30 16,30" fill={COLORS.orange} />
    </svg>
    <div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 6 }}>ROBBAN</div>
      <div style={{ fontSize: 13, color: "#C9D6DB", letterSpacing: 1 }}>{LEADERSHIP.robban.strap}</div>
    </div>
  </div>
);

const LeadershipOverlay: React.FC = () => {
  const start = at("leadership", 0.2);
  const masarCue = cue("leadership", 0, "MASAR");
  const robbanCue = cue("leadership", 0, "ROBBAN");
  const chip = (t: string) => (
    <span key={t} style={{ fontSize: 12, padding: "4px 9px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.25)", color: "#E3ECEF" }}>{t}</span>
  );
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
      <Floating at={add(leadershipPath(0.42), [-3, 6.5, -6])} from={masarCue - 6} to={end("leadership", 10)} refDepth={16}>
        <DashCard title={LEADERSHIP.masar.name} sub="OQ RPI's in-house leadership journey" accent="purple" width={420}>
          <div style={{ display: "flex", gap: 28 }}>
            {[
              [LEADERSHIP.masar.alumni, "alumni"],
              [LEADERSHIP.masar.intakes, "intakes"],
              [LEADERSHIP.masar.cohorts, "cohorts"],
            ].map(([v, l]) => (
              <div key={l as string}>
                <div style={{ fontSize: 40, fontWeight: 800 }}>{v}</div>
                <div style={{ fontSize: 13, color: "#C9D6DB" }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>{LEADERSHIP.masar.themes.map(chip)}</div>
        </DashCard>
      </Floating>
      <Floating at={add(leadershipPath(0.7), [1, 6.5, -7])} from={robbanCue - 4} to={end("leadership", 10)} refDepth={16}>
        <DashCard title="" accent="orange" width={430}>
          <RobbanMark />
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12 }}>Robban Leadership Development Program 2026</div>
          <div style={{ fontSize: 13, color: "#C9D6DB", marginTop: 4 }}>Delivered with the {LEADERSHIP.robban.partner}</div>
          <div style={{ display: "flex", gap: 28, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800 }}>{LEADERSHIP.robban.cohort}</div>
              <div style={{ fontSize: 13, color: "#C9D6DB" }}>leaders in cohort</div>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{LEADERSHIP.robban.dates}</div>
              <div style={{ fontSize: 13, color: "#C9D6DB" }}>five-day residential journey</div>
            </div>
          </div>
        </DashCard>
      </Floating>
    </>
  );
};

/* 09 ---------------------------------------------------------------- */
const NationalizationOverlay: React.FC = () => {
  const Q = SET.nationalization as V3;
  const c = cue("nationalization", 0, "Omani talent");
  return (
    <>
      {STAGES.map((s, row) => (
        <Anchored key={s} at={add(terraceBase(row, 0), [-1.4, 2.6 + row * 0.5, 0])} from={at("nationalization", 1) + row * 14} to={end("nationalization", 10)}>
          <div style={{ position: "absolute", transform: "translate(-100%,-50%)", fontFamily: FONT, whiteSpace: "nowrap", textAlign: "right", textShadow: "0 1px 8px #000" }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: row === 2 ? COLORS.orange : COLORS.white }}>{s}</div>
            <div style={{ fontSize: 14, color: COLORS.lightBlue }}>{NATIONALIZATION.plan[row].n} roles planned</div>
          </div>
        </Anchored>
      ))}
      <Floating at={add(Q, [7, 9, -10])} from={c} to={end("nationalization", 10)} refDepth={20}>
        <DashCard title="Nationalization" sub="Expat replacement plan · Nationalization Tracker" icon="nationalization" accent="green" width={390}>
          <BigFigure label="Expat roles on the plan" value={NATIONALIZATION.activeExpats} from={c + 8} accent="green" note={`of ${NATIONALIZATION.tracked} tracked`} />
          <StatRows
            from={c + 18}
            rows={[
              ["Planned for 2026–2027", fmt(NATIONALIZATION.planned2026to2027)],
              ["Omani successors named", fmt(NATIONALIZATION.omaniSuccessorsNamed)],
            ]}
          />
        </DashCard>
      </Floating>
      <Floating at={add(Q, [0, 15, -20])} from={cue("nationalization", 0, "a named successor") - 10} to={end("nationalization", 10)} refDepth={22}>
        <DashCard title="Nationalization plan by year" sub="Active expat roles by planned nationalization year" accent="orange" width={420}>
          <VBars data={NATIONALIZATION.plan.map((p) => ({ label: p.year, n: p.n }))} from={cue("nationalization", 0, "a named successor")} width={370} height={110} color={ACCENT.orange} />
        </DashCard>
      </Floating>
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

/* 11 ---------------------------------------------------------------- */
const RewardsOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = frame * 0.0035;
  const honoured = [2, 6, 11];
  const why = ["Testahal", "Above & Beyond", "HSSE Award"];
  const spots = [at("rewards", 2.0), at("rewards", 4.6), at("rewards", 7.2)];
  const c = cue("rewards", 0, "celebrates");
  return (
    <>
      {honoured.map((h, k) => (
        <Tag key={h} at={add(stagePos(h, 14), [0, 1.4, 0])} from={spots[k] + 8} to={end("rewards", 10)} label={why[k]} sub="Recognised · 2026" icon="rewards" side={k === 1 ? "left" : "right"} size={22} lift={50} />
      ))}
      {AWARDS.map((a, k) => (
        <Anchored key={a.title} at={awardPos(k, spin)} from={at("rewards", 0.8) + k * 10} to={end("rewards", 10)} sizeWithDistance refDepth={12} maxBlur={1.4}>
          <div style={{ position: "absolute", transform: "translate(-50%,-50%)" }}>
            <DashCard title={a.title} sub={a.sub} icon="rewards" accent={REWARDS.programmes[k].accent as "green" | "orange" | "purple" | "teal"} width={260} source={false} />
          </div>
        </Anchored>
      ))}
      <Floating at={add(SET.rewards as V3, [-9, 9, -6])} from={c - 10} to={end("rewards", 10)} refDepth={16}>
        <DashCard title="Rewards & recognition" sub={`Rewards granted per month · ${REWARDS.period}`} icon="rewards" accent="gold" width={420}>
          <BigFigure label="Rewards granted" value={REWARDS.granted} from={c} accent="gold" note={`OMR ${fmt(REWARDS.usedOMR)} paid`} />
          <div style={{ marginTop: 10 }}>
            <VBars data={REWARDS.monthly.map((m) => ({ label: m.m, n: m.n }))} from={c + 10} width={370} height={80} color={ACCENT.orange} />
          </div>
        </DashCard>
      </Floating>
    </>
  );
};

/* 12 ---------------------------------------------------------------- */
const PlatformOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const show = S("platform") + 2.0 * FPS;
  const assistant = cue("platform", 1, "Talent Assistant");
  const hl: Array<[number, number]> = [
    [cue("platform", 0, "critical roles"), 2],
    [cue("platform", 0, "bench strength"), 2],
    [cue("platform", 0, "succession readiness"), 4],
    [cue("platform", 0, "leadership pipelines"), 3],
    [assistant - 10, 8],
  ];
  const current = [...hl].reverse().find(([f]) => frame >= f);
  const screenOut = ramp(frame, assistant + 10, assistant + 40, EASE.inOut);
  const inT = ramp(frame, show, show + 45, EASE.out);
  const rx = interpolate(inT, [0, 1], [16, 4]);
  const ry = interpolate(frame, [show, assistant + 40], [-14, 8], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const z = interpolate(frame, [show, assistant + 40], [0.78, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <>
      {frame >= show && screenOut < 1 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", perspective: 2200, opacity: inT * (1 - screenOut) }}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(3,13,20,0.55), rgba(3,13,20,0.85))" }} />
          <div style={{ transform: `rotateX(${rx}deg) rotateY(${ry}deg) scale(${z})`, transformStyle: "preserve-3d" }}>
            <CommandCenterHome from={show} highlight={current?.[1]} highlightFrom={current?.[0]} />
          </div>
        </AbsoluteFill>
      ) : null}
      {frame >= assistant + 20 ? (
        <div style={{ position: "absolute", right: 120, top: 230, opacity: ramp(frame, assistant + 20, assistant + 40) * (1 - ramp(frame, end("platform", -10), end("platform", 10))), translate: `${(1 - ramp(frame, assistant + 20, assistant + 44)) * 40}px 0px` }}>
          <AssistantChat from={assistant + 30} width={560} />
        </div>
      ) : null}
    </>
  );
};

/* 13 ---------------------------------------------------------------- */
const ConnectionsOverlay: React.FC = () => {
  const flowStart = at("connections", 3.2);
  const flowStep = 1.5 * FPS;
  const ids = Object.keys(BEACONS) as Array<keyof typeof BEACONS>;
  const benefits: Array<[string, string]> = [
    ["Clear expectations", "clear expectations"],
    ["Real development", "real development"],
    ["A visible path to grow", "a visible path"],
  ];
  return (
    <>
      {ids.map((id) => (
        <Anchored key={id} at={add(BEACONS[id].pos, [0, 10, 0])} from={at("connections", 1.6)} to={end("connections", 30)}>
          <div style={{ position: "absolute", transform: "translate(-50%,-100%)", fontFamily: FONT, fontSize: 19, fontWeight: 600, letterSpacing: 1, color: FLOWS.some((f) => f.from === id || f.to === id) ? COLORS.white : COLORS.lightBlue, whiteSpace: "nowrap", textShadow: "0 0 14px rgba(0,0,0,0.9)" }}>
            {BEACONS[id].label}
          </div>
        </Anchored>
      ))}
      {FLOWS.map((f, i) => {
        const a = BEACONS[f.from].pos;
        const b = BEACONS[f.to].pos;
        const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 6.2, (a[2] + b[2]) / 2];
        return (
          <Anchored key={i} at={mid} from={flowStart + i * flowStep + 24} to={end("connections", 20)}>
            <div style={{ position: "absolute", transform: "translate(-50%,-50%)", padding: "6px 12px", borderRadius: 8, background: "rgba(255,130,0,0.9)", fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: 2.5, color: COLORS.white, textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 0 24px rgba(255,130,0,0.6)" }}>
              {f.verb}
            </div>
          </Anchored>
        );
      })}
      <TopBenefits benefits={benefits} />
    </>
  );
};

const TopBenefits: React.FC<{ readonly benefits: Array<[string, string]> }> = ({ benefits }) => {
  const frame = useCurrentFrame();
  const first = cue("connections", 1, benefits[0][1]);
  if (frame < first - 10 || frame > end("connections", 10)) return null;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", gap: 22, marginTop: -60 }}>
        {benefits.map(([label, w], i) => {
          const t = ramp(frame, cue("connections", 1, w), cue("connections", 1, w) + 20);
          return (
            <div key={label} style={{ padding: "18px 26px", borderRadius: 14, background: "linear-gradient(165deg, rgba(18,52,62,0.94), rgba(7,22,31,0.94))", borderTop: `3px solid ${i === 2 ? COLORS.orange : COLORS.turquoise}`, fontFamily: FONT, fontSize: 30, fontWeight: 600, color: COLORS.white, opacity: t, translate: `0px ${(1 - t) * 20}px`, boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
              {label}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
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
      {inScene("ecosystem") ? <EcosystemOverlay /> : null}
      {inScene("performance") ? <PerformanceOverlay /> : null}
      {inScene("ninebox") ? <NineBoxOverlay /> : null}
      {inScene("critical") ? <CriticalOverlay /> : null}
      {inScene("succession") ? <SuccessionOverlay /> : null}
      {inScene("leadership") ? <LeadershipOverlay /> : null}
      {inScene("nationalization") ? <NationalizationOverlay /> : null}
      {inScene("secondment") ? <SecondmentOverlay /> : null}
      {inScene("rewards") ? <RewardsOverlay /> : null}
      {inScene("platform") ? <PlatformOverlay /> : null}
      {inScene("connections") ? <ConnectionsOverlay /> : null}
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

