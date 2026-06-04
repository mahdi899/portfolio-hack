import { useState } from "react";
import { motion } from "framer-motion";
import { PIPELINE, ACCENT_VAR, ACCENT_RGB } from "../data/system";
import { useInView } from "../hooks/useInView";
import { Icon } from "./Icon";
import "./GrowthPipeline.css";

export function GrowthPipeline() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="approach" className="section pipeline">
      <div className="container">
        <div className="section-head pipeline__head">
          <span className="kicker">Every system is unique</span>
          <h2 className="section-title">The Growth Pipeline</h2>
          <p className="section-sub">
            Hover the nodes to explore how the system moves attention to revenue.
          </p>
        </div>

        <div className="pipeline__rail" ref={ref}>
          <div className="pipeline__line">
            <motion.span
              className="pipeline__line-fill"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {PIPELINE.map((step, i) => (
            <motion.div
              key={step.id}
              className={`pipe ${hovered === step.id ? "is-active" : ""}`}
              style={
                {
                  "--accent": ACCENT_VAR[step.accent],
                  "--accent-rgb": ACCENT_RGB[step.accent],
                } as React.CSSProperties
              }
              initial={{ opacity: 0, y: 26 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 + i * 0.18, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => setHovered(step.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="pipe__index mono">{step.index}</span>
              <div className="pipe__hex">
                <div className="pipe__hex-inner">
                  <Icon name={step.icon} size={26} />
                </div>
              </div>
              <span className="pipe__label">{step.label}</span>
              <span className="pipe__source mono">{step.source}</span>

              <motion.div
                className="pipe__panel"
                initial={false}
                animate={
                  hovered === step.id
                    ? { opacity: 1, y: 0, pointerEvents: "auto" }
                    : { opacity: 0, y: 10, pointerEvents: "none" }
                }
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="pipe__panel-title mono">
                  {step.label} // {step.source}
                </span>
                <ul>
                  {step.bullets.map((b) => (
                    <li key={b} className="mono">
                      <i /> {b}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
