import timeline from "./timeline.json";
import music from "./music.json";

export const FPS = timeline.fps;
export const TOTAL_FRAMES = timeline.durationInFrames;
export const LOGO_HIT = music.logoHitFrame;
export const BAR = music.barFrames;

export type SceneId =
  | "coldopen"
  | "lights"
  | "know"
  | "grow"
  | "secure"
  | "sustain"
  | "proof"
  | "handover";

export type SceneWindow = {
  readonly id: SceneId;
  readonly name: string;
  readonly start: number;
  readonly duration: number;
  readonly end: number;
};

export const SCENES = Object.fromEntries(
  timeline.scenes.map((s) => [s.id, { ...s, end: s.start + s.duration } as SceneWindow]),
) as Record<SceneId, SceneWindow>;

export const SCENE_LIST: SceneWindow[] = timeline.scenes.map((s) => SCENES[s.id as SceneId]);

export type Line = {
  readonly scene: SceneId;
  readonly text: string;
  /** what the narrator reads, when it differs from the caption */
  readonly say?: string;
  readonly start: number;
  readonly end: number;
};

export const LINES = timeline.lines as Line[];

export const linesOf = (id: SceneId) => LINES.filter((l) => l.scene === id);
export const lineStart = (id: SceneId, n: number) => linesOf(id)[n].start;
export const lineEnd = (id: SceneId, n: number) => linesOf(id)[n].end;

/**
 * Approximate frame at which the narrator reaches `phrase` within a line,
 * proportional to character position in the spoken text (numbers are read as
 * words, so "309" in the caption is "three hundred and nine" here).
 */
export const cue = (id: SceneId, lineNo: number, phrase: string) => {
  const line = linesOf(id)[lineNo];
  const spoken = line.say ?? line.text;
  const idx = spoken.indexOf(phrase);
  if (idx < 0) {
    throw new Error(`cue: "${phrase}" not found in ${id}#${lineNo}`);
  }
  const speechEnd = line.end - 8;
  return Math.round(line.start + (idx / spoken.length) * (speechEnd - line.start));
};
