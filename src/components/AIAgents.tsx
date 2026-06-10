import { useState } from "react";
import { motion } from "framer-motion";
import { AGENTS, ACCENT_VAR, ACCENT_RGB } from "../data/system";
import { useInView } from "../hooks/useInView";
import { Icon } from "./Icon";
import "./AIAgents.css";

const AGENT_STATS = [
  { label: "Active Agents", value: "12" },
  { label: "Tasks Completed", value: "48K" },
  { label: "Success Rate", value: "97%" },
] as const;

const HEAD_IMG = "/assets/neural-head.png";

function NeuralHead() {
  return (
    <img
      className="agents__head"
      src={HEAD_IMG}
      alt=""
      draggable={false}
      aria-hidden="true"
    />
  );
}

export function AIAgents() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="section agents">
      <div className="container agents__grid" ref={ref}>
        <motion.div
          className={`agents__visual glass${hovered !== null ? " agents__visual--active" : ""}`}
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="agents__visual-fx" aria-hidden="true" />
          <div className="agents__visual-head">
            <div className="section-head agents__head-copy">
              <span className="kicker">Inside the machine</span>
              <h2 className="section-title">
                AI Agents
                <br />
                <span className="gradient-text">At Work</span>
              </h2>
              <p className="section-sub">
                Autonomous agents resolving tasks around the clock.
              </p>
            </div>
            <span className="agents__live mono">
              <span className="live-dot" /> LIVE
            </span>
          </div>
          <NeuralHead />
          <div className="agents__stats">
            {AGENT_STATS.map((stat, i) => (
              <div key={stat.label} className="agents__stat">
                {i > 0 && <span className="agents__stat-rule" aria-hidden="true" />}
                <span className="agents__stat-value">{stat.value}</span>
                <span className="agents__stat-label mono">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="agents__list">
          {AGENTS.map((a, i) => (
            <motion.button
              key={a.id}
              className={`agent ${hovered === a.id ? "is-active" : ""}`}
              style={
                {
                  "--accent": ACCENT_VAR[a.accent],
                  "--accent-rgb": ACCENT_RGB[a.accent],
                } as React.CSSProperties
              }
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.12 + i * 0.09 }}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(a.id)}
              onBlur={() => setHovered(null)}
            >
              <span className="agent__icon">
                <Icon name={a.icon} size={20} />
                <span className="agent__icon-ring" />
              </span>
              <span className="agent__body">
                <span className="agent__name">{a.name}</span>
                <span className="agent__role">{a.role}</span>
                <span className="agent__activity" aria-hidden="true">
                  <span
                    className="agent__activity-fill"
                    style={{ width: inView ? `${a.load}%` : "0%" }}
                  />
                </span>
              </span>
              <span className="agent__meta">
                <span className="agent__online mono">
                  <span className="agent__online-dot" /> ONLINE
                </span>
                <span className="agent__status mono">{a.status}</span>
                <span className="agent__load mono">{a.load}%</span>
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
