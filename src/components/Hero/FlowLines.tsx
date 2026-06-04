import { useEffect, useRef } from "react";
import { SYSTEM_NODES, ACCENT_RGB } from "../../data/system";
import { useSystemState } from "../../state/useSystemState";

const INBOUND = new Set(["instagram", "tiktok", "website", "ai"]);

interface RenderState {
  activePath: string[];
  hasActive: boolean;
  reduced: boolean;
  bootPhase: number;
}

/**
 * Canvas of energy connections between the core and every node. Lines pulse,
 * flow, and re-route: when a node is active, off-path lines fade while on-path
 * lines thicken, speed up and carry a traveling lead pulse toward revenue.
 */
export function FlowLines() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const { activePath, activeNode, reducedMotion, bootPhase } = useSystemState();

  const state = useRef<RenderState>({
    activePath: [],
    hasActive: false,
    reduced: reducedMotion,
    bootPhase,
  });
  state.current = {
    activePath,
    hasActive: activeNode !== null,
    reduced: reducedMotion,
    bootPhase,
  };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    let t = 0;
    let raf = 0;

    const quadPoint = (
      x0: number,
      y0: number,
      cx: number,
      cy: number,
      x1: number,
      y1: number,
      p: number
    ) => {
      const mt = 1 - p;
      return {
        x: mt * mt * x0 + 2 * mt * p * cx + p * p * x1,
        y: mt * mt * y0 + 2 * mt * p * cy + p * p * y1,
      };
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const s = state.current;
      t += s.reduced ? 0 : 1;
      ctx.clearRect(0, 0, w, h);

      const coreX = w * 0.5;
      const coreY = h * 0.5;
      const bootReveal = Math.min(1, s.bootPhase / 4);

      for (const node of SYSTEM_NODES) {
        const nx = (node.x / 100) * w;
        const ny = (node.y / 100) * h;
        const inbound = INBOUND.has(node.id);
        const sx = inbound ? nx : coreX;
        const sy = inbound ? ny : coreY;
        const ex = inbound ? coreX : nx;
        const ey = inbound ? coreY : ny;

        // control point bows the line for an organic curve
        const mx = (sx + ex) / 2;
        const my = (sy + ey) / 2;
        const bow = 26;
        const cx = mx + (sy - ey) * 0.12;
        const cy = my + (ex - sx) * 0.12 + Math.sin(t * 0.02 + node.x) * (s.reduced ? 0 : 4);
        void bow;

        const onPath = s.activePath.includes(node.id);
        const dim = s.hasActive && !onPath;
        const rgb = ACCENT_RGB[node.accent];

        const baseAlpha = (dim ? 0.06 : onPath ? 0.55 : 0.22) * bootReveal;
        const pulse = s.reduced ? 0.85 : 0.7 + Math.sin(t * 0.05 + node.y) * 0.3;

        ctx.lineCap = "round";
        ctx.lineWidth = onPath ? 2.4 : 1.1;
        ctx.strokeStyle = `rgba(${rgb}, ${baseAlpha * pulse})`;
        ctx.shadowBlur = onPath ? 14 : 0;
        ctx.shadowColor = `rgba(${rgb}, ${onPath ? 0.8 : 0})`;

        const speed = onPath ? 0.9 : 0.35;
        ctx.setLineDash([4, 14]);
        ctx.lineDashOffset = -t * speed;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cx, cy, ex, ey);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // traveling lead pulse on active-path lines
        if (onPath && !s.reduced) {
          const p = (t * 0.004 + node.y * 0.01) % 1;
          const pt = quadPoint(sx, sy, cx, cy, ex, ey, p);
          const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 9);
          grd.addColorStop(0, `rgba(${rgb}, 0.95)`);
          grd.addColorStop(1, `rgba(${rgb}, 0)`);
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} className="flow-canvas" aria-hidden="true" />;
}
