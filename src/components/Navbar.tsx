import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { NAV_LINKS } from "../data/system";
import { useSystemState } from "../state/useSystemState";
import { Icon } from "./Icon";
import "./Navbar.css";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { booted, triggerLock } = useSystemState();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className={`nav ${scrolled ? "nav--scrolled" : ""}`}
      initial={{ y: -80, opacity: 0 }}
      animate={booted ? { y: 0, opacity: 1 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      <div className="nav__inner container">
        <a className="nav__logo" href="#top">
          <span className="nav__mark">N</span>
          <span className="nav__name">NEXORA</span>
        </a>

        <nav className="nav__links">
          {NAV_LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="nav__link">
              {l.label}
            </a>
          ))}
        </nav>

        <button className="btn nav__cta" onClick={triggerLock}>
          Design a System
          <Icon name="arrow" size={15} className="arrow" />
        </button>
      </div>
    </motion.header>
  );
}
