import { useState } from "react";
import { motion } from "framer-motion";
import { JOURNEY, ACCENT_VAR, ACCENT_RGB } from "../data/system";
import { useInView } from "../hooks/useInView";
import { Icon } from "./Icon";
import "./JourneyFlow.css";

export function JourneyFlow() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.25 });
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section id="outcomes" className="section journey">
      <div className="container">
        <div className="section-head journey__head">
          <span className="kicker">A glimpse of the flow</span>
          <h2 className="section-title">Explore the Journey</h2>
          <p className="section-sub">
            Six stages. One continuous path from attention to scale.
          </p>
        </div>

        <div className="journey__console glass" ref={ref}>
          <div className="journey__console-bar mono">
            <span>FLOW MAP // END-TO-END</span>
            <span>ATTRACT → SCALE</span>
          </div>

          <div className="journey__rail">
            <div className="journey__track" aria-hidden="true">
              <motion.span
                className="journey__track-fill"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : {}}
                transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              />
              {inView && <span className="journey__pulse" />}
            </div>

            {JOURNEY.map((step, i) => {
              const lit = hovered === step.id || (hovered === null && inView);
              return (
                <motion.div
                  key={step.id}
                  className={`jstep ${hovered === step.id ? "is-active" : ""}`}
                  style={
                    {
                      "--accent": ACCENT_VAR[step.accent],
                      "--accent-rgb": ACCENT_RGB[step.accent],
                    } as React.CSSProperties
                  }
                  initial={{ opacity: 0, y: 18 }}
                  animate={inView ? { opacity: lit ? 1 : 0.75, y: 0 } : {}}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.1 }}
                  onMouseEnter={() => setHovered(step.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {i > 0 && (
                    <span className="jstep__connector" aria-hidden="true">
                      <span className="jstep__connector-line" />
                      <span className="jstep__connector-chev">›</span>
                    </span>
                  )}
                  <span className="jstep__num mono">0{i + 1}</span>
                  <span className="jstep__ring">
                    <span className="jstep__icon">
                      <Icon name={step.icon} size={20} />
                    </span>
                  </span>
                  <span className="jstep__label">{step.label}</span>
                  <span className="jstep__caption mono">{step.caption}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
