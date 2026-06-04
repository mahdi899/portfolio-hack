import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { useSystemState } from "../state/useSystemState";
import { Icon } from "./Icon";
import "./FinalCTA.css";

export function FinalCTA() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const { triggerLock } = useSystemState();

  return (
    <section className="section cta">
      <div className="container cta__grid" ref={ref}>
        <motion.div
          className="cta__copy"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="kicker">Initialize</span>
          <h2 className="cta__title">
            READY TO BUILD
            <br />
            <span className="gradient-text">YOUR SYSTEM?</span>
          </h2>
          <p className="cta__sub">Let's design your growth architecture.</p>
          <div className="cta__actions">
            <button className="btn cta__btn" onClick={triggerLock}>
              Request Your System
              <Icon name="arrow" size={16} className="arrow" />
            </button>
            <button className="cta__ghost mono" onClick={triggerLock}>
              <span className="live-dot" /> Enter your business
            </button>
          </div>
        </motion.div>

        <motion.div
          className="cta__glyph"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <span className="cta__glyph-halo" />
          <span className="cta__glyph-ring" />
          <span className="cta__glyph-mark">N</span>
        </motion.div>
      </div>
    </section>
  );
}
