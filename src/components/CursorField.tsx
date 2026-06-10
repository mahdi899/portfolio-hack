import { useEffect, useRef } from "react";
import { useSystemState } from "../state/useSystemState";
import { pointer, initPointer } from "../three/pointerStore";
import "./CursorField.css";

/**
 * Custom, system-aware cursor: a precise core dot that tracks the pointer
 * instantly and a lagging energy ring that swells with pointer velocity and
 * locks onto interactive targets. Disabled for touch / reduced-motion.
 */
export function CursorField() {
  const { reducedMotion } = useSystemState();
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    initPointer();

    document.body.classList.add("has-custom-cursor");

    let raf = 0;
    let rx = 0;
    let ry = 0;
    let scale = 1;
    let hot = 0;

    const isInteractive = (el: Element | null) =>
      !!el?.closest(
        "a, button, [role='button'], input, textarea, .node, .module, .pipe, .agent, .jstep"
      );

    const onOver = (e: MouseEvent) => {
      hot = isInteractive(e.target as Element) ? 1 : 0;
    };
    window.addEventListener("mouseover", onOver, { passive: true });

    const loop = () => {
      raf = requestAnimationFrame(loop);
      rx += (pointer.x - rx) * 0.18;
      ry += (pointer.y - ry) * 0.18;
      const targetScale = 1 + pointer.speed * 0.9 + hot * 0.8;
      scale += (targetScale - scale) * 0.15;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0) translate(-50%, -50%)`;
        dotRef.current.style.opacity = pointer.active ? "1" : "0";
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${scale})`;
        ringRef.current.style.opacity = pointer.active ? String(0.5 + hot * 0.5) : "0";
        ringRef.current.dataset.hot = hot ? "1" : "0";
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mouseover", onOver);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div className="cursor-field" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
