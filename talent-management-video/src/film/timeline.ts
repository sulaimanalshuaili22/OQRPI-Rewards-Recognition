import timeline from "./timeline.json";
import music from "./music.json";

export const FPS = timeline.fps;
export const TOTAL_FRAMES = timeline.durationInFrames;
export const LOGO_HIT = music.logoHitFrame;
export const CLIMAX = music.climaxFrame;

export type SceneId =
  | "opening"
  | "why"
  | "ecosystem"
  | "performance"
  | "ninebox"
  | "critical"
  | "succession"
  | "leadership"
  | "nationalization"
  | "secondment"
  | "rewards"
  | "platform"
  | "connections"
  | "future";

export type SceneWindow = {
  readonly id: SceneId;
  readonly name: string;
  readonly start: number;
  readonly duration: number;
  readonly end: number;
};

export const SCENES = Object.fromEntries(
  timeline.scenes.map((s) => [
    s.id,
    { ...s, end: s.start + s.duration } as SceneWindow,
  ]),
) as Record<SceneId, SceneWindow>;

export const SCENE_LIST: SceneWindow[] = timeline.scenes.map(
  (s) => SCENES[s.id as SceneId],
);

export type Line = {
  readonly scene: SceneId;
  readonly text: string;
  readonly start: number;
  readonly end: number;
};

export const LINES = timeline.lines as Line[];

/** Absolute frame for `seconds` into a scene. */
export const at = (id: SceneId, seconds: number) =>
  SCENES[id].start + seconds * FPS;

export const linesOf = (id: SceneId) => LINES.filter((l) => l.scene === id);

/**
 * Approximate frame at which the narrator reaches `phrase` within a line,
 * proportional to character position (good to within a few frames for this read).
 */
export const cue = (id: SceneId, lineNo: number, phrase: string) => {
  const line = linesOf(id)[lineNo];
  const idx = line.text.indexOf(phrase);
  if (idx < 0) {
    throw new Error(`cue: "${phrase}" not found in ${id}#${lineNo}`);
  }
  const speechEnd = line.end - 8;
  return Math.round(
    line.start + (idx / line.text.length) * (speechEnd - line.start),
  );
};
