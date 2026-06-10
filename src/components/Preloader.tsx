import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSystemState } from "../state/useSystemState";
import "./Preloader.css";

const BOOT_LOG = [
  "> nexora_os --boot",
  "[ok] mounting kernel ......... ONLINE",
  "[ok] igniting ai core ........ STABLE",
  "[ok] spinning neural rings ... 3/3",
  "[ok] linking system modules .. 7/7",
  "[ok] energy streams .......... FLOWING",
  "[ok] all systems ............. OPERATIONAL",
];

export function Preloader() {
  const { bootPhase, booted, reducedMotion } = useSystemState();
  const pct = Math.min(100, Math.round((bootPhase / 5) * 100));
  const [typed, setTyped] = useState<string[]>(reducedMotion ? BOOT_LOG : []);
  const logRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    let line = 0;
    const id = window.setInterval(() => {
      line += 1;
      setTyped(BOOT_LOG.slice(0, line));
      if (line >= BOOT_LOG.length) window.clearInterval(id);
    }, 430);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [typed]);

  return (
    <AnimatePresence>
      {!booted && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(16px)", scale: 1.04 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="preloader__scan" aria-hidden="true" />

          <div className="preloader__core">
            <span className="preloader__glyph">N</span>
            <span className="preloader__ring" />
            <span className="preloader__ring preloader__ring--2" />
            <span className="preloader__ring preloader__ring--3" />
          </div>

          <div className="preloader__terminal glass">
            <div className="preloader__terminal-bar mono">
              <span className="preloader__terminal-dots">
                <i /> <i /> <i />
              </span>
              <span>NEXORA // BOOT SEQUENCE</span>
              <span className="preloader__pct">{pct}%</span>
            </div>
            <div className="preloader__log mono" ref={logRef}>
              {typed.map((l, i) => (
                <motion.span
                  key={i}
                  className="preloader__log-line"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {l}
                </motion.span>
              ))}
              <span className="preloader__caret" />
            </div>
            <div className="preloader__bar">
              <motion.span
                className="preloader__fill"
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          <span className="preloader__hint mono">AI GROWTH OPERATING SYSTEM</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
