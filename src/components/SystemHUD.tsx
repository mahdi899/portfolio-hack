import { useEffect, useRef } from "react";
import { useSystemState } from "../state/useSystemState";
import "./SystemHUD.css";

function fmt(t: number) {
  const s = Math.floor(t % 60);
  const m = Math.floor((t / 60) % 60);
  const h = Math.floor(t / 3600);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(h)}:${p(m)}:${p(s)}`;
}

/**
 * Always-on operating-system chrome: corner brackets framing the viewport plus
 * live telemetry (uptime, scroll-as-system-charge, active module, profile).
 * Updated imperatively via rAF so it never forces React re-renders.
 */
export function SystemHUD() {
  const { hudLabel, activeNode, profile, booted, reducedMotion } = useSystemState();
  const clockRef = useRef<HTMLSpanElement | null>(null);
  const chargeNumRef = useRef<HTMLSpanElement | null>(null);
  const chargeBarRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const up = (performance.now() - start) / 1000;
      if (clockRef.current) clockRef.current.textContent = fmt(up);

      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const charge = max > 0 ? Math.min(100, Math.round((doc.scrollTop / max) * 100)) : 0;
      if (chargeNumRef.current) chargeNumRef.current.textContent = `${charge}%`;
      if (chargeBarRef.current) chargeBarRef.current.style.width = `${charge}%`;
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`hud ${booted ? "hud--on" : ""}`} aria-hidden="true">
      <span className="hud__corner hud__corner--tl" />
      <span className="hud__corner hud__corner--tr" />
      <span className="hud__corner hud__corner--bl" />
      <span className="hud__corner hud__corner--br" />

      <div className="hud__readout hud__readout--tl mono">
        <span className="hud__live">
          <span className={`hud__dot ${reducedMotion ? "" : "is-live"}`} /> NEXORA OS
        </span>
        <span className="hud__uptime">
          UPTIME <span ref={clockRef}>00:00:00</span>
        </span>
      </div>

      <div className="hud__readout hud__readout--tr mono">
        <span className="hud__profile">{profile.hudLabel}</span>
        <span className="hud__active">
          {activeNode ? `FOCUS // ${activeNode.toUpperCase()}` : "AUTONOMOUS"}
        </span>
      </div>

      <div className="hud__readout hud__readout--bl mono">
        <span className="hud__charge-label">
          SYSTEM CHARGE <span ref={chargeNumRef}>0%</span>
        </span>
        <span className="hud__charge">
          <span ref={chargeBarRef} className="hud__charge-fill" />
        </span>
      </div>

      <div className="hud__readout hud__readout--br mono">
        <span className="hud__status-line">{hudLabel}</span>
        <span className="hud__net">NEURAL LINK // STABLE</span>
      </div>
    </div>
  );
}
