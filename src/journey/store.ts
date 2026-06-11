/**
 * Mutable journey state shared between the scroll driver (GSAP ScrollTrigger),
 * the 3D scene (read every frame, no React re-renders) and the DOM overlay.
 */
export type HoverInfo = {
  name: string;
  layer: string;
  detail: string;
} | null;

export const journey = {
  /** raw scroll progress 0..1 written by ScrollTrigger */
  progress: 0,
  /** damped progress used by camera + overlay for cinematic smoothing */
  smooth: 0,
  /** per-orbit activation 0..1 */
  traffic: 0,
  automation: 0,
  revenue: 0,
  /** full system activation (scene 05) */
  activation: 0,
  hovered: null as HoverInfo,
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

export const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** trapezoid fade: 0 before a, ramps to 1 by b, holds until c, gone by d */
export const fade = (p: number, a: number, b: number, c: number, d: number) => {
  if (p <= a || p >= d) return 0;
  if (p < b) return (p - a) / (b - a);
  if (p < c) return 1;
  return 1 - (p - c) / (d - c);
};
