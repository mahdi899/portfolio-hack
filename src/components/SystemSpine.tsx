import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSystemState } from "../state/useSystemState";
import "./SystemSpine.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * The energy spine: a single conduit running down the left edge of the page
 * that fills with scroll progress and pulses a node at each section. It makes
 * every section read as one continuous machine rather than separate pages.
 * GSAP ScrollTrigger also "powers on" each section as it enters the viewport.
 */
export function SystemSpine() {
  const { reducedMotion, booted } = useSystemState();
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!booted) return;
    const sections = gsap.utils.toArray<HTMLElement>("main > section");

    // power-on sweep as each section enters
    const triggers = sections.map((sec) =>
      ScrollTrigger.create({
        trigger: sec,
        start: "top 78%",
        once: true,
        onEnter: () => sec.classList.add("is-powered"),
      })
    );

    // spine fill tracks total scroll progress
    const fillTween = gsap.to(fillRef.current, {
      height: "100%",
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: reducedMotion ? true : 0.6,
      },
    });

    // build a node per section on the rail
    const rail = railRef.current;
    if (rail) {
      rail.innerHTML = "";
      sections.forEach((sec, i) => {
        const node = document.createElement("span");
        node.className = "spine__node";
        node.style.top = `${(i / Math.max(1, sections.length - 1)) * 100}%`;
        rail.appendChild(node);
        ScrollTrigger.create({
          trigger: sec,
          start: "top 60%",
          end: "bottom 40%",
          onToggle: (self) => node.classList.toggle("is-lit", self.isActive),
        });
      });
    }

    ScrollTrigger.refresh();

    return () => {
      triggers.forEach((t) => t.kill());
      fillTween.scrollTrigger?.kill();
      fillTween.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [booted, reducedMotion]);

  return (
    <div className="spine" aria-hidden="true">
      <div className="spine__rail" ref={railRef} />
      <span className="spine__fill" ref={fillRef} />
      {!reducedMotion && booted && (
        <>
          <span className="spine__packet" />
          <span className="spine__packet spine__packet--2" />
        </>
      )}
    </div>
  );
}
