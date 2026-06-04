import { useEffect, useRef } from "react";
import { useSystemState } from "../state/useSystemState";
import "./Background.css";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  depth: number;
}

const HUES = [268, 199, 162]; // purple, blue, green

/**
 * Deep-layer canvas: drifting particle/nebula field with subtle constellation
 * links and gentle mouse parallax + repulsion. Single rAF loop, capped DPR,
 * pauses when the tab is hidden.
 */
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reducedMotion } = useSystemState();
  const reducedRef = useRef(reducedMotion);
  reducedRef.current = reducedMotion;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(120, Math.floor((w * h) / 14000));
      particles = Array.from({ length: count }, () => {
        const depth = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 0.6 + depth * 1.8,
          hue: HUES[Math.floor(Math.random() * HUES.length)],
          depth,
        };
      });
    };

    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    const onMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let raf = 0;
    let running = true;
    const onVis = () => {
      running = !document.hidden;
      if (running) loop();
    };
    document.addEventListener("visibilitychange", onVis);

    const loop = () => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, w, h);

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      const still = reducedRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!still) {
          p.x += p.vx * (0.4 + p.depth);
          p.y += p.vy * (0.4 + p.depth);

          // gentle repulsion from cursor
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 18000) {
            const f = (18000 - dist2) / 18000;
            const d = Math.sqrt(dist2) || 1;
            p.x += (dx / d) * f * 1.4;
            p.y += (dy / d) * f * 1.4;
          }
        }

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const alpha = 0.15 + p.depth * 0.45;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 90%, 68%, ${alpha})`;
        ctx.shadowBlur = 8 * p.depth;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 60%, 0.6)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // constellation links
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 13000) {
            const o = (1 - d2 / 13000) * 0.16;
            ctx.strokeStyle = `hsla(${a.hue}, 90%, 65%, ${o})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
    };

    loop();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
      <canvas ref={canvasRef} className="bg-canvas" aria-hidden="true" />
    </>
  );
}
