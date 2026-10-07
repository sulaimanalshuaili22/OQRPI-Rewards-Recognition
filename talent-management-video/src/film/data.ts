/**
 * OQ RPI Talent Command Center figures used on screen.
 *
 * Source: Talent Command Center (SharePoint · RPITalentData), data as of
 * 30 Sep 2026; Rewards & Recognition dashboard refreshed 07 Oct 2026.
 * Aggregates only — no individual employee data is shown in the film.
 * Update this file when the dashboard refreshes; every visual reads from it.
 */
export const AS_OF = "30 Sep 2026";
export const SOURCE = "OQ RPI Talent Command Center";

export const COMMAND_CENTER = {
  title: "Talent Management Projects",
  tagline: ["Building Tomorrow's Talent", "Together"],
  footer: "TALENT FUELS PERFORMANCE",
  nav: ["People", "Performance", "Sustainable Growth"],
  projects: [
    { n: "01", title: "Executive talent overview", sub: "Consolidated status, progress and health of every talent programme.", accent: "orange", icon: "people" },
    { n: "02", title: "Nationalization", sub: "Omanization progress, local talent and compliance.", accent: "green", icon: "nationalization" },
    { n: "03", title: "Succession & critical roles", sub: "Critical roles, readiness, bench strength and pipeline.", accent: "teal", icon: "succession" },
    { n: "04", title: "Leadership Development Hub", sub: "Robban, MASAR, external & executive programmes and pipeline impact.", accent: "purple", icon: "leadership" },
    { n: "05", title: "9-box talent matrix", sub: "Talent potential and performance matrix.", accent: "teal", icon: "ninebox" },
    { n: "06", title: "Rewards & recognition", sub: "Recognition programmes and rewards overview.", accent: "gold", icon: "rewards" },
    { n: "07", title: "Secondment management", sub: "Secondee tracking and mobility management.", accent: "orange", icon: "secondment" },
    { n: "08", title: "BU talent scorecard", sub: "Business unit talent scorecard and performance.", accent: "green", icon: "analytics" },
    { n: "09", title: "Talent Assistant", sub: "Ask any question on the talent data, in English or Arabic.", accent: "teal", icon: "ai" },
  ],
} as const;

export const WORKFORCE = { employees: 2883 };

export const PERFORMANCE = {
  rated2026: 680,
  ratedShare: "23.6%",
  highPotential: 306,
  hiLeadReadyToday: 43,
  technicalTrack: 198,
  movedUpSince2025: 196,
};

/** 2026 ranking: rows = performance, columns = runway (potential). */
export const NINE_BOX = {
  rows: ["Need improvement", "Achieved target", "Exceeds target"],
  cols: ["Limited runway", "Open runway · 2–4 yrs", "High future impact · 0–1 yr"],
  // cells[performance][runway]
  cells: [
    [
      { name: "Shortfall", n: 2, note: "Exit company" },
      { name: "Dilemma", n: 17, note: "Need improvement" },
      { name: "Casting Error", n: 14, note: "Exit current role" },
    ],
    [
      { name: "Safe Hand", n: 124, note: "Comfort zone" },
      { name: "Promising", n: 143, note: "Starting point" },
      { name: "Hi-Potential", n: 83, note: "Potential leader" },
    ],
    [
      { name: "Hi-Professional", n: 74, note: "SME" },
      { name: "Hi-Grow", n: 180, note: "Growing fast" },
      { name: "Hi-Lead", n: 43, note: "Ready today" },
    ],
  ],
};

export const SUCCESSION = {
  criticalRoles: 309,
  rolesWithSuccessor: 132,
  successorSlots: 165,
  peopleInPipeline: 139,
  addedByFocalPoints: 18,
  benchByNamed: [
    { label: "1 named", n: 105 },
    { label: "2 named", n: 21 },
    { label: "3 named", n: 6 },
  ],
};

export const LEADERSHIP = {
  programmes: 12,
  internal: 4,
  external: 8,
  places2023to2026: 272,
  masarPlaces: 238,
  robbanPlaces: 24,
  externalPlaces: 10,
  nominated2026: 32,
  leadersThroughMasar: 185,
  leadersTotal: 306,
  robban: {
    name: "Robban Leadership Development Program 2026",
    strap: "Leadership Beyond Limits",
    partner: "Center for Creative Leadership (CCL)",
    cohort: 24,
    dates: "4–8 Oct 2026 · Sohar",
    functions: 8,
  },
  masar: {
    name: "MASAR Leadership Journey · 2023–2025",
    alumni: 237,
    intakes: 3,
    cohorts: 11,
    themes: ["Leading self", "Leading people", "Leading performance"],
  },
  externalProgrammes: ["JCCP Tokyo", "CCL SLP London", "Baker Hughes", "Takatuf Lead"],
  pathway: [
    { step: "Step 1", level: "Key ICs & HiPos", programmes: "MASAR · Baker Hughes · JCCP Women in Leadership" },
    { step: "Step 2", level: "First-line leaders", programmes: "MASAR · Robban · Takatuf Lead" },
    { step: "Step 3", level: "Managers", programmes: "Robban · MASAR" },
    { step: "Step 4", level: "Heads", programmes: "MASAR · CCL SLP" },
    { step: "Step 5", level: "Executives", programmes: "SLT Effectiveness · JCCP Next Tech" },
  ],
  participation: [
    { year: "2023", n: 106 },
    { year: "2024", n: 67 },
    { year: "2025", n: 75 },
    { year: "2026", n: 35 },
  ],
};

export const NATIONALIZATION = {
  tracked: 450,
  activeExpats: 361,
  planned2026to2027: 128,
  omaniSuccessorsNamed: 99,
  plan: [
    { year: "2026", n: 44 },
    { year: "2027", n: 84 },
    { year: "2028", n: 94 },
    { year: "2029", n: 11 },
    { year: "2030", n: 9 },
  ],
};

export const SECONDMENT = {
  onRecord: 9,
  outbound: 4,
  inbound: 5,
  active: 3,
  hosts: [
    { name: "OQ SAOC", n: 4 },
    { name: "General Secretariat, Council of Ministers", n: 1 },
    { name: "Oman Vision 2040 (OVIFU)", n: 1 },
    { name: "OPAL", n: 1 },
    { name: "OQ8", n: 1 },
  ],
};

export const REWARDS = {
  granted: 1369,
  eligible: 2785,
  period: "Jan–Aug 2026",
  budgetOMR: 221750,
  usedOMR: 90800,
  per100: 47.5,
  programmes: [
    { name: "Testahal", rewarded: 1111, accent: "green" },
    { name: "Above & Beyond", rewarded: 149, accent: "orange" },
    { name: "HSSE Award", rewarded: 65, accent: "purple" },
    { name: "Reliability Award", rewarded: 44, accent: "teal" },
  ],
  monthly: [
    { m: "Jan", n: 5 },
    { m: "Feb", n: 165 },
    { m: "Mar", n: 145 },
    { m: "Apr", n: 200 },
    { m: "May", n: 320 },
    { m: "Jun", n: 160 },
    { m: "Jul", n: 245 },
    { m: "Aug", n: 120 },
  ],
};

export const fmt = (n: number) => n.toLocaleString("en-US");
