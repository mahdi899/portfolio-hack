import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PIPELINE, ACCENT_VAR, ACCENT_RGB } from "../data/system";
import { useInView } from "../hooks/useInView";
import { Icon } from "./Icon";
import "./GrowthPipeline.css";

export function GrowthPipeline() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const [activeId, setActiveId] = useState(PIPELINE[0].id);
  const active = PIPELINE.find((s) => s.id === activeId) ?? PIPELINE[0];

  return (
    <section id="approach" className="section pipeline">
      <div className="container">
        <div className="section-head pipeline__head">
          <span className="kicker">Every system is unique</span>
          <h2 className="section-title">The Growth Pipeline</h2>
          <p className="section-sub">
            Five interconnected modules. One machine. Hover a node to inspect the layer.
          </p>
        </div>

        <div className="pipeline__console glass" ref={ref}>
          <div className="pipeline__console-bar mono">
            <span>PIPELINE // LIVE</span>
            <span className="pipeline__console-bar-right">
              <span className="live-dot" /> DATA FLOW ACTIVE
            </span>
          </div>

          <div className="pipeline__rail">
            <div className="pipeline__line" aria-hidden="true">
              <motion.span
                className="pipeline__line-fill"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>

            {PIPELINE.map((step, i) => {
              const isActive = activeId === step.id;
              return (
                <motion.div
                  key={step.id}
                  className={`pipe ${isActive ? "is-active" : ""}`}
                  style={
                    {
                      "--accent": ACCENT_VAR[step.accent],
                      "--accent-rgb": ACCENT_RGB[step.accent],
                    } as React.CSSProperties
                  }
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.45,
                    delay: 0.2 + i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onMouseEnter={() => setActiveId(step.id)}
                  onFocus={() => setActiveId(step.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isActive}
                >
                  {i > 0 && <span className="pipe__arrow mono" aria-hidden="true">→</span>}
                  <span className="pipe__index mono">{step.index}</span>
                  <div className="pipe__hex">
                    <div className="pipe__hex-inner">
                      <Icon name={step.icon} size={24} />
                    </div>
                    {isActive && <span className="pipe__hex-pulse" />}
                  </div>
                  <span className="pipe__label">{step.label}</span>
                  <span className="pipe__source mono">{step.source}</span>
                </motion.div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              className="pipeline__hud"
              style={
                {
                  "--accent": ACCENT_VAR[active.accent],
                  "--accent-rgb": ACCENT_RGB[active.accent],
                } as React.CSSProperties
              }
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="pipeline__hud-head">
                <span className="pipeline__hud-tag mono">
                  MODULE {active.index}
                </span>
                <span className="pipeline__hud-title">
                  {active.label}
                  <em>// {active.source}</em>
                </span>
              </div>
              <ul className="pipeline__hud-list">
                {active.bullets.map((b) => (
                  <li key={b} className="mono">
                    <i /> {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
