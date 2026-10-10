import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// OQ brand palette (screen values from the OQ Brand Guidelines, section 7.1 / 7.2)
export const COLORS = {
  midnight: "#081F2C",
  midnightDeep: "#040F17",
  midnight90: "#213541",
  midnight70: "#52626B",
  midnight50: "#838F95",
  midnight30: "#B5BCC0",
  midnight10: "#E6E9EA",
  orange: "#FF8200",
  orange70: "#FFA84D",
  orange30: "#FFDAB3",
  turquoise: "#00B0B9",
  lightBlue: "#9CDBD9",
  white: "#FFFFFF",
  // light metallic grey accents requested in the brief
  silver: "#C9CFD4",
  silverDark: "#8F99A1",
  green: "#00AA6E",
  yellow: "#FFC846",
  red: "#F04B41",
} as const;

// Aktiv Grotesk is the OQ principal typeface. It is a licensed font, so Inter
// (a close grotesk, bundled locally in /public/fonts so renders never need the
// network) is used; the brand guideline's own system fallbacks (Arial /
// Helvetica) follow it in the stack. To use the real brand font, drop the
// Aktiv Grotesk .woff2 files into /public/fonts and point these URLs at them.
const INTER_WEIGHTS = ["300", "400", "500", "600", "700", "800"] as const;

export const fontsReady = Promise.all([
  ...INTER_WEIGHTS.map((weight) =>
    loadFont({
      family: "Inter",
      url: staticFile(`fonts/inter-latin-${weight}-normal.woff2`),
      weight,
      format: "woff2",
    }),
  ),
  // Arabic (Talent Assistant answers in English or Arabic)
  loadFont({ family: "Noto Sans Arabic", url: staticFile("fonts/NotoSansArabic-Regular.ttf"), weight: "400", format: "truetype" }),
  loadFont({ family: "Noto Sans Arabic", url: staticFile("fonts/NotoSansArabic-Bold.ttf"), weight: "700", format: "truetype" }),
]);

export const FONT = `Inter, "Aktiv Grotesk", "Noto Sans Arabic", Arial, Helvetica, sans-serif`;
export const FONT_AR = `"Noto Sans Arabic", Inter, sans-serif`;

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  cinematic: Easing.bezier(0.22, 1, 0.36, 1),
  soft: Easing.bezier(0.33, 1, 0.68, 1),
};

export const SAFE = {
  x: 140,
  y: 120,
};
