import { motion } from "framer-motion";
import { useInView } from "../hooks/useInView";
import "./Architect.css";

export function Architect() {
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.3 });

  return (
    <section id="about" className="section architect">
      <div className="container architect__grid" ref={ref}>
        <motion.div
          className="architect__copy"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="kicker">The Architect</span>
          <h2 className="architect__statement">
            I DON'T RUN <span className="gradient-text">CAMPAIGNS.</span>
            <br />
            I BUILD <span className="gradient-text">GROWTH MACHINES.</span>
          </h2>
          <p className="architect__sub">Systems that think. Adapt. Convert.</p>
          <div className="architect__lines">
            <span className="mono">// I design the architecture.</span>
            <span className="mono">// My team executes.</span>
            <span className="mono">// You scale.</span>
          </div>
        </motion.div>

        <motion.div
          className="architect__scene"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="architect__backlight" aria-hidden="true" />
          <div className="architect__screens">
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i} className={`architect__screen architect__screen--${i}`}>
                <span className="architect__screen-feed" />
              </span>
            ))}
          </div>
          <div className="architect__rim" aria-hidden="true" />
          <div className="architect__figure" />
          <div className="architect__fog" aria-hidden="true" />
          <div className="architect__scanline" />
          <span className="architect__tag mono">THE MIND BEHIND THE MACHINE</span>
        </motion.div>
      </div>
    </section>
  );
}
