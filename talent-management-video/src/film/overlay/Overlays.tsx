import type React from "react";
import { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Anchored, Card, Chapter, Tag, Title } from "./ui";
import { add, ramp, EASE, type V3 } from "../math";
import { SET } from "../layout";
import { at, cue, FPS, LOGO_HIT, SCENES } from "../timeline";
import {
  AWARDS,
  BEACONS,
  CRITICAL,
  DNA_FLOW,
  DNA_INDICATORS,
  FLOWS,
  GATES,
  PROGRAMS,
  SEATS,
  STAGES,
  SUCCESSION_FLOW,
  HOME,
  HOST,
  CORE,
  awardPos,
  heroAscent,
  helixPoint,
  orgNode,
  panelPos,
  programPos,
  seatPos,
  stagePos,
  terraceBase,
  tilePos,
} from "../geometry";
import { makeGalaxy } from "../world/Constellation";
import { WHY_HIGHLIGHT, workerPos } from "../world/Sets";
import { leadershipPath } from "../camera";
import { Bars, Donut, Kpi, TrendLine } from "../../components/Charts";
import { Logo } from "../../components/Logo";
import { LightStreak } from "../../components/LightStreak";
import { Icon, type IconName } from "../../components/Icons";
import { COLORS, FONT } from "../../theme";

const end = (id: keyof typeof SCENES, pad = 0) => SCENES[id].end + pad;

/* 01 ---------------------------------------------------------------- */
const OpeningOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const galaxy = useMemo(() => makeGalaxy(1800, 16, 1), []);
  // pick three lead nodes on the camera side of the constellation
  const leads = useMemo(() => {
    const out: number[] = [];
    for (let i = 0; i < 1800 && out.length < 3; i++) {
      if (galaxy.lead[i] && galaxy.pos[i * 3 + 2] > 4 && Math.abs(galaxy.pos[i * 3]) < 9) out.push(i);
    }
    return out;
  }, [galaxy]);
  const rot = frame * 0.0016;
  const posOf = (i: number): V3 => {
    const x = galaxy.pos[i * 3];
    const y = galaxy.pos[i * 3 + 1];
    const z = galaxy.pos[i * 3 + 2];
    return [x * Math.cos(rot) + z * Math.sin(rot), y, -x * Math.sin(rot) + z * Math.cos(rot)];
  };
  const words = ["every operation", "every innovation", "every achievement"];
  const labels: Array<[string, IconName]> = [
    ["Operations", "performance"],
    ["Innovation", "analytics"],
    ["Achievement", "rewards"],
  ];
  const titleAt = at("opening", 15.6);
  return (
    <>
      {leads.map((li, k) => {
        const c = cue("opening", 1, words[k]);
        return (
          <Tag
            key={li}
            at={posOf(li)}
            from={c}
            to={at("opening", 15.2)}
            label={labels[k][0]}
            icon={labels[k][1]}
            side={k === 1 ? "left" : "right"}
          />
        );
      })}
      <Title
        from={titleAt}
        to={end("opening", 10)}
        lines={[
          { text: "TALENT MANAGEMENT", size: 92, weight: 300, tracking: 22 },
          { text: "Building Capability.  Creating Futures.", size: 34, weight: 400, color: COLORS.lightBlue, tracking: 3, delay: 26 },
        ]}
      />
    </>
  );
};

/* 02 ---------------------------------------------------------------- */
const WhyOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const cues = [
    cue("why", 0, "the right talent"),
    cue("why", 0, "in the right roles"),
    cue("why", 0, "at the right time"),
  ];
  const tags: Array<[string, string]> = [
    ["Right talent", "Process engineer · ready now"],
    ["Right role", "Shift supervisor · critical role"],
    ["Right time", "Successor · ready in 6 months"],
  ];
  const l2 = SCENES.why.start;
  const pillars: Array<{ word: string; c: number; p: V3 }> = [
    { word: "Capability", c: cue("why", 1, "workforce capability"), p: add(SET.why as V3, [-7, 9, 3]) },
    { word: "Leadership", c: cue("why", 1, "leadership pipelines"), p: add(SET.why as V3, [-1, 10.5, -1]) },
    { word: "Performance", c: cue("why", 1, "leadership pipelines") + 22, p: add(SET.why as V3, [5, 9.5, -4]) },
    { word: "Succession", c: cue("why", 1, "secure the future") - 10, p: add(SET.why as V3, [10, 11, -7]) },
    { word: "Future Readiness", c: cue("why", 1, "secure the future") + 14, p: add(SET.why as V3, [14, 9, -10]) },
  ];
  return (
    <>
      <Chapter id="why" index="02" label="Why Talent Management" />
      {WHY_HIGHLIGHT.map((wi, k) => (
        <Tag key={wi} at={add(workerPos(wi), [0, 1.3, 0])} from={cues[k]} to={cue("why", 1, "Talent Management") - 6} label={tags[k][0]} sub={tags[k][1]} side={k === 2 ? "left" : "right"} />
      ))}
      <Card at={add(SET.why as V3, [-1, 6.5, 10])} from={l2 + 70} to={cue("why", 1, "Talent Management")} title="Workforce planning · 2026–2030" width={400} offset={[0, -220]}>
        <TrendLine values={[40, 44, 43, 50, 56, 60, 68, 74]} from={l2 + 85} width={356} height={110} color={COLORS.turquoise} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontFamily: FONT, fontSize: 15, color: COLORS.lightBlue }}>
          <span>Demand</span>
          <span style={{ color: COLORS.orange }}>Capability gap closing</span>
        </div>
      </Card>
      {pillars.map((p, i) => (
        <Anchored key={p.word} at={p.p} from={p.c} to={end("why", -20)} inF={18} outF={18}>
          <div style={{ position: "absolute", transform: "translate(-50%,-50%)", display: "flex", alignItems: "baseline", gap: 14, fontFamily: FONT, whiteSpace: "nowrap" }}>
            <span style={{ fontSize: 22, color: COLORS.orange, fontWeight: 600, letterSpacing: 2 }}>0{i + 1}</span>
            <span
              style={{
                fontSize: 64,
                fontWeight: 300,
                color: COLORS.white,
                letterSpacing: 2 + (1 - ramp(frame, p.c, p.c + 30)) * 14,
                textShadow: "0 0 30px rgba(0,0,0,0.7)",
              }}
            >
              {p.word}
            </span>
          </div>
        </Anchored>
      ))}
    </>
  );
};

/* 03 ---------------------------------------------------------------- */
const EcosystemOverlay: React.FC = () => {
  const integrated = cue("ecosystem", 0, "It is one integrated");
  return (
    <>
      <Chapter id="ecosystem" index="03" label="The Talent Management ecosystem" />
      {PROGRAMS.map((p, i) => {
        const from = at("ecosystem", 1.6) + i * 7;
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
                padding: "8px 14px 8px 10px",
                borderRadius: 10,
                background: "rgba(4,18,27,0.6)",
                border: "1px solid rgba(156,219,217,0.28)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                fontFamily: FONT,
                fontSize: 20,
                fontWeight: 600,
                color: COLORS.white,
                whiteSpace: "nowrap",
              }}
            >
              <Icon name={p.icon as IconName} size={22} color={i % 3 === 0 ? COLORS.orange : COLORS.turquoise} />
              {p.label}
            </div>
          </Anchored>
        );
      })}
      <Title
        at={add(SET.ecosystem as V3, [0, 8.2, 0])}
        from={integrated}
        to={cue("ecosystem", 1, "Each programme") - 4}
        lines={[{ text: "One integrated ecosystem.", size: 58, weight: 300, tracking: 1 }]}
      />
    </>
  );
};

/* 04 ---------------------------------------------------------------- */
const PerformanceOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const grow = (s: number) => at("performance", 3.4) + s * (10.5 - 3.4) * FPS;
  const spin = frame * 0.01;
  const values = ["42 verified", "Exceeds", "High", "6 active", "Ready in 1 yr", "Emerging leader"];
  const flowCue = cue("performance", 1, "It creates");
  const flowLabels = ["Performance Results", "Talent Reviews", "Leadership Decisions"];
  return (
    <>
      <Chapter id="performance" index="04" label="Performance Management" />
      <Tag at={add(SET.performance as V3, [0, 2.0, 0])} from={at("performance", 0.6)} to={at("performance", 4.2)} label="Talent ID 0147" sub="Process engineer" icon="people" />
      {DNA_INDICATORS.map((d, i) => (
        <Tag
          key={d.label}
          at={helixPoint(d.s, 0, spin)}
          from={grow(d.s) + 6}
          to={flowCue - 4}
          label={d.label}
          sub={values[i]}
          side={i % 2 ? "left" : "right"}
          accent={i % 2 ? "turquoise" : "orange"}
          size={22}
          lift={40}
        />
      ))}
      <Card at={add(SET.performance as V3, [-4.2, 5.8, 1.5])} from={at("performance", 5.5)} to={flowCue} title="Goal achievement" width={330} refDepth={16}>
        <Bars values={[52, 58, 61, 66, 70, 74, 81, 88]} from={at("performance", 6)} width={286} height={90} />
      </Card>
      <Card at={add(SET.performance as V3, [5.5, 3.6, -1])} from={at("performance", 6.4)} to={flowCue} title="Enterprise view" width={300} refDepth={16} accent="orange">
        <div style={{ display: "flex", gap: 22, fontFamily: FONT }}>
          {[
            ["87%", "Goals on track"],
            ["96%", "Reviews done"],
          ].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontSize: 44, fontWeight: 700, color: COLORS.white, letterSpacing: -1 }}>{v}</div>
              <div style={{ fontSize: 14, color: COLORS.lightBlue, letterSpacing: 1.5, textTransform: "uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </Card>
      {DNA_FLOW.map((p, i) => (
        <Tag key={i} at={p} from={flowCue + i * 36} to={end("performance", 20)} label={flowLabels[i]} side="right" accent={i === 2 ? "orange" : "turquoise"} />
      ))}
    </>
  );
};

/* 05 ---------------------------------------------------------------- */
const NineBoxOverlay: React.FC = () => {
  const N = SET.ninebox as V3;
  const heroLand = cue("ninebox", 0, "identify future leaders");
  const axis = (text: string) => (
    <div style={{ position: "absolute", transform: "translate(-50%,-50%)", fontFamily: FONT, fontSize: 20, letterSpacing: 6, color: COLORS.lightBlue, whiteSpace: "nowrap" }}>{text}</div>
  );
  return (
    <>
      <Chapter id="ninebox" index="05" label="The 9-Box Matrix" />
      <Anchored at={add(N, [0, 0.2, -7.4])} from={at("ninebox", 1.2)} to={end("ninebox", 10)}>
        {axis("PERFORMANCE  →")}
      </Anchored>
      <Anchored at={add(N, [-7.6, 0.2, 0])} from={at("ninebox", 1.4)} to={end("ninebox", 10)}>
        {axis("POTENTIAL  →")}
      </Anchored>
      <Tag at={add(tilePos(0, 2), [0, 0.4, 0])} from={cue("ninebox", 0, "accelerate")} to={end("ninebox")} label="Emerging Talent" side="left" accent="turquoise" />
      <Tag at={add(tilePos(1, 2), [0, 0.4, 0])} from={cue("ninebox", 0, "potential to")} to={end("ninebox")} label="High Potential" accent="turquoise" />
      <Tag at={add(tilePos(2, 2), [0, 1.2, 0])} from={heroLand} to={end("ninebox")} label="Future Leaders" sub="Talent ID 0147" icon="leadership" />
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
  const icons: Record<string, IconName> = {
    Safety: "shield",
    Operations: "performance",
    "Leadership continuity": "leadership",
    "Business performance": "analytics",
  };
  return (
    <>
      <Chapter id="critical" index="06" label="Critical Roles" />
      {CRITICAL.filter((c) => c.label).map((c, i) => (
        <Tag
          key={c.label}
          at={add(orgNode(c.tier, c.k), [0, 0.4, 0])}
          from={cue("critical", 1, words[c.label!])}
          to={end("critical", 10)}
          label={c.label!}
          sub="Vacancy risk · high"
          icon={icons[c.label!]}
          side={i % 2 ? "left" : "right"}
        />
      ))}
      <Card at={add(SET.critical as V3, [-12, 13.5, -2])} from={cue("critical", 0, "Not all")} to={cue("critical", 1, "safety")} title="Organisational risk scan" width={330} refDepth={26}>
        <div style={{ display: "flex", gap: 24, fontFamily: FONT }}>
          {[
            ["42", "Positions scanned"],
            ["7", "Critical roles"],
          ].map(([v, l], i) => (
            <div key={l}>
              <div style={{ fontSize: 44, fontWeight: 700, color: i ? COLORS.orange : COLORS.white }}>{v}</div>
              <div style={{ fontSize: 14, color: COLORS.lightBlue, letterSpacing: 1.5, textTransform: "uppercase" }}>{l}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
};

/* 07 ---------------------------------------------------------------- */
const SuccessionOverlay: React.FC = () => {
  const climbStart = at("succession", 3.6);
  const climbEnd = at("succession", 10.6);
  const atClimb = (t: number) => climbStart + (climbEnd - climbStart) * t;
  const anchors: V3[] = [
    seatPos(3, 0, SEATS[3]),
    heroAscent(0),
    heroAscent(0.33),
    heroAscent(0.66),
    seatPos(3, 0, SEATS[3]),
  ];
  const times = [at("succession", 2.4), climbStart - 4, atClimb(0.33), atClimb(0.66), climbEnd];
  const subs = ["Vacancy forecast · Q3", "Identified", "IDP · Masar programme", "Ready now", "Appointed"];
  return (
    <>
      <Chapter id="succession" index="07" label="Succession Planning" />
      {SUCCESSION_FLOW.map((label, i) => (
        <Tag
          key={label}
          at={add(anchors[i], [0, 0.5, 0])}
          from={times[i]}
          to={i === 0 ? climbEnd - 10 : i === 4 ? end("succession", 20) : times[i] + 80}
          label={label}
          sub={subs[i]}
          side={i % 2 ? "left" : "right"}
          accent={i === 0 || i === 4 ? "orange" : "turquoise"}
        />
      ))}
      <Card at={add(SET.succession as V3, [-4.5, 10, 4])} from={at("succession", 4.4)} to={end("succession", 10)} title="AI succession insight" width={340} accent="orange" refDepth={13}>
        <div style={{ fontFamily: FONT, color: COLORS.white, fontSize: 19, lineHeight: 1.5 }}>
          <div>
            Ready now <b style={{ color: COLORS.orange }}>2</b> · Ready 1–2 yrs <b style={{ color: COLORS.turquoise }}>3</b>
          </div>
          <div style={{ color: COLORS.lightBlue, fontSize: 16, marginTop: 6 }}>Recommended successor: Talent ID 0147</div>
        </div>
      </Card>
    </>
  );
};

/* 08 ---------------------------------------------------------------- */
const LeadershipOverlay: React.FC = () => {
  const start = at("leadership", 0.2);
  return (
    <>
      <Chapter id="leadership" index="08" label="Leadership Development" />
      {GATES.map((g, i) => {
        const p = leadershipPath(g.t);
        const arrive = start + g.t * 14 * FPS;
        return (
          <Anchored key={g.label} at={add(p, [0, 3.4, 0])} from={arrive - 40} to={arrive + 70}>
            <div style={{ position: "absolute", transform: "translate(-50%,-100%)", textAlign: "center", fontFamily: FONT, whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 16, color: COLORS.orange, letterSpacing: 4, fontWeight: 600 }}>0{i + 1}</div>
              <div style={{ fontSize: 34, color: COLORS.white, fontWeight: 300, letterSpacing: 1.5, textShadow: "0 0 24px rgba(0,0,0,0.7)" }}>{g.label}</div>
            </div>
          </Anchored>
        );
      })}
    </>
  );
};

/* 09 ---------------------------------------------------------------- */
const NationalizationOverlay: React.FC = () => {
  const Q = SET.nationalization as V3;
  return (
    <>
      <Chapter id="nationalization" index="09" label="Nationalization" />
      {STAGES.map((s, row) => (
        <Anchored key={s} at={add(terraceBase(row, 0), [-1.4, 2.6 + row * 0.5, 0])} from={at("nationalization", 1) + row * 14} to={end("nationalization", 10)}>
          <div style={{ position: "absolute", transform: "translate(-100%,-50%)", fontFamily: FONT, fontSize: 22, fontWeight: 500, letterSpacing: 3, color: row === 4 ? COLORS.orange : COLORS.lightBlue, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {s}
          </div>
        </Anchored>
      ))}
      <Card at={add(Q, [11, 10, -10])} from={at("nationalization", 4)} to={end("nationalization", 10)} title="National talent pipeline" width={300} accent="orange" refDepth={20}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <Donut size={120} from={at("nationalization", 4.5)} thickness={14} label="78%" sub="Omani" segments={[{ value: 78, color: COLORS.orange }, { value: 22, color: "rgba(156,219,217,0.35)" }]} />
        </div>
      </Card>
      <Card at={add(Q, [0, 15, -20])} from={at("nationalization", 6)} to={end("nationalization", 10)} title="National talent in" width={300} refDepth={20}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Kpi label="Critical roles" value={64} suffix="%" from={at("nationalization", 6.4)} width={250} />
          <Kpi label="Leadership positions" value={58} suffix="%" from={at("nationalization", 6.8)} width={250} accent={COLORS.turquoise} />
        </div>
      </Card>
    </>
  );
};

/* 10 ---------------------------------------------------------------- */
const SecondmentOverlay: React.FC = () => {
  const words: Array<[string, string, V3]> = [
    ["Broader exposure", "broader exposure", add(SET.secondment as V3, [4, 8.5, -1])],
    ["Accelerated learning", "accelerate learning", add(SET.secondment as V3, [-1, 10, 0.5])],
    ["Knowledge transfer", "strengthen", add(SET.secondment as V3, [-5, 7.5, 2])],
    ["Strengthened capability", "capability through", add(SET.secondment as V3, [-8, 9, -1])],
  ];
  return (
    <>
      <Chapter id="secondment" index="10" label="Secondment Management" />
      <Tag at={add(HOME, [0, 5.2, 0])} from={at("secondment", 0.8)} to={end("secondment", 10)} label="Home organisation" icon="nationalization" />
      <Tag at={add(HOST, [0, 5.2, 0])} from={at("secondment", 1.6)} to={end("secondment", 10)} label="Host organisation" icon="secondment" side="left" accent="turquoise" />
      {words.map(([label, w, p], i) => (
        <Tag key={label} at={p} from={cue("secondment", 0, w)} to={end("secondment", 10)} label={label} side={i % 2 ? "left" : "right"} accent={i % 2 ? "turquoise" : "orange"} size={22} lift={44} />
      ))}
    </>
  );
};

/* 11 ---------------------------------------------------------------- */
const RewardsOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const spin = frame * 0.0035;
  const honoured = [2, 6, 11];
  const why = ["Safety excellence", "Innovation", "Team leadership"];
  const spots = [at("rewards", 2.0), at("rewards", 4.6), at("rewards", 7.2)];
  return (
    <>
      <Chapter id="rewards" index="11" label="Rewards & Recognition" />
      {honoured.map((h, k) => (
        <Tag key={h} at={add(stagePos(h, 14), [0, 1.4, 0])} from={spots[k] + 8} to={end("rewards", 10)} label="Recognised" sub={why[k]} icon="rewards" side={k === 1 ? "left" : "right"} size={22} lift={50} />
      ))}
      {AWARDS.map((a, k) => (
        <Anchored key={a.title} at={awardPos(k, spin)} from={at("rewards", 0.6) + k * 10} to={end("rewards", 10)} sizeWithDistance refDepth={12}>
          <div
            style={{
              position: "absolute",
              transform: "translate(-50%,-50%)",
              width: 250,
              padding: "16px 18px",
              borderRadius: 16,
              background: "linear-gradient(140deg, rgba(255,130,0,0.22), rgba(4,15,23,0.55))",
              border: "1px solid rgba(255,190,120,0.35)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              fontFamily: FONT,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Icon name="rewards" size={24} />
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.white }}>{a.title}</div>
            </div>
            <div style={{ fontSize: 15, color: COLORS.lightBlue, marginTop: 6 }}>{a.sub}</div>
          </div>
        </Anchored>
      ))}
    </>
  );
};

/* 12 ---------------------------------------------------------------- */
const PlatformOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const typed = (text: string, from: number, cps = 1.5) => text.slice(0, Math.max(0, Math.floor((frame - from) * cps)));
  const q = at("platform", 3.5);
  const a = at("platform", 6.2);
  const features = ["AI Chatbot", "Talent Intelligence", "Interactive Dashboards", "Predictive Analytics"];
  return (
    <>
      <Chapter id="platform" index="12" label="The Intelligent Talent Platform" />
      <Card at={panelPos(-36, 6)} from={at("platform", 1.2)} to={end("platform", 10)} title="Executive talent intelligence" width={420} refDepth={12}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <Kpi label="Bench strength" value={2.4} decimals={1} suffix="x" from={at("platform", 1.6)} width={180} />
          <Kpi label="Succession ready" value={83} suffix="%" from={at("platform", 1.9)} width={180} accent={COLORS.turquoise} />
          <Kpi label="Leadership pipeline" value={146} from={at("platform", 2.2)} width={180} accent={COLORS.lightBlue} />
          <Kpi label="Talent risk" value={12} suffix="low" from={at("platform", 2.5)} width={180} accent={COLORS.green} />
        </div>
      </Card>
      <Card at={panelPos(-10, 9.4)} from={at("platform", 2)} to={end("platform", 10)} title="Predictive readiness · 24 months" width={400} accent="orange" refDepth={12}>
        <TrendLine values={[58, 61, 66, 70, 74, 79, 83, 88, 91]} from={at("platform", 2.6)} width={356} height={110} />
      </Card>
      <Card at={panelPos(30, 6.2)} from={at("platform", 2.8)} to={end("platform", 10)} title="Talent AI assistant" width={400} refDepth={12}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontFamily: FONT }}>
          <div style={{ alignSelf: "flex-end", maxWidth: 320, padding: "10px 14px", borderRadius: 12, background: "rgba(255,130,0,0.85)", color: COLORS.white, fontSize: 17, lineHeight: 1.35, opacity: frame > q ? 1 : 0 }}>
            {typed("Which critical roles have no ready-now successor?", q)}
          </div>
          <div style={{ maxWidth: 340, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.08)", color: COLORS.white, fontSize: 17, lineHeight: 1.35, opacity: frame > a ? 1 : 0 }}>
            {typed("7 of 42 critical roles. 5 have a successor ready within a year; 2 need targeted development. Opening the readiness view.", a, 2)}
          </div>
        </div>
      </Card>
      <Card at={panelPos(42, 7.2)} from={at("platform", 3.4)} to={end("platform", 10)} title="Capability heatmap" width={300} refDepth={12}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 5 }}>
          {Array.from({ length: 40 }).map((_, i) => {
            const v = (Math.sin(i * 12.9898) * 43758.5453) % 1;
            const r = Math.abs(v);
            const t = ramp(frame, at("platform", 3.6) + i * 2, at("platform", 4) + i * 2);
            return <div key={i} style={{ height: 16, borderRadius: 3, background: r > 0.8 ? COLORS.orange : r > 0.45 ? COLORS.turquoise : COLORS.lightBlue, opacity: (0.25 + r * 0.75) * t }} />;
          })}
        </div>
      </Card>
      {features.map((f, i) => (
        <Tag key={f} at={add(CORE, [Math.cos(i * 1.57 + 0.6) * 3.4, 2.6 - i * 1.2, Math.sin(i * 1.57 + 0.6) * 3.4])} from={at("platform", 10) + i * 12} to={end("platform", 10)} label={f} icon={(["ai", "analytics", "ninebox", "performance"] as IconName[])[i]} side={i % 2 ? "left" : "right"} size={22} lift={46} />
      ))}
    </>
  );
};

/* 13 ---------------------------------------------------------------- */
const ConnectionsOverlay: React.FC = () => {
  const flowStart = at("connections", 3.2);
  const flowStep = 1.5 * FPS;
  const ids = Object.keys(BEACONS) as Array<keyof typeof BEACONS>;
  return (
    <>
      <Chapter id="connections" index="13" label="How everything connects" />
      {ids.map((id) => (
        <Anchored key={id} at={add(BEACONS[id].pos, [0, 10, 0])} from={at("connections", 1.6)} to={end("connections", 30)}>
          <div style={{ position: "absolute", transform: "translate(-50%,-100%)", fontFamily: FONT, fontSize: 19, fontWeight: 600, letterSpacing: 1.5, color: FLOWS.some((f) => f.from === id || f.to === id) ? COLORS.white : COLORS.lightBlue, whiteSpace: "nowrap", textShadow: "0 0 14px rgba(0,0,0,0.9)" }}>
            {BEACONS[id].label}
          </div>
        </Anchored>
      ))}
      {FLOWS.map((f, i) => {
        const a = BEACONS[f.from].pos;
        const b = BEACONS[f.to].pos;
        const mid: V3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 6.2, (a[2] + b[2]) / 2];
        const from = flowStart + i * flowStep + 24;
        return (
          <Anchored key={i} at={mid} from={from} to={end("connections", 20)}>
            <div style={{ position: "absolute", transform: "translate(-50%,-50%)", padding: "6px 12px", borderRadius: 8, background: "rgba(255,130,0,0.9)", fontFamily: FONT, fontSize: 15, fontWeight: 700, letterSpacing: 2.5, color: COLORS.white, textTransform: "uppercase", whiteSpace: "nowrap", boxShadow: "0 0 24px rgba(255,130,0,0.6)" }}>
              {f.verb}
            </div>
          </Anchored>
        );
      })}
    </>
  );
};

/* 14 ---------------------------------------------------------------- */
const FutureOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const hit = LOGO_HIT;
  const reveal = ramp(frame, hit, hit + 45, EASE.inOut);
  const endF = SCENES.future.end;
  const black = ramp(frame, endF - 36, endF - 2, EASE.inOut);
  return (
    <>
      <Title
        from={cue("future", 0, "The future")}
        to={cue("future", 1, "By investing") - 10}
        lines={[
          { text: "The future is not built by systems.", size: 60, weight: 300, tracking: 1 },
          { text: "It is built by people.", size: 72, weight: 600, color: COLORS.orange, tracking: 0, delay: Math.max(0, cue("future", 0, "It is built") - cue("future", 0, "The future")) },
        ]}
      />
      {frame >= hit - 4 ? (
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, marginTop: -30 }}>
            <div style={{ opacity: ramp(frame, hit, hit + 14), filter: `blur(${(1 - reveal) * 8}px)`, scale: String(0.94 + 0.06 * reveal) }}>
              <Logo height={150} reveal={reveal} />
            </div>
            <div style={{ fontFamily: FONT, fontSize: 40, fontWeight: 300, letterSpacing: 10 + (1 - ramp(frame, hit + 30, hit + 80)) * 18, color: COLORS.white, opacity: ramp(frame, hit + 30, hit + 70) }}>
              TALENT MANAGEMENT
            </div>
            <div style={{ display: "flex", gap: 34 }}>
              {["Building Capability.", "Creating Futures.", "Securing Tomorrow."].map((t, i) => (
                <div key={t} style={{ fontFamily: FONT, fontSize: 30, fontWeight: i === 2 ? 600 : 400, color: i === 2 ? COLORS.orange : COLORS.lightBlue, opacity: ramp(frame, hit + 70 + i * 16, hit + 100 + i * 16), translate: `0px ${(1 - ramp(frame, hit + 70 + i * 16, hit + 100 + i * 16)) * 12}px` }}>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </AbsoluteFill>
      ) : null}
      <LightStreak from={hit - 6} duration={34} y={505} thickness={5} />
      <LightStreak from={hit + 90} duration={46} y={560} thickness={3} color={COLORS.turquoise} />
      <AbsoluteFill style={{ background: "#000", opacity: black }} />
    </>
  );
};

export const Overlays: React.FC = () => {
  const frame = useCurrentFrame();
  const inScene = (id: keyof typeof SCENES, pre = 30, post = 40) =>
    frame >= SCENES[id].start - pre && frame <= SCENES[id].end + post;
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
      {inScene("future") ? <FutureOverlay /> : null}
    </AbsoluteFill>
  );
};
