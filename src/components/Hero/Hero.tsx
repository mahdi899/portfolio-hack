import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { SYSTEM_NODES } from "../../data/system";
import { useSystemState } from "../../state/useSystemState";
import { Icon } from "../Icon";
import { AICore } from "./AICore";
import { SystemNode } from "./SystemNode";
import { FlowLines } from "./FlowLines";
import { ProfileSwitcher } from "../ProfileSwitcher";
import { GhostRun } from "../GhostRun";
import "./Hero.css";

export function Hero() {
  const { booted, hudLabel, triggerLock, reducedMotion } = useSystemState();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const midRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);

  // ref-based parallax (no per-frame React re-render)
  useEffect(() => {
    if (reducedMotion) return;
    let frame: number | null = null;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };

    const onMove = (e: MouseEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
      if (frame === null) frame = requestAnimationFrame(tick);
    };
    const tick = () => {
      frame = null;
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      if (midRef.current)
        midRef.current.style.transform = `translate3d(${cur.x * 14}px, ${cur.y * 14}px, 0)`;
      if (coreRef.current)
        coreRef.current.style.transform = `translate3d(${cur.x * 26}px, ${cur.y * 26}px, 0)`;
      if (Math.abs(target.x - cur.x) > 0.001 || Math.abs(target.y - cur.y) > 0.001)
        frame = requestAnimationFrame(tick);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <section id="top" className="hero">
      <div id="system" className="hero__grid container">
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={booted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <span className="kicker">AI &times; AUTOMATION &times; GROWTH</span>
          <h1 className="hero__title">
            I DESIGN
            <br />
            AUTONOMOUS
            <br />
            <span className="gradient-text">GROWTH SYSTEMS</span>
          </h1>
          <p className="hero__lead">
            AI-powered architectures that turn attention into revenue. On
            autopilot.
          </p>
          <div className="hero__actions">
            <button className="btn hero__cta" onClick={triggerLock}>
              Design Your System
              <Icon name="arrow" size={15} className="arrow" />
            </button>
          </div>
          <span className="hero__note mono">No templates. 100% custom.</span>
        </motion.div>

        <div className="hero__visual">
          <ProfileSwitcher />

          <div className="hero__stage glass" ref={stageRef}>
          <div className="hero__stage-frame" aria-hidden="true">
            <span className="hero__tick hero__tick--tl" />
            <span className="hero__tick hero__tick--tr" />
            <span className="hero__tick hero__tick--bl" />
            <span className="hero__tick hero__tick--br" />
            <span className="hero__axis hero__axis--left mono">INPUTS // SOURCES</span>
            <span className="hero__axis hero__axis--right mono">OUTPUT // REVENUE</span>
          </div>
          <div className="hero__hud mono">
            <span className="hero__hud-dot" />
            {hudLabel}
          </div>

          <div className="hero__layer hero__layer--lines">
            <FlowLines />
          </div>

          <div className="hero__layer hero__layer--nodes" ref={midRef}>
            {SYSTEM_NODES.map((n, i) => (
              <SystemNode key={n.id} node={n} delay={0.05 * i} />
            ))}
          </div>

          <div className="hero__layer hero__layer--core" ref={coreRef}>
            <AICore />
          </div>

          <GhostRun />

          <div className="hero__silhouette" aria-hidden="true" />

          <div className="hero__status mono">
            <span className="hero__status-label">SYSTEM STATUS</span>
            <span className="hero__status-value">
              <span className="live-dot" /> ALL SYSTEMS OPERATIONAL
            </span>
          </div>
          </div>
        </div>
      </div>

      <div className="hero__scroll mono">
        <span>SCROLL TO EXPAND SYSTEM</span>
        <span className="hero__scroll-line" />
      </div>
    </section>
  );
}
