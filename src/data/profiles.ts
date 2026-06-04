/**
 * Business profiles. Each one re-weights the system graph: which nodes are
 * emphasized, what some labels read as, and which input path lights up by
 * default. Switching profiles animates the graph "adapting" to the visitor.
 */
export interface SystemProfile {
  id: string;
  name: string;
  tagline: string;
  /** node id -> emphasis multiplier (1 = normal, >1 emphasized, <1 receded) */
  emphasis: Record<string, number>;
  /** node id -> overridden label text */
  labels?: Record<string, { label?: string; sub?: string }>;
  /** the traffic node this profile leads with */
  primaryInput: string;
  hudLabel: string;
}

export const PROFILES: SystemProfile[] = [
  {
    id: "instagram",
    name: "Instagram Brand",
    tagline: "Attention-rich, conversion-poor",
    emphasis: { instagram: 1.35, ai: 1.15, telegram: 1.2, revenue: 1.1, tiktok: 0.85, website: 0.8 },
    primaryInput: "instagram",
    hudLabel: "PROFILE // INSTAGRAM-HEAVY",
  },
  {
    id: "local",
    name: "Local Business",
    tagline: "Calls, maps, foot traffic",
    emphasis: { website: 1.35, crm: 1.3, revenue: 1.15, ai: 1.1, instagram: 0.85, tiktok: 0.7 },
    labels: {
      website: { label: "Google Maps", sub: "Calls + Reviews" },
      crm: { label: "Call Center", sub: "Phone Closing" },
      instagram: { label: "Local Ads", sub: "Geo-targeted" },
    },
    primaryInput: "website",
    hudLabel: "PROFILE // LOCAL BUSINESS",
  },
  {
    id: "content",
    name: "Content Brand",
    tagline: "Audience-led, scale-ready",
    emphasis: { tiktok: 1.35, ai: 1.2, telegram: 1.15, revenue: 1.2, crm: 0.85, instagram: 1.05 },
    labels: {
      tiktok: { label: "YouTube", sub: "Long + Shorts" },
      telegram: { label: "Newsletter", sub: "Email + Bot" },
      website: { label: "Funnel", sub: "Lead Magnets" },
    },
    primaryInput: "tiktok",
    hudLabel: "PROFILE // CONTENT-DRIVEN",
  },
];

export const PROFILE_BY_ID: Record<string, SystemProfile> = Object.fromEntries(
  PROFILES.map((p) => [p.id, p])
);

export const DEFAULT_PROFILE = "instagram";
