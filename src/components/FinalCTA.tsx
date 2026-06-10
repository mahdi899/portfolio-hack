import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import { useSystemState } from "../state/useSystemState";
import { Icon } from "./Icon";
import "./FinalCTA.css";

const COMMAND = "nexora init --architecture=autonomous --scale=on";

export function FinalCTA() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });
  const { triggerLock, reducedMotion } = useSystemState();
  const [typed, setTyped] = useState(reducedMotion ? COMMAND : "");

  useEffect(() => {
    if (reducedMotion || !inView) return;
    let i = 0;
    setTyped("");
    const id = window.setInterval(() => {
      i += 1;
      setTyped(COMMAND.slice(0, i));
      if (i >= COMMAND.length) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [inView, reducedMotion]);

  return (
    <section className="section cta">
      <div className="container cta__grid" ref={ref}>
        <motion.div
          className="cta__terminal glass-strong"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="cta__terminal-bar mono">
            <span className="cta__terminal-dots">
              <i /> <i /> <i />
            </span>
            <span>ACTIVATION TERMINAL</span>
            <span className="cta__terminal-live">
              <span className="live-dot" /> READY
            </span>
          </div>

          <div className="cta__terminal-body">
            <span className="kicker">Initialize</span>
            <h2 className="cta__title">
              READY TO BUILD
              <br />
              <span className="gradient-text">YOUR SYSTEM?</span>
            </h2>

            <p className="cta__prompt mono">
              <span className="cta__prompt-user">root@nexora</span>:~$ {typed}
              <span className="cta__caret" />
            </p>

            <p className="cta__sub">
              One command away from an autonomous growth machine.
            </p>

            <div className="cta__actions">
              <button className="btn cta__btn" onClick={triggerLock}>
                Initialize System
                <Icon name="bolt" size={16} className="arrow" />
              </button>
              <button className="cta__ghost mono" onClick={triggerLock}>
                <Icon name="arrow" size={14} /> Start Architecture Session
              </button>
            </div>
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
          <span className="cta__glyph-ring cta__glyph-ring--2" />
          <span className="cta__glyph-mark">N</span>
        </motion.div>
      </div>
    </section>
  );
}
