import { useEffect, useRef, useState } from "react";
import { journey, fade, HoverInfo } from "../journey/store";

const RAIL_NODES = [
  { t: 0.0, label: "ARRIVAL" },
  { t: 0.24, label: "TRAFFIC" },
  { t: 0.48, label: "AUTOMATION" },
  { t: 0.68, label: "REVENUE" },
  { t: 0.95, label: "ACTIVATION" },
];

export default function Overlay() {
  const s1 = useRef<HTMLElement>(null);
  const s2 = useRef<HTMLElement>(null);
  const s3 = useRef<HTMLElement>(null);
  const s4 = useRef<HTMLElement>(null);
  const s5 = useRef<HTMLElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const railFill = useRef<HTMLDivElement>(null);
  const railRoot = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<HoverInfo>(null);
  const lastHover = useRef<string | null>(null);

  useEffect(() => {
    let raf = 0;

    const apply = (el: HTMLElement | null, o: number, shift = 26) => {
      if (!el) return;
      el.style.opacity = String(o);
      el.style.transform = `translate3d(0, ${(1 - o) * shift}px, 0)`;
      el.style.pointerEvents = o > 0.5 ? "auto" : "none";
    };

    const tick = () => {
      const p = journey.smooth;

      apply(s1.current, fade(p, -1, 0, 0.05, 0.13), -40);
      apply(s2.current, fade(p, 0.16, 0.22, 0.31, 0.37));
      apply(s3.current, fade(p, 0.4, 0.46, 0.53, 0.59));
      apply(s4.current, fade(p, 0.6, 0.66, 0.74, 0.8));
      apply(s5.current, fade(p, 0.86, 0.94, 2, 3));

      if (cue.current) cue.current.style.opacity = String(Math.max(0, 1 - p * 12));
      if (railFill.current) railFill.current.style.height = `${p * 100}%`;
      if (railRoot.current) {
        const nodes = railRoot.current.querySelectorAll<HTMLElement>(".rail-node");
        nodes.forEach((node, i) => {
          node.classList.toggle("on", p >= RAIL_NODES[i].t - 0.02);
        });
      }

      const name = journey.hovered?.name ?? null;
      if (name !== lastHover.current) {
        lastHover.current = name;
        setHover(journey.hovered);
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="overlay">
      <header className="hud-top">
        <div className="brand">
          NEXORA<span>///</span>
        </div>
        <div className="status">
          <i />
          SYSTEM ONLINE
        </div>
      </header>

      <div className="rail" ref={railRoot}>
        <div className="rail-track">
          <div className="rail-fill" ref={railFill} />
        </div>
        {RAIL_NODES.map((n) => (
          <div key={n.label} className="rail-node" style={{ top: `${n.t * 100}%` }}>
            <i />
            <span>{n.label}</span>
          </div>
        ))}
      </div>

      {/* SCENE 01 — ARRIVAL */}
      <section ref={s1} className="scene scene-center">
        <p className="kicker">AI × AUTOMATION × GROWTH</p>
        <h1>
          Building Intelligent
          <br />
          <em>Growth Systems</em>
        </h1>
        <p className="sub">Turning attention into automated revenue.</p>
      </section>

      {/* SCENE 02 — TRAFFIC ORBIT */}
      <section ref={s2} className="scene scene-left">
        <p className="orbit-index" style={{ color: "#a855f7" }}>
          ORBIT 01
        </p>
        <h2>Traffic Layer</h2>
        <p className="sub">Attention enters the system.</p>
        <p className="bodies">Instagram · Google Ads · TikTok · Content Engine</p>
      </section>

      {/* SCENE 03 — AUTOMATION ORBIT */}
      <section ref={s3} className="scene scene-right">
        <p className="orbit-index" style={{ color: "#22d3ee" }}>
          ORBIT 02
        </p>
        <h2>Automation Layer</h2>
        <p className="sub">Intelligence nurtures every signal.</p>
        <p className="bodies">AI Agents · Telegram · CRM · Email Automation</p>
      </section>

      {/* SCENE 04 — REVENUE ORBIT */}
      <section ref={s4} className="scene scene-left">
        <p className="orbit-index" style={{ color: "#f471c8" }}>
          ORBIT 03
        </p>
        <h2>Revenue Layer</h2>
        <p className="sub">Intent becomes income.</p>
        <p className="bodies">Sales Pipeline · Appointment Setter · Conversion Engine · Revenue Planet</p>
      </section>

      {/* SCENE 05 — SYSTEM ACTIVATION */}
      <section ref={s5} className="scene scene-center scene-final">
        <p className="kicker">SYSTEM FULLY ACTIVE</p>
        <h2>
          Traffic In. <em>Revenue Out.</em>
        </h2>
        <p className="sub">An intelligent galaxy, engineered to convert. On autopilot.</p>
        <a className="cta" href="mailto:hello@nexora.systems">
          DESIGN YOUR SYSTEM
          <span className="cta-arrow">↗</span>
        </a>
      </section>

      <div ref={cue} className="scroll-cue">
        <span>SCROLL TO ENTER THE SYSTEM</span>
        <i />
      </div>

      <div className={`hover-panel${hover ? " on" : ""}`}>
        {hover && (
          <>
            <p className="hover-layer">{hover.layer}</p>
            <p className="hover-name">{hover.name}</p>
            <p className="hover-detail">{hover.detail}</p>
          </>
        )}
      </div>

      <footer className="hud-bottom">
        <span>© 2026 NEXORA SYSTEMS</span>
        <span>TURNING ATTENTION INTO AUTOMATED REVENUE</span>
      </footer>
    </div>
  );
}
