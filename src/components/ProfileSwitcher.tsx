import { useEffect } from "react";
import { motion } from "framer-motion";
import { PROFILES } from "../data/profiles";
import { useSystemState } from "../state/useSystemState";
import "./ProfileSwitcher.css";

export function ProfileSwitcher() {
  const { profileId, setProfile, idle, reducedMotion } = useSystemState();

  // auto-cycle profiles while idle so the system "adapts" on its own
  useEffect(() => {
    if (!idle || reducedMotion) return;
    const id = window.setInterval(() => {
      const idx = PROFILES.findIndex((p) => p.id === profileId);
      setProfile(PROFILES[(idx + 1) % PROFILES.length].id);
    }, 3600);
    return () => window.clearInterval(id);
  }, [idle, profileId, setProfile, reducedMotion]);

  return (
    <div className="profiles">
      <span className="profiles__label mono">ADAPT SYSTEM TO</span>
      <div className="profiles__row">
        {PROFILES.map((p) => {
          const active = p.id === profileId;
          return (
            <button
              key={p.id}
              className={`profiles__btn ${active ? "is-active" : ""}`}
              onClick={() => setProfile(p.id)}
              title={p.tagline}
            >
              {active && (
                <motion.span
                  layoutId="profile-pill"
                  className="profiles__pill"
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
              )}
              <span className="profiles__btn-text">{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
