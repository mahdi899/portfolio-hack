export type NodeCategory =
  | "traffic"
  | "processing"
  | "automation"
  | "conversion"
  | "output";

export type AccentKey = "purple" | "blue" | "green" | "pink" | "amber";

export interface SystemNodeDef {
  id: string;
  label: string;
  sub: string;
  category: NodeCategory;
  /** position within the hero stage, in percent (0-100) */
  x: number;
  y: number;
  icon: string;
  accent: AccentKey;
  /** short explainer shown in the hover panel */
  detail: string;
  bullets: string[];
}

/**
 * Hub-and-spoke system graph. Every node connects to the central core.
 * The "flow" travels: traffic -> AI -> automation -> conversion -> revenue.
 */
export const SYSTEM_NODES: SystemNodeDef[] = [
  {
    id: "ai",
    label: "AI Brain",
    sub: "Lead Intelligence",
    category: "processing",
    x: 50,
    y: 9,
    icon: "brain",
    accent: "purple",
    detail: "Scores, qualifies and routes every lead in real time.",
    bullets: ["Intent scoring", "Auto qualification", "Smart routing"],
  },
  {
    id: "instagram",
    label: "Instagram",
    sub: "Ads + Content",
    category: "traffic",
    x: 13,
    y: 27,
    icon: "instagram",
    accent: "pink",
    detail: "Targeted attention captured from paid + organic reach.",
    bullets: ["Targeted ads", "Content strategy", "DM automation"],
  },
  {
    id: "tiktok",
    label: "TikTok",
    sub: "Short Video",
    category: "traffic",
    x: 8,
    y: 52,
    icon: "video",
    accent: "blue",
    detail: "High-velocity reach that feeds the top of the system.",
    bullets: ["Viral hooks", "Trend capture", "Reach scaling"],
  },
  {
    id: "website",
    label: "Website",
    sub: "Landing Pages",
    category: "traffic",
    x: 14,
    y: 76,
    icon: "globe",
    accent: "green",
    detail: "Conversion-built pages that turn clicks into captured leads.",
    bullets: ["High-intent pages", "Lead capture", "A/B optimized"],
  },
  {
    id: "telegram",
    label: "Telegram Bot",
    sub: "Engage + Nurture",
    category: "automation",
    x: 87,
    y: 26,
    icon: "send",
    accent: "blue",
    detail: "Automated conversations that nurture leads around the clock.",
    bullets: ["Instant replies", "Drip sequences", "24/7 nurture"],
  },
  {
    id: "crm",
    label: "CRM / Call Center",
    sub: "Human Touch",
    category: "conversion",
    x: 91,
    y: 51,
    icon: "headset",
    accent: "purple",
    detail: "Hybrid human + AI closing for high-value conversions.",
    bullets: ["Warm handoff", "Objection handling", "Booked calls"],
  },
  {
    id: "revenue",
    label: "Sales / Revenue",
    sub: "Convert & Scale",
    category: "output",
    x: 87,
    y: 75,
    icon: "chart",
    accent: "green",
    detail: "Predictable revenue, compounding as the system scales.",
    bullets: ["Closed deals", "LTV growth", "Repeatable scale"],
  },
];

export const NODE_BY_ID: Record<string, SystemNodeDef> = Object.fromEntries(
  SYSTEM_NODES.map((n) => [n.id, n])
);

/** Logical downstream order used to highlight an input->revenue path. */
const DOWNSTREAM = ["ai", "telegram", "crm", "revenue"];

export function pathFromNode(nodeId: string | null): string[] {
  if (!nodeId) return [];
  if (NODE_BY_ID[nodeId]?.category === "traffic") {
    return [nodeId, ...DOWNSTREAM];
  }
  const idx = DOWNSTREAM.indexOf(nodeId);
  if (idx >= 0) return DOWNSTREAM.slice(idx);
  return [nodeId];
}

/* ---------------- Growth pipeline (hex row) ---------------- */

export interface PipelineStep {
  id: string;
  index: string;
  label: string;
  source: string;
  icon: string;
  accent: AccentKey;
  bullets: string[];
}

export const PIPELINE: PipelineStep[] = [
  {
    id: "p-traffic",
    index: "01",
    label: "Instagram",
    source: "Traffic Source",
    icon: "instagram",
    accent: "pink",
    bullets: ["Targeted Ads", "Content Strategy", "DM Automation", "Lead Capture"],
  },
  {
    id: "p-ai",
    index: "02",
    label: "AI Engine",
    source: "Qualification",
    icon: "brain",
    accent: "purple",
    bullets: ["Intent Scoring", "Auto Tagging", "Lead Routing", "Prioritization"],
  },
  {
    id: "p-msg",
    index: "03",
    label: "Telegram",
    source: "Automation",
    icon: "send",
    accent: "blue",
    bullets: ["Instant Reply", "Nurture Flows", "Reminders", "Re-engagement"],
  },
  {
    id: "p-call",
    index: "04",
    label: "Call Center",
    source: "Conversion",
    icon: "headset",
    accent: "amber",
    bullets: ["Warm Handoff", "Live Closing", "Objection Handling", "Booking"],
  },
  {
    id: "p-rev",
    index: "05",
    label: "Revenue",
    source: "Output",
    icon: "chart",
    accent: "green",
    bullets: ["Closed Deals", "Upsells", "Retention", "Scale"],
  },
];

/* ---------------- AI agents ---------------- */

export interface AgentDef {
  id: string;
  name: string;
  role: string;
  icon: string;
  accent: AccentKey;
  status: string;
  /** processing load 0-100, drives the activity bar */
  load: number;
}

export const AGENTS: AgentDef[] = [
  {
    id: "qualifier",
    name: "Lead Qualifier",
    role: "Understands intent",
    icon: "scan",
    accent: "purple",
    status: "scoring 24 leads",
    load: 78,
  },
  {
    id: "setter",
    name: "Appointment Setter",
    role: "Books & confirms",
    icon: "calendar",
    accent: "green",
    status: "9 calls booked",
    load: 64,
  },
  {
    id: "followup",
    name: "Follow-Up Agent",
    role: "Never drops a lead",
    icon: "loop",
    accent: "amber",
    status: "47 in nurture",
    load: 52,
  },
  {
    id: "crm",
    name: "CRM Agent",
    role: "Syncs every record",
    icon: "headset",
    accent: "blue",
    status: "syncing pipeline",
    load: 71,
  },
  {
    id: "content",
    name: "Content Agent",
    role: "Creates & distributes",
    icon: "spark",
    accent: "pink",
    status: "drafting 12 posts",
    load: 43,
  },
  {
    id: "revenue",
    name: "Revenue Agent",
    role: "Tracks every dollar",
    icon: "chart",
    accent: "green",
    status: "tracking $48k",
    load: 88,
  },
];

/* ---------------- System modules ---------------- */

export interface ModuleDef {
  id: string;
  title: string;
  desc: string;
  icon: string;
  accent: AccentKey;
}

export const MODULES: ModuleDef[] = [
  {
    id: "m-lead",
    title: "Lead Generation",
    desc: "Multi-channel capture that never stops",
    icon: "mail",
    accent: "pink",
  },
  {
    id: "m-auto",
    title: "AI Automation",
    desc: "Smart agents that work 24/7 for you",
    icon: "brain",
    accent: "blue",
  },
  {
    id: "m-content",
    title: "Content Engine",
    desc: "Create. Distribute. Scale automatically",
    icon: "spark",
    accent: "purple",
  },
  {
    id: "m-convert",
    title: "Conversion Systems",
    desc: "Turn leads into paying customers",
    icon: "target",
    accent: "amber",
  },
  {
    id: "m-retain",
    title: "Retention & Scale",
    desc: "Maximize lifetime value, keep customers",
    icon: "rocket",
    accent: "green",
  },
];

/* ---------------- Journey rail ---------------- */

export interface JourneyStep {
  id: string;
  label: string;
  caption: string;
  icon: string;
  accent: AccentKey;
}

export const JOURNEY: JourneyStep[] = [
  { id: "attract", label: "Attract", caption: "Get attention", icon: "magnet", accent: "pink" },
  { id: "capture", label: "Capture", caption: "Collect leads", icon: "mail", accent: "blue" },
  { id: "nurture", label: "Nurture", caption: "AI engagement", icon: "spark", accent: "purple" },
  { id: "qualify", label: "Qualify", caption: "Intent scoring", icon: "scan", accent: "amber" },
  { id: "convert", label: "Convert", caption: "Human + AI close", icon: "headset", accent: "blue" },
  { id: "scale", label: "Scale", caption: "Repeat & optimize", icon: "rocket", accent: "green" },
];

export const NAV_LINKS = [
  { id: "system", label: "System" },
  { id: "approach", label: "Approach" },
  { id: "modules", label: "Modules" },
  { id: "outcomes", label: "Outcomes" },
  { id: "about", label: "About" },
];

export const ACCENT_VAR: Record<AccentKey, string> = {
  purple: "var(--neon-purple)",
  blue: "var(--neon-blue)",
  green: "var(--neon-green)",
  pink: "var(--neon-pink)",
  amber: "var(--neon-amber)",
};

export const ACCENT_RGB: Record<AccentKey, string> = {
  purple: "168, 85, 247",
  blue: "56, 189, 248",
  green: "34, 227, 163",
  pink: "244, 114, 182",
  amber: "251, 191, 36",
};
