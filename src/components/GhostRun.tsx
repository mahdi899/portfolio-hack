import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSystemState } from "../state/useSystemState";
import { NODE_BY_ID } from "../data/system";
import "./GhostRun.css";

const STAGE_MS = 850;

/**
 * Autonomous idle demo: when the user stops interacting, the system "runs
 * itself" - a lead travels input -> AI -> nurture -> close -> revenue, lighting
 * each node and incrementing a live revenue counter. It yields instantly when
 * the user moves (idle flips false and ghostNode clears).
 */
export function GhostRun() {
  const { idle, setGhostNode, profile, reducedMotion } = useSystemState();
  const [revenue, setRevenue] = useState(0);
  const [step, setStep] = useState(0);
  const [active, setActive] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const path = [profile.primaryInput, "ai", "telegram", "crm", "revenue"];

    const stop = () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = null;
      setGhostNode(null);
      setActive(false);
      setStep(0);
    };

    if (!idle || reducedMotion) {
      stop();
      return;
    }

    setActive(true);
    let i = 0;
    const advance = () => {
      const id = path[i % path.length];
      setGhostNode(id);
      setStep(i % path.length);
      if (id === "revenue") {
        setRevenue((r) => r + 1200 + Math.floor(Math.random() * 2600));
      }
      i += 1;
      timer.current = window.setTimeout(advance, STAGE_MS);
    };
    advance();

    return stop;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idle, profile.primaryInput, reducedMotion]);

  const path = [profile.primaryInput, "ai", "telegram", "crm", "revenue"];
  const currentLabel = NODE_BY_ID[path[step]]?.label ?? "";

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="ghost"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4 }}
        >
          <div className="ghost__head mono">
            <span className="ghost__pulse" />
            AUTONOMOUS RUN
          </div>
          <div className="ghost__stage mono">
            PROCESSING // <span>{currentLabel.toUpperCase()}</span>
          </div>
          <div className="ghost__rev">
            <span className="ghost__rev-label mono">REVENUE GENERATED</span>
            <span className="ghost__rev-value">${revenue.toLocaleString()}</span>
          </div>
          <div className="ghost__track">
            {path.map((id, i) => (
              <span
                key={id + i}
                className={`ghost__dot ${i <= step ? "is-lit" : ""}`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
