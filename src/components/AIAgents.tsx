import { useState } from "react";
import { motion } from "framer-motion";
import { AGENTS, ACCENT_VAR, ACCENT_RGB } from "../data/system";
import { useInView } from "../hooks/useInView";
import { Icon } from "./Icon";
import "./AIAgents.css";

function NeuralHead({ active }: { active: boolean }) {
  const dots = [
    [128, 70],
    [150, 95],
    [110, 110],
    [140, 130],
    [98, 150],
    [132, 165],
    [120, 90],
    [160, 120],
  ];
  return (
    <svg className="agents__head" viewBox="0 0 240 260" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="headStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a855f7" />
          <stop offset="0.5" stopColor="#38bdf8" />
          <stop offset="1" stopColor="#22e3a3" />
        </linearGradient>
        <radialGradient id="headGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="rgba(168,85,247,0.4)" />
          <stop offset="1" stopColor="rgba(168,85,247,0)" />
        </radialGradient>
      </defs>

      <circle cx="120" cy="120" r="100" fill="url(#headGlow)" />

      {/* stylized profile */}
      <path
        d="M85 220c-6-26-22-34-30-58-12-36 6-86 50-98 46-13 92 16 96 64 2 26-10 40-12 58-1 10 6 14 6 24 0 8-8 10-8 10"
        stroke="url(#headStroke)"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M150 150c-10 4-20 4-30 0"
        stroke="url(#headStroke)"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* neural mesh */}
      {dots.map(([x, y], i) => (
        <g key={i}>
          {i < dots.length - 1 && (
            <line
              x1={x}
              y1={y}
              x2={dots[i + 1][0]}
              y2={dots[i + 1][1]}
              stroke="url(#headStroke)"
              strokeWidth="0.8"
              opacity={active ? 0.5 : 0.25}
            />
          )}
          <motion.circle
            cx={x}
            cy={y}
            r={2.4}
            fill="#7dd3fc"
            animate={{ opacity: [0.3, 1, 0.3], r: [2, 3, 2] }}
            transition={{ duration: 2 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: "drop-shadow(0 0 5px #38bdf8)" }}
          />
        </g>
      ))}
    </svg>
  );
}

export function AIAgents() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="section agents">
      <div className="container agents__grid" ref={ref}>
        <motion.div
          className="agents__visual glass"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="agents__visual-head">
            <div className="section-head agents__head-copy">
              <span className="kicker">Inside the machine</span>
              <h2 className="section-title">AI Agents<br />At Work</h2>
              <p className="section-sub">Hover to peek inside the system.</p>
            </div>
            <span className="agents__live mono">
              <span className="live-dot" /> LIVE
            </span>
          </div>
          <NeuralHead active={hovered !== null} />
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
              transition={{ duration: 0.5, delay: 0.15 + i * 0.12 }}
              onMouseEnter={() => setHovered(a.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(a.id)}
              onBlur={() => setHovered(null)}
            >
              <span className="agent__icon">
                <Icon name={a.icon} size={20} />
              </span>
              <span className="agent__body">
                <span className="agent__name">{a.name}</span>
                <span className="agent__role">{a.role}</span>
              </span>
              <span className="agent__status mono">
                <span className="agent__status-dot" />
                {a.status}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
