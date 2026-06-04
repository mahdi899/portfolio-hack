import { AnimatePresence, motion } from "framer-motion";
import { useMagnetic } from "../../hooks/useMagnetic";
import { useSystemState } from "../../state/useSystemState";
import { ACCENT_VAR, type SystemNodeDef } from "../../data/system";
import { Icon } from "../Icon";

export function SystemNode({ node, delay }: { node: SystemNodeDef; delay: number }) {
  const { activePath, activeNode, setUserNode, profile, booted, reducedMotion } =
    useSystemState();
  const mag = useMagnetic(0.3, 12);

  const onPath = activePath.includes(node.id);
  const dim = activeNode !== null && !onPath;
  const isActive = activeNode === node.id;

  const emphasis = profile.emphasis[node.id] ?? 1;
  const override = profile.labels?.[node.id];
  const label = override?.label ?? node.label;
  const sub = override?.sub ?? node.sub;
  const accent = ACCENT_VAR[node.accent];

  const side = node.x < 35 ? "right" : node.x > 65 ? "left" : "below";

  return (
    <div
      className="node-anchor"
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      <motion.div
        ref={mag.ref}
        className={`node ${onPath ? "node--path" : ""} ${dim ? "node--dim" : ""} ${
          isActive ? "node--active" : ""
        }`}
        style={{
          x: mag.x,
          y: mag.y,
          ...({
            "--accent": accent,
            "--accent-rgb": getRgb(node.accent),
          } as React.CSSProperties),
        }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={
          booted
            ? { opacity: dim ? 0.4 : 1, scale: emphasis * (isActive ? 1.06 : 1) }
            : {}
        }
        transition={{
          opacity: { duration: 0.5 },
          scale: { type: "spring", stiffness: 200, damping: 18, delay: booted ? delay : 0 },
        }}
        onMouseEnter={() => setUserNode(node.id)}
        onMouseLeave={() => setUserNode(null)}
        onFocus={() => setUserNode(node.id)}
        onBlur={() => setUserNode(null)}
        tabIndex={0}
        role="button"
        aria-label={`${label} - ${sub}`}
      >
        <motion.span
          className="node__icon"
          animate={reducedMotion ? {} : { y: [0, -3, 0] }}
          transition={{ duration: 3 + node.y * 0.02, ease: "easeInOut", repeat: Infinity }}
        >
          <Icon name={node.icon} size={20} />
        </motion.span>
        <span className="node__text">
          <span className="node__label">{label}</span>
          <span className="node__sub mono">{sub}</span>
        </span>

        <AnimatePresence>
          {isActive && (
            <motion.div
              className={`node-panel node-panel--${side}`}
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.92 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="node-panel__tag mono">{node.category}</span>
              <p className="node-panel__detail">{node.detail}</p>
              <ul className="node-panel__list">
                {node.bullets.map((b) => (
                  <li key={b} className="mono">
                    <i /> {b}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function getRgb(accent: SystemNodeDef["accent"]): string {
  const map: Record<string, string> = {
    purple: "168, 85, 247",
    blue: "56, 189, 248",
    green: "34, 227, 163",
    pink: "244, 114, 182",
    amber: "251, 191, 36",
  };
  return map[accent];
}
