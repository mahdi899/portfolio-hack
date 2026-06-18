/**
 * Shared mutable journey state. Written by the GSAP ScrollTrigger driver,
 * read every frame by the 3D scene and the DOM overlay (no React re-renders).
 */
export const journey = {
  /** raw scroll progress 0..1 */
  progress: 0,
  /** damped progress used for all cinematic motion */
  smooth: 0,
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** trapezoid fade: 0 before a, ramps to 1 by b, holds until c, gone by d */
export const fade = (p: number, a: number, b: number, c: number, d: number) => {
  if (p <= a || p >= d) return 0;
  if (p < b) return smoothstep(a, b, p);
  if (p < c) return 1;
  return 1 - smoothstep(c, d, p);
};

/* ------------------------------ scene ranges ----------------------------- */

export type SceneId =
  | "hero"
  | "problem"
  | "traffic"
  | "capture"
  | "gate"
  | "agents"
  | "tunnel"
  | "crm"
  | "human"
  | "revenue"
  | "cta";

const WEIGHTS: [SceneId, number][] = [
  ["hero", 1.0],
  ["problem", 1.0],
  ["traffic", 1.0],
  ["capture", 1.0],
  ["gate", 1.05],
  ["agents", 1.05],
  ["tunnel", 0.9],
  ["crm", 1.0],
  ["human", 0.95],
  ["revenue", 1.05],
  ["cta", 0.75],
];

export const SCENE_ORDER: SceneId[] = WEIGHTS.map(([id]) => id);

export const RANGES: Record<SceneId, [number, number]> = (() => {
  const total = WEIGHTS.reduce((s, [, w]) => s + w, 0);
  const out = {} as Record<SceneId, [number, number]>;
  let acc = 0;
  for (const [id, w] of WEIGHTS) {
    out[id] = [acc / total, (acc + w) / total];
    acc += w;
  }
  out.cta[1] = 1.001; // hold the final scene at full scroll
  return out;
})();

/**
 * Visibility weight of a scene at progress p.
 * Feathers are fractions of the scene's own range used for fade in/out.
 */
export const sceneFade = (
  p: number,
  id: SceneId,
  featherIn = 0.3,
  featherOut = 0.3
) => {
  const [a, b] = RANGES[id];
  const len = b - a;
  if (id === "hero") return fade(p, a - 1, a, b - len * featherOut, b);
  if (id === "cta") return fade(p, a, a + len * featherIn, 2, 3);
  return fade(p, a, a + len * featherIn, b - len * featherOut, b);
};

/** 0..1 local progress within a scene */
export const sceneLocal = (p: number, id: SceneId) => {
  const [a, b] = RANGES[id];
  return clamp01((p - a) / (b - a));
};

export const sceneIndexAt = (p: number) => {
  for (let i = SCENE_ORDER.length - 1; i >= 0; i--) {
    if (p >= RANGES[SCENE_ORDER[i]][0]) return i;
  }
  return 0;
};

/* ------------------------------ device tier ------------------------------ */

export const LOW_TIER =
  typeof window !== "undefined" &&
  (window.innerWidth < 820 ||
    (navigator.hardwareConcurrency ?? 8) <= 4 ||
    /Mobi|Android/i.test(navigator.userAgent));

export const COUNT = (full: number) => (LOW_TIER ? Math.floor(full * 0.45) : full);
