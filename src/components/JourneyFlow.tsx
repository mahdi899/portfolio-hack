import { motion } from "framer-motion";
import { JOURNEY, ACCENT_VAR, ACCENT_RGB } from "../data/system";
import { useInView } from "../hooks/useInView";
import { Icon } from "./Icon";
import "./JourneyFlow.css";

export function JourneyFlow() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section id="outcomes" className="section journey">
      <div className="container">
        <div className="section-head journey__head">
          <span className="kicker">A glimpse of the flow</span>
          <h2 className="section-title">Explore the Journey</h2>
          <p className="section-sub">
            From a stranger's attention to predictable, repeatable revenue.
          </p>
        </div>

        <div className="journey__rail" ref={ref}>
          <div className="journey__track">
            <motion.span
              className="journey__track-fill"
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            />
            {inView && <span className="journey__pulse" />}
          </div>

          {JOURNEY.map((step, i) => (
            <motion.div
              key={step.id}
              className="jstep"
              style={
                {
                  "--accent": ACCENT_VAR[step.accent],
                  "--accent-rgb": ACCENT_RGB[step.accent],
                } as React.CSSProperties
              }
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.14 }}
            >
              <span className="jstep__ring">
                <span className="jstep__icon">
                  <Icon name={step.icon} size={22} />
                </span>
              </span>
              <span className="jstep__label">{step.label}</span>
              <span className="jstep__caption mono">{step.caption}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
