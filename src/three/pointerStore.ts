/**
 * Global pointer singleton. A single passive listener feeds normalized + raw
 * coordinates that any consumer (WebGL stage, cursor field, HUD) can read each
 * frame without triggering React re-renders. Values are smoothed toward a
 * target so everything that reads `sx/sy` shares the same eased motion.
 */
export interface PointerState {
  /** raw client coords */
  x: number;
  y: number;
  /** normalized -1..1 from viewport center (target) */
  nx: number;
  ny: number;
  /** smoothed normalized values */
  sx: number;
  sy: number;
  /** smoothed velocity magnitude 0..1 (energy) */
  speed: number;
  /** pointer currently inside the window */
  active: boolean;
}

export const pointer: PointerState = {
  x: 0,
  y: 0,
  nx: 0,
  ny: 0,
  sx: 0,
  sy: 0,
  speed: 0,
  active: false,
};

let inited = false;
let lastX = 0;
let lastY = 0;
let rafSmoothing = 0;

function smooth() {
  rafSmoothing = requestAnimationFrame(smooth);
  pointer.sx += (pointer.nx - pointer.sx) * 0.08;
  pointer.sy += (pointer.ny - pointer.sy) * 0.08;
  pointer.speed *= 0.92;
}

/** Initialize the global listener exactly once. Safe to call repeatedly. */
export function initPointer() {
  if (inited || typeof window === "undefined") return;
  inited = true;

  const onMove = (e: MouseEvent) => {
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.nx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ny = (e.clientY / window.innerHeight) * 2 - 1;
    pointer.active = true;
    const v = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 40);
    pointer.speed = Math.max(pointer.speed, v);
  };

  const onLeave = () => {
    pointer.active = false;
  };

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("mouseout", onLeave, { passive: true });
  smooth();
}

export function disposePointer() {
  if (rafSmoothing) cancelAnimationFrame(rafSmoothing);
}
