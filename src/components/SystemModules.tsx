import { useRef } from "react";
import { motion } from "framer-motion";
import { MODULES, ACCENT_VAR, ACCENT_RGB, type ModuleDef } from "../data/system";
import { useInView } from "../hooks/useInView";
import { useSystemState } from "../state/useSystemState";
import { Icon } from "./Icon";
import "./SystemModules.css";

function ModuleCard({ m, index, inView }: { m: ModuleDef; index: number; inView: boolean }) {
  const { reducedMotion } = useSystemState();
  const ref = useRef<HTMLDivElement | null>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || reducedMotion) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${(0.5 - py) * 10}deg`);
    el.style.setProperty("--ry", `${(px - 0.5) * 12}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.article
      ref={ref}
      className="module neon-edge"
      style={
        {
          "--accent": ACCENT_VAR[m.accent],
          "--accent-rgb": ACCENT_RGB[m.accent],
          "--float-delay": `${index * 0.5}s`,
        } as React.CSSProperties
      }
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span className="module__light" />
      <span className="module__glow" />
      <span className="module__burst" aria-hidden="true">
        {Array.from({ length: 8 }).map((_, i) => (
          <i key={i} style={{ ["--a" as string]: `${i * 45}deg` }} />
        ))}
      </span>
      <span className="module__num mono">0{index + 1}</span>
      <span className="module__icon">
        <Icon name={m.icon} size={24} />
      </span>
      <h3 className="module__title">{m.title}</h3>
      <p className="module__desc">{m.desc}</p>
      <span className="module__bar" />
    </motion.article>
  );
}

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
            <ModuleCard key={m.id} m={m} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
