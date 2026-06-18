import { useEffect, useRef } from "react";
import {
  journey,
  fade,
  RANGES,
  SCENE_ORDER,
  SceneId,
  sceneIndexAt,
} from "../experience/store";
import "./overlay.css";

/* ------------------------------ scene meta ------------------------------- */

const TAGLINES: Record<SceneId, string> = {
  hero: "INTELLIGENCE THAT GROWS",
  problem: "STOP LEAKAGE · START GROWTH",
  traffic: "ALL CHANNELS · ONE SYSTEM",
  capture: "EVERY SIGNAL BECOMES DATA",
  gate: "THE SYSTEM UNDERSTANDS INTENT",
  agents: "ALWAYS ON · NEVER MANUAL",
  tunnel: "ENTERING THE CORE",
  crm: "ONE SOURCE OF TRUTH",
  human: "AI PREPARES · HUMANS CLOSE",
  revenue: "ATTENTION IN · REVENUE OUT",
  cta: "INTELLIGENCE THAT GROWS",
};

const CUES: Record<SceneId, string> = {
  hero: "SCROLL TO ENTER THE SYSTEM",
  problem: "SCROLL TO CONTINUE",
  traffic: "SCROLL TO EXPLORE THE FLOW",
  capture: "SCROLL TO CONTINUE",
  gate: "SCROLL TO SEE THE SYSTEM IN ACTION",
  agents: "SCROLL TO ENTER THE CORE",
  tunnel: "KEEP SCROLLING",
  crm: "SCROLL TO CONTINUE",
  human: "SCROLL TO CONTINUE",
  revenue: "",
  cta: "",
};

const FEED = [
  { c: "var(--pink)", t: "Lead captured from Instagram" },
  { c: "var(--purple)", t: "AI scored intent: High" },
  { c: "var(--cyan)", t: "CRM record created" },
  { c: "var(--purple)", t: "Follow-up scheduled" },
  { c: "var(--mint)", t: "Call booked" },
];

const CRM_CARDS = [
  { id: "new", side: "l", icon: "◉", color: "var(--purple)", name: "New", l1: "New lead captured", l2: "Source: Instagram", time: "Just now" },
  { id: "qualified", side: "l", icon: "✓", color: "var(--cyan)", name: "Qualified", l1: "Lead qualified", l2: "Score: 85", time: "2m ago" },
  { id: "booked", side: "l", icon: "▦", color: "var(--mint)", name: "Booked", l1: "Meeting booked", l2: "Calendar synced", time: "10m ago" },
  { id: "won", side: "r", icon: "★", color: "var(--gold)", name: "Won", l1: "Deal won", l2: "Revenue recorded", time: "1d ago" },
  { id: "record", side: "r", icon: "✓", color: "var(--mint)", name: "Record Created", l1: "One source of truth.", l2: "", time: "" },
  { id: "follow", side: "r", icon: "✉", color: "var(--purple)", name: "Follow-Up", l1: "Follow-up scheduled", l2: "Task created", time: "1h ago" },
];

const METRICS = [
  { k: "Qualified Leads", v: "12,842", d: "+127%", note: "vs last 30 days" },
  { k: "Booked Calls", v: "1,293", d: "+93%", note: "vs last 30 days" },
  { k: "Conversion Rate", v: "24.7%", d: "+68%", note: "vs last 90 days" },
  { k: "Revenue Added", v: "$2.48M", d: "+142%", note: "vs last 90 days" },
  { k: "Pipeline Value", v: "$5.9M", d: "+88%", note: "open opportunities" },
];

/* ------------------------------- helpers --------------------------------- */

const pad = (n: number) => String(n).padStart(2, "0");

const scrollToScene = (id: SceneId) => {
  const [a, b] = RANGES[id];
  const target = (a + b) / 2;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: target * max, behavior: "smooth" });
};

const ovFade = (p: number, id: SceneId) => {
  const [a, b] = RANGES[id];
  const len = b - a;
  if (id === "hero") return fade(p, -1, 0, b - len * 0.42, b - len * 0.14);
  if (id === "cta") return fade(p, a + len * 0.1, a + len * 0.45, 2, 3);
  return fade(p, a + len * 0.1, a + len * 0.32, b - len * 0.32, b - len * 0.1);
};

/* ------------------------------- component ------------------------------- */

export default function Overlay() {
  const secRefs = useRef(new Map<SceneId, HTMLElement>());
  const numRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const cueText = useRef<HTMLSpanElement>(null);
  const railFill = useRef<HTMLDivElement>(null);
  const lastIdx = useRef(-1);

  const setSec = (id: SceneId) => (el: HTMLElement | null) => {
    if (el) secRefs.current.set(id, el);
  };

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const p = journey.smooth;

      SCENE_ORDER.forEach((id) => {
        const el = secRefs.current.get(id);
        if (!el) return;
        const o = ovFade(p, id);
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o > 0.004 ? "visible" : "hidden";
        el.style.transform = `translateY(${((1 - o) * 22).toFixed(2)}px)`;
        el.style.pointerEvents = o > 0.55 ? "" : "none";
      });

      const idx = sceneIndexAt(p);
      if (idx !== lastIdx.current) {
        lastIdx.current = idx;
        const id = SCENE_ORDER[idx];
        if (numRef.current) numRef.current.textContent = pad(idx + 1);
        if (tagRef.current) tagRef.current.textContent = TAGLINES[id];
        if (cueText.current) cueText.current.textContent = CUES[id];
        if (cueRef.current) cueRef.current.style.opacity = CUES[id] ? "" : "0";
      }
      if (railFill.current) railFill.current.style.height = `${(p * 100).toFixed(2)}%`;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="overlay">
      {/* ------------------------- persistent HUD ------------------------- */}
      <header className="hud-top">
        <div className="brand">
          NEXORA <span>///</span>
        </div>
        <div className="scene-dial">
          <i />
          <div>
            <span ref={numRef} className="scene-num">01</span>
            <span className="scene-word">SCENE</span>
          </div>
          <i />
        </div>
        <div className="status">
          <i />
          SYSTEM ONLINE
        </div>
      </header>

      <div className="hud-corner tl" />
      <div className="hud-corner tr" />
      <div className="hud-corner bl" />
      <div className="hud-corner br" />

      <div className="hud-rail">
        <div className="hud-rail-fill" ref={railFill} />
      </div>

      <footer className="hud-bottom">
        <span>NEXORA OS v1.0.0</span>
        <span ref={tagRef}>INTELLIGENCE THAT GROWS</span>
      </footer>

      <div className="scroll-cue" ref={cueRef}>
        <span ref={cueText}>SCROLL TO ENTER THE SYSTEM</span>
        <div className="mouse">
          <i />
        </div>
        <b>⌄</b>
      </div>

      {/* --------------------------- 01 · HERO ---------------------------- */}
      <section ref={setSec("hero")} className="ov sc-hero">
        <p className="kicker">AI × AUTOMATION × GROWTH</p>
        <h1>
          Building Intelligent
          <br />
          <em>Growth Systems</em>
        </h1>
        <p className="sub">From Instagram attention to automated revenue.</p>
        <p className="body">
          We build AI-powered systems that capture leads, qualify intent, sync CRM
          data, and route high-value prospects to your sales team.
        </p>
        <div className="cta-row">
          <button className="btn primary" onClick={() => scrollToScene("cta")}>
            Start System Audit <b>→</b>
          </button>
          <button className="btn ghost" onClick={() => scrollToScene("problem")}>
            Explore the System
          </button>
        </div>
        <aside className="hud-side left">
          <span className="hud-side-k">CORE STATUS</span>
          <span className="hud-side-v mint">+ AWAKENING</span>
        </aside>
        <aside className="hud-side right">
          <span className="hud-side-k">SYSTEM VITALS</span>
          <span className="hud-side-v">100%</span>
        </aside>
      </section>

      {/* -------------------------- 02 · PROBLEM -------------------------- */}
      <section ref={setSec("problem")} className="ov sc-problem">
        <header className="ov-head">
          <p className="kicker">AI × AUTOMATION × GROWTH</p>
          <h2>
            The System <em className="cyan">Problem</em>
          </h2>
          <p className="sub">
            Attention is not the problem. <i className="cyan">Lead leakage is.</i>
          </p>
          <p className="body">
            Leads arrive from ads, content, DMs and referrals. Without a connected
            system, they disappear before your team can convert them.
          </p>
        </header>
        <span className="leak-tag" style={{ left: "13%", top: "37%" }}>Unanswered DMs</span>
        <span className="leak-tag" style={{ right: "12%", top: "36%" }}>Manual Follow-Up</span>
        <span className="leak-tag" style={{ left: "26%", top: "72%" }}>No CRM Clarity</span>
        <span className="leak-tag" style={{ right: "23%", top: "75%" }}>Lost Leads</span>
      </section>

      {/* -------------------------- 03 · TRAFFIC -------------------------- */}
      <section ref={setSec("traffic")} className="ov sc-traffic">
        <header className="ov-head">
          <p className="kicker">ALL CHANNELS · ONE SYSTEM</p>
          <h2>
            Traffic <em>Layer</em>
          </h2>
          <p className="sub">Every signal enters one connected system.</p>
          <p className="body">
            Instagram, ads, content, landing pages and social channels feed the
            same growth engine.
          </p>
        </header>

        <div className="chan ig" style={{ left: "4.5%", top: "30%" }}>
          <b>Instagram</b>
          <span>Stories, Reels, DMs</span>
          <i>INCOMING</i>
        </div>
        <div className="chan pu" style={{ left: "2.5%", top: "51%" }}>
          <b>Ads</b>
          <span>Meta, Google, TikTok</span>
          <i>INCOMING</i>
        </div>
        <div className="chan pu" style={{ left: "7%", top: "72%" }}>
          <b>Content</b>
          <span>Videos, Posts, Carousels</span>
          <i>INCOMING</i>
        </div>
        <div className="chan cy r" style={{ right: "4%", top: "37%" }}>
          <b>Landing Page</b>
          <span>Forms, Clicks, Events</span>
          <i>INCOMING</i>
        </div>
        <div className="chan mi r" style={{ right: "2.5%", top: "63%" }}>
          <b>Telegram / WhatsApp</b>
          <span>Chats, Leads, Replies</span>
          <i>INCOMING</i>
        </div>

        <div className="process-bar">
          {["Capture", "Unify", "Route", "Nurture", "Convert"].map((s, i) => (
            <div key={s} className={`step${i === 2 ? " hot" : ""}`}>
              <span className="step-n">{pad(i + 1)}</span>
              <span className="step-l">{s}</span>
              {i < 4 && <b>→</b>}
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------- 04 · CAPTURE -------------------------- */}
      <section ref={setSec("capture")} className="ov sc-capture">
        <header className="ov-head">
          <p className="kicker">AI × AUTOMATION × GROWTH</p>
          <h2>
            Lead <em>Capture</em>
          </h2>
          <p className="sub">Every interaction becomes structured data.</p>
          <p className="body">
            DMs, forms, clicks and replies are captured before they get lost.
          </p>
        </header>
        <div className="chip-row bottom">
          <span className="chip pk">DMs</span>
          <span className="chip cy">Forms</span>
          <span className="chip pu">Clicks &amp; Replies</span>
        </div>
      </section>

      {/* ---------------------------- 05 · GATE --------------------------- */}
      <section ref={setSec("gate")} className="ov sc-gate">
        <header className="ov-head">
          <p className="kicker">AI MODEL · LEARNING &amp; OPTIMIZING</p>
          <h2>
            AI <em>Qualification</em>
          </h2>
          <p className="sub">The system understands intent.</p>
          <p className="body">
            AI scores each lead based on urgency, intent, service fit and
            readiness to buy.
          </p>
        </header>

        <span className="gate-in">RAW LEADS <b>⟶</b></span>

        <div className="route gold" style={{ top: "31%" }}>
          <b>Hot Lead</b>
          <span>High Intent · Sales Ready</span>
        </div>
        <div className="route cy" style={{ top: "44%" }}>
          <b>Warm</b>
          <span>Engaged · Nurture Ready</span>
        </div>
        <div className="route pu" style={{ top: "57%" }}>
          <b>Nurture</b>
          <span>Lower Intent · Campaign</span>
        </div>
        <div className="route gr" style={{ top: "70%" }}>
          <b>Filtered</b>
          <span>Not Qualified · Low Intent</span>
        </div>

        <div className="panel summary">
          <p className="panel-title">Qualification Summary</p>
          <div className="summary-grid">
            <div><b className="gold">27%</b><span>Hot Leads</span></div>
            <div><b className="cyan">41%</b><span>Warm Leads</span></div>
            <div><b className="purple">22%</b><span>Nurture</span></div>
            <div><b className="gray">10%</b><span>Filtered</span></div>
          </div>
        </div>
      </section>

      {/* --------------------------- 06 · AGENTS -------------------------- */}
      <section ref={setSec("agents")} className="ov sc-agents">
        <header className="ov-head">
          <p className="kicker">SIX AGENTS · ONE ORBIT</p>
          <h2>
            Automation <em>Agents</em>
          </h2>
          <p className="sub">Follow-up, routing and syncing run without manual chaos.</p>
          <p className="body">
            Agents keep the system moving while your team focuses on closing
            high-value opportunities.
          </p>
        </header>

        <div className="panel feed">
          <p className="panel-title">Live Activity</p>
          {FEED.map((f, i) => (
            <div className="feed-row" key={f.t} style={{ animationDelay: `${i * 1.4}s` }}>
              <i style={{ background: f.c, boxShadow: `0 0 8px ${f.c}` }} />
              <span>{f.t}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --------------------------- 07 · TUNNEL -------------------------- */}
      <section ref={setSec("tunnel")} className="ov sc-tunnel">
        <p className="kicker">TRANSITION</p>
        <h2 className="tunnel-title">
          Entering the <em>Growth Core</em>
        </h2>
        <p className="sub">Moving inside the machine.</p>
      </section>

      {/* ---------------------------- 08 · CRM ---------------------------- */}
      <section ref={setSec("crm")} className="ov sc-crm">
        <header className="ov-head">
          <p className="kicker">AI × AUTOMATION × GROWTH</p>
          <h2>
            CRM <em className="cyan">Chamber</em>
          </h2>
          <p className="sub">Every lead becomes a record.</p>
          <p className="body">
            Every message, call, status and next step is synced into one source
            of truth.
          </p>
        </header>

        <aside className="hud-side left">
          <span className="hud-side-k">CRM SYNC</span>
          <span className="hud-side-v mint">● ACTIVE</span>
        </aside>

        {CRM_CARDS.map((c, i) => (
          <div
            key={c.id}
            className={`rec-card ${c.side}`}
            style={
              c.side === "l"
                ? { left: `${[7, 4.5, 9][i]}%`, top: `${[34, 50, 66][i]}%` }
                : { right: `${[7, 4.5, 8][i - 3]}%`, top: `${[34, 50, 66][i - 3]}%` }
            }
          >
            <div className="rec-head">
              <i style={{ color: c.color, borderColor: c.color }}>{c.icon}</i>
              <b>{c.name}</b>
            </div>
            {c.l1 && <span>{c.l1}</span>}
            {c.l2 && <span>{c.l2}</span>}
            {c.time && <em>{c.time}</em>}
          </div>
        ))}
      </section>

      {/* --------------------------- 09 · HUMAN --------------------------- */}
      <section ref={setSec("human")} className="ov sc-human">
        <header className="ov-head">
          <p className="kicker">AI × HUMAN</p>
          <h2>
            Human <em className="mint">Close</em>
          </h2>
          <p className="sub">AI prepares the lead. Your team closes the deal.</p>
          <p className="body">
            High-intent prospects are routed to the right person with context,
            status and next action ready.
          </p>
        </header>
        <div className="chip-row bottom">
          <span className="chip gold">Ready to Call</span>
          <span className="chip gold">High Intent</span>
          <span className="chip cy">Booked</span>
          <span className="chip pu">Follow-Up Needed</span>
        </div>
      </section>

      {/* -------------------------- 10 · REVENUE -------------------------- */}
      <section ref={setSec("revenue")} className="ov sc-revenue">
        <header className="ov-head">
          <p className="kicker">AI × AUTOMATION × GROWTH</p>
          <h2>
            Revenue <em>Engine</em>
          </h2>
          <p className="sub">
            From attention to <i className="cyan">measurable revenue.</i>
          </p>
          <p className="body">Track what converts, what leaks, and what should scale.</p>
        </header>

        <div className="metric-row">
          {METRICS.map((m) => (
            <div className="metric" key={m.k}>
              <span className="metric-k">{m.k}</span>
              <div className="metric-line">
                <b>{m.v}</b>
                <i>{m.d}</i>
              </div>
              <svg viewBox="0 0 100 26" preserveAspectRatio="none">
                <path d="M0 24 L10 21 L20 22 L30 17 L40 19 L50 13 L60 15 L70 9 L80 11 L90 5 L100 7 L100 26 L0 26 Z" />
              </svg>
              <span className="metric-note">{m.note}</span>
            </div>
          ))}
        </div>
        <div className="cta-row tight">
          <button className="btn primary" onClick={() => scrollToScene("cta")}>
            Start System Audit <b>→</b>
          </button>
          <a className="btn ghost" href="mailto:hello@nexora.systems?subject=Strategy%20Call">
            Book Strategy Call <b>→</b>
          </a>
        </div>
      </section>

      {/* ---------------------------- 11 · CTA ---------------------------- */}
      <section ref={setSec("cta")} className="ov sc-cta">
        <div className="cta-card">
          <p className="kicker">SYSTEM AUDIT · 48H RESPONSE</p>
          <h2>
            Ready to build your <em>growth system?</em>
          </h2>
          <p className="body">
            Book a system audit and we'll map your traffic, CRM, automation and
            revenue flow.
          </p>
          <div className="cta-row">
            <a className="btn primary" href="mailto:hello@nexora.systems?subject=System%20Audit">
              Start System Audit <b>→</b>
            </a>
            <a className="btn ghost" href="mailto:hello@nexora.systems?subject=Strategy%20Call">
              Book Strategy Call
            </a>
          </div>
          <div className="cta-meta">
            <span>TRAFFIC</span><b>·</b><span>CAPTURE</span><b>·</b><span>AI</span><b>·</b>
            <span>AUTOMATION</span><b>·</b><span>CRM</span><b>·</b><span>REVENUE</span>
          </div>
        </div>
        <p className="cta-foot">© 2026 NEXORA SYSTEMS — TURN YOUR SYSTEM INTO A REVENUE ENGINE</p>
      </section>
    </div>
  );
}
