export interface PlanetDef {
  id: string;
  name: string;
  detail: string;
  size: number;
  /** initial orbital angle (radians) */
  angle: number;
  /** orbital angular speed (radians / second) */
  speed: number;
  /** sideways bend of the energy stream toward the core */
  bend: number;
}

export interface LayerDef {
  id: "traffic" | "automation" | "revenue";
  index: string;
  name: string;
  tagline: string;
  radius: number;
  tilt: [number, number, number];
  color: string;
  colorB: string;
  planets: PlanetDef[];
}

export const CORE_RADIUS = 6;

export const LAYERS: LayerDef[] = [
  {
    id: "revenue",
    index: "03",
    name: "Revenue Layer",
    tagline: "Intent becomes income",
    radius: 12.5,
    tilt: [0.16, 0, -0.1],
    color: "#f471c8",
    colorB: "#c084fc",
    planets: [
      { id: "sales", name: "Sales Pipeline", detail: "Qualified intent, routed to close", size: 0.82, angle: 0.4, speed: 0.072, bend: 1.2 },
      { id: "appointments", name: "Appointment Setter", detail: "Books & confirms automatically", size: 0.68, angle: 2.0, speed: 0.06, bend: -1.4 },
      { id: "conversion", name: "Conversion Engine", detail: "Human + AI close, optimized", size: 0.76, angle: 3.6, speed: 0.066, bend: 1.0 },
      { id: "revenue", name: "Revenue Planet", detail: "Attention, fully monetized", size: 1.0, angle: 5.2, speed: 0.054, bend: -0.9 },
    ],
  },
  {
    id: "automation",
    index: "02",
    name: "Automation Layer",
    tagline: "Intelligence nurtures every signal",
    radius: 19.5,
    tilt: [-0.12, 0, 0.08],
    color: "#22d3ee",
    colorB: "#60a5fa",
    planets: [
      { id: "agents", name: "AI Agents", detail: "Autonomous agents working 24/7", size: 1.0, angle: 1.0, speed: 0.05, bend: -1.6 },
      { id: "telegram", name: "Telegram", detail: "Engage & nurture in real time", size: 0.74, angle: 2.55, speed: 0.044, bend: 1.3 },
      { id: "crm", name: "CRM", detail: "Every lead remembered, forever", size: 0.84, angle: 4.1, speed: 0.047, bend: -1.0 },
      { id: "email", name: "Email Automation", detail: "Sequences that never sleep", size: 0.7, angle: 5.7, speed: 0.041, bend: 1.5 },
    ],
  },
  {
    id: "traffic",
    index: "01",
    name: "Traffic Layer",
    tagline: "Attention enters the system",
    radius: 27,
    tilt: [0.08, 0, 0.05],
    color: "#a855f7",
    colorB: "#7c3aed",
    planets: [
      { id: "instagram", name: "Instagram", detail: "Ads + content engineered to capture", size: 1.05, angle: 0.2, speed: 0.034, bend: 1.8 },
      { id: "google", name: "Google Ads", detail: "High-intent search traffic", size: 0.9, angle: 1.75, speed: 0.03, bend: -1.5 },
      { id: "tiktok", name: "TikTok", detail: "Short video, mass attention", size: 0.95, angle: 3.3, speed: 0.032, bend: 1.2 },
      { id: "content", name: "Content Engine", detail: "Create. Distribute. Scale.", size: 0.8, angle: 4.9, speed: 0.028, bend: -2.0 },
    ],
  },
];
