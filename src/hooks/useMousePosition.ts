import { useEffect, useRef, useState } from "react";

export interface Pointer {
  /** normalized -1..1 relative to viewport center */
  nx: number;
  ny: number;
  /** raw client coords */
  x: number;
  y: number;
}

const initial: Pointer = { nx: 0, ny: 0, x: 0, y: 0 };

/**
 * rAF-throttled global pointer tracking, normalized to viewport center.
 * onMove fires (throttled) for callers that want imperative updates without
 * triggering React re-renders.
 */
export function useMousePosition(onMove?: (p: Pointer) => void): Pointer {
  const [pointer, setPointer] = useState<Pointer>(initial);
  const frame = useRef<number | null>(null);
  const latest = useRef<Pointer>(initial);
  const cb = useRef(onMove);
  cb.current = onMove;

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      latest.current = { nx, ny, x: e.clientX, y: e.clientY };
      if (frame.current !== null) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        cb.current?.(latest.current);
        setPointer(latest.current);
      });
    };
    window.addEventListener("mousemove", handle, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handle);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, []);

  return pointer;
}
