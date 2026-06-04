import { AnimatePresence, motion } from "framer-motion";
import { useSystemState } from "../state/useSystemState";
import "./Preloader.css";

const LINES = [
  "BOOTING NEXORA KERNEL",
  "CALIBRATING AI CORE",
  "IGNITING NEURAL RINGS",
  "LINKING SYSTEM NODES",
  "ALL SYSTEMS OPERATIONAL",
];

export function Preloader() {
  const { bootPhase, booted } = useSystemState();
  const pct = Math.min(100, Math.round((bootPhase / 5) * 100));

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(12px)" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="preloader__core">
            <span className="preloader__glyph">N</span>
            <span className="preloader__ring" />
            <span className="preloader__ring preloader__ring--2" />
          </div>

          <div className="preloader__readout mono">
            <span className="preloader__status">
              {LINES[Math.max(0, bootPhase - 1)] ?? LINES[0]}
            </span>
            <span className="preloader__pct">{pct}%</span>
          </div>

          <div className="preloader__bar">
            <motion.span
              className="preloader__fill"
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <span className="preloader__hint mono">NEXORA // GROWTH SYSTEM</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
