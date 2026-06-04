import { useEffect, useRef, useState } from "react";

/**
 * Reports whether the user has been idle (no pointer / scroll / key) for
 * `delay` ms. Drives the autonomous "ghost run" demo.
 */
export function useIdle(delay = 4500): boolean {
  const [idle, setIdle] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const reset = () => {
      setIdle(false);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setIdle(true), delay);
    };
    const events: (keyof WindowEventMap)[] = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "wheel",
    ];
    events.forEach((ev) =>
      window.addEventListener(ev, reset, { passive: true })
    );
    reset();
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, reset));
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [delay]);

  return idle;
}
