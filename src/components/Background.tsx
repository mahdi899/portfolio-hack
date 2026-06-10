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
const BG = "#05060a";

interface BackgroundProps {
  /** When WebGL is active the 2D canvas is a transparent overlay; otherwise it is the opaque base. */
  overlay?: boolean;
}

/**
 * Deep-layer canvas: drifting particle/nebula field with subtle constellation
 * links and gentle mouse parallax + repulsion. Single rAF loop, capped DPR,
 * pauses when the tab is hidden.
 */
export function Background({ overlay = false }: BackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { reducedMotion } = useSystemState();
  const reducedRef = useRef(reducedMotion);
  const overlayRef = useRef(overlay);
  reducedRef.current = reducedMotion;
  overlayRef.current = overlay;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: overlay });
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
      if (running) requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    const drawNebula = (t: number) => {
      const mx = (mouse.x / w - 0.5) * 80;
      const my = (mouse.y / h - 0.5) * 60;
      const blobs = [
        { x: w * 0.15, y: h * 0.2, r: w * 0.35, hue: 268 },
        { x: w * 0.85, y: h * 0.25, r: w * 0.3, hue: 199 },
        { x: w * 0.7, y: h * 0.8, r: w * 0.28, hue: 162 },
      ];
      for (const b of blobs) {
        const ox = Math.sin(t * 0.0003 + b.hue) * 30 + mx * 0.4;
        const oy = Math.cos(t * 0.00025 + b.hue) * 20 + my * 0.4;
        const g = ctx.createRadialGradient(b.x + ox, b.y + oy, 0, b.x + ox, b.y + oy, b.r);
        g.addColorStop(0, `hsla(${b.hue}, 80%, 55%, 0.14)`);
        g.addColorStop(0.5, `hsla(${b.hue}, 70%, 45%, 0.06)`);
        g.addColorStop(1, "hsla(0,0%,0%,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }
    };

    const loop = (t: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);

      if (overlayRef.current) {
        ctx.clearRect(0, 0, w, h);
      } else {
        ctx.fillStyle = BG;
        ctx.fillRect(0, 0, w, h);
      }

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      const still = reducedRef.current;

      if (!still) drawNebula(t);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!still) {
          p.x += p.vx * (0.4 + p.depth);
          p.y += p.vy * (0.4 + p.depth);

          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 32000) {
            const f = (32000 - dist2) / 32000;
            const d = Math.sqrt(dist2) || 1;
            const attract = f > 0.55;
            if (attract) {
              p.x -= (dx / d) * f * 2.2;
              p.y -= (dy / d) * f * 2.2;
            } else {
              p.x += (dx / d) * f * 1.2;
              p.y += (dy / d) * f * 1.2;
            }
            p.r = Math.min(3.2, p.r + f * 0.04);
          } else {
            p.r += (p.depth * 1.8 + 0.6 - p.r) * 0.02;
          }
        }

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        const alpha = 0.12 + p.depth * 0.5;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 2.2);
        grad.addColorStop(0, `hsla(${p.hue}, 95%, 78%, ${alpha})`);
        grad.addColorStop(0.4, `hsla(${p.hue}, 90%, 60%, ${alpha * 0.5})`);
        grad.addColorStop(1, `hsla(${p.hue}, 80%, 50%, 0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

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

    requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [overlay]);

  return (
    <>
      <div className="bg-grid" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        className={`bg-canvas${overlay ? " bg-canvas--overlay" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}
