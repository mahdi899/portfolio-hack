import { motion } from "framer-motion";
import { MODULES, ACCENT_VAR, ACCENT_RGB } from "../data/system";
import { useInView } from "../hooks/useInView";
import { Icon } from "./Icon";
import "./SystemModules.css";

export function SystemModules() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section id="modules" className="section modules">
      <div className="container">
        <div className="section-head modules__head">
          <span className="kicker">What my systems do</span>
          <h2 className="section-title">System Modules</h2>
          <p className="section-sub">
            Independent modules that interlock into one autonomous machine.
          </p>
        </div>

        <div className="modules__grid" ref={ref}>
          {MODULES.map((m, i) => (
            <motion.article
              key={m.id}
              className="module"
              style={
                {
                  "--accent": ACCENT_VAR[m.accent],
                  "--accent-rgb": ACCENT_RGB[m.accent],
                } as React.CSSProperties
              }
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="module__glow" />
              <span className="module__num mono">0{i + 1}</span>
              <span className="module__icon">
                <Icon name={m.icon} size={24} />
              </span>
              <h3 className="module__title">{m.title}</h3>
              <p className="module__desc">{m.desc}</p>
              <span className="module__bar" />
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
