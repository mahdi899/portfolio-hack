import { AnimatePresence, motion } from "framer-motion";
import { useSystemState } from "../state/useSystemState";
import { Icon } from "./Icon";
import "./CTAOverlay.css";

export function CTAOverlay() {
  const { ctaPhase, resetCta } = useSystemState();
  const open = ctaPhase !== "idle";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="ctao"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="ctao__zoom"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ctao__core">
              <span className="ctao__core-glyph">N</span>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="ctao__beam"
                  style={{ transform: `rotate(${i * 60}deg)` }}
                />
              ))}
              <span className="ctao__ring" />
            </div>

            <AnimatePresence mode="wait">
              {ctaPhase === "locking" ? (
                <motion.div
                  key="locking"
                  className="ctao__status mono"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="ctao__line">ESTABLISHING SECURE LINK</span>
                  <span className="ctao__line ctao__line--dim">
                    ROUTING ATTENTION &rarr; AI &rarr; REVENUE
                  </span>
                  <div className="ctao__loader">
                    <span />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="locked"
                  className="ctao__granted"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <span className="ctao__locked mono">SYSTEM LOCKED IN</span>
                  <h3 className="ctao__granted-title">ACCESS GRANTED</h3>
                  <p className="ctao__granted-text">
                    Your growth architecture is ready to be designed. Open a
                    channel and we'll plug your business into the system.
                  </p>
                  <div className="ctao__granted-actions">
                    <a
                      className="btn"
                      href="mailto:architect@nexora.systems?subject=Design%20My%20Growth%20System"
                    >
                      Open Channel
                      <Icon name="arrow" size={15} className="arrow" />
                    </a>
                    <button className="ctao__close mono" onClick={resetCta}>
                      Close
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
