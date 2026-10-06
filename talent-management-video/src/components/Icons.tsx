import type React from "react";
import { COLORS } from "../theme";

type IconProps = {
  readonly size?: number;
  readonly color?: string;
  readonly strokeWidth?: number;
};

export type IconName =
  | "performance"
  | "succession"
  | "critical"
  | "leadership"
  | "learning"
  | "idp"
  | "nationalization"
  | "review"
  | "ninebox"
  | "rewards"
  | "secondment"
  | "analytics"
  | "people"
  | "shield"
  | "ai";

// Outline icons in the OQ iconography style (rounded strokes, single weight).
const paths: Record<IconName, React.ReactNode> = {
  performance: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M3 7l6-3 5 4 7-5" />
    </>
  ),
  succession: (
    <>
      <path d="M12 3v6" />
      <circle cx="12" cy="3" r="0.01" />
      <path d="M5 21v-5h14v5" />
      <path d="M12 9c-4 0-7 2-7 7" />
      <path d="M12 9c4 0 7 2 7 7" />
      <circle cx="12" cy="13" r="2.5" />
    </>
  ),
  critical: (
    <>
      <path d="M12 3l9 16H3z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  leadership: (
    <>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
      <path d="M17 4l2 2 3-3" />
    </>
  ),
  learning: (
    <>
      <path d="M3 6h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3z" />
      <path d="M21 6h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />
    </>
  ),
  idp: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </>
  ),
  nationalization: (
    <>
      <path d="M4 21V9l8-6 8 6v12" />
      <path d="M9 21v-7h6v7" />
      <path d="M12 3v3" />
    </>
  ),
  review: (
    <>
      <circle cx="10" cy="10" r="6" />
      <path d="M21 21l-6.5-6.5" />
      <path d="M8 10h4M10 8v4" />
    </>
  ),
  ninebox: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </>
  ),
  rewards: (
    <>
      <path d="M8 3h8v6a4 4 0 0 1-8 0z" />
      <path d="M8 5H5a3 3 0 0 0 3 5M16 5h3a3 3 0 0 1-3 5" />
      <path d="M12 13v4M8 21h8M10 17h4" />
    </>
  ),
  secondment: (
    <>
      <path d="M4 7h11l-3-3M20 17H9l3 3" />
      <path d="M4 7v4M20 17v-4" />
    </>
  ),
  analytics: (
    <>
      <path d="M3 21h18" />
      <path d="M5 17l4-6 4 3 6-8" />
      <circle cx="19" cy="6" r="1.5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <path d="M14 20a5 5 0 0 1 7 -3" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  ai: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="4" />
      <path d="M12 2v4" />
      <circle cx="9" cy="12" r="1.2" />
      <circle cx="15" cy="12" r="1.2" />
      <path d="M9 16h6" />
    </>
  ),
};

export const Icon: React.FC<IconProps & { readonly name: IconName }> = ({
  name,
  size = 48,
  color = COLORS.orange,
  strokeWidth = 1.8,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {paths[name]}
  </svg>
);
