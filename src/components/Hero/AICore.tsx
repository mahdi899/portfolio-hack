import { motion } from "framer-motion";
import { useSystemState } from "../../state/useSystemState";

/**
 * The central AI core. Powers up through the boot sequence, and spins faster /
 * glows brighter while the system is "thinking" (a node is active).
 */
export function AICore() {
  const { bootPhase, activeNode, reducedMotion } = useSystemState();
  const thinking = activeNode !== null;
  const energized = bootPhase >= 3;
  const ringSpeed = reducedMotion ? 0 : thinking ? 1 : 0.45;

  return (
    <div className={`core ${energized ? "core--on" : ""} ${thinking ? "core--think" : ""}`}>
      <div className="core__halo" />

      <motion.div
        className="core__ring core__ring--a"
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 14 / (ringSpeed || 0.45), ease: "linear", repeat: Infinity }}
      />
      <motion.div
        className="core__ring core__ring--b"
        animate={reducedMotion ? {} : { rotate: -360 }}
        transition={{ duration: 22 / (ringSpeed || 0.45), ease: "linear", repeat: Infinity }}
      />
      <motion.div
        className="core__ring core__ring--c"
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 30 / (ringSpeed || 0.45), ease: "linear", repeat: Infinity }}
      />

      <div className="core__orbit">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className="core__electron"
            style={{ transform: `rotate(${i * 72}deg) translateX(74px)` }}
          />
        ))}
      </div>

      <motion.div
        className="core__sphere"
        animate={
          reducedMotion
            ? {}
            : { scale: thinking ? [1, 1.07, 1] : [1, 1.03, 1] }
        }
        transition={{ duration: thinking ? 1.1 : 2.4, ease: "easeInOut", repeat: Infinity }}
      >
        <span className="core__glyph">N</span>
        <span className="core__scan" />
      </motion.div>
    </div>
  );
}
