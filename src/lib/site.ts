// Canonical production origin. Used for the sitemap, SEO canonical/OG URLs,
// and structured data. No trailing slash.
export const SITE_URL = "https://melanatedintech.com";

export const SITE = {
  name: "Melanated In Tech",
  short: "MIT",
  tagline: "Practical AI automation, integrations, and controlled implementation.",
  description:
    "Melanated In Tech improves costly business workflows through AI automation, systems integration, and controlled implementation.",
};

// Community is intentionally out of NAV until the feed has real activity —
// an empty feed hurts trust more than a missing link. Route stays live.
export const NAV = [
  { to: "/work-with-us", label: "Services" },
  { to: "/services/workflow-automation", label: "Workflow Automation" },
  { to: "/services/ai-integrations", label: "AI Integrations" },
  { to: "/industries/higher-education", label: "Higher Education" },
  { to: "/proof", label: "Results" },
  { to: "/radar", label: "AI Radar" },
  { to: "/knowledge", label: "Knowledge Hub" },
  { to: "/about", label: "About" },
] as const;

export const PILLARS = [
  {
    title: "Agent Marketplace",
    href: "/agents" as const,
    blurb:
      "Discover production-grade AI agents for ministries, businesses, sales, support, research, and creators.",
    tag: "Pillar 01",
  },
  {
    title: "Agent Knowledge Hub",
    href: "/knowledge" as const,
    blurb:
      "Guides, frameworks, and field notes on memory, skills, MCP, multi-agent systems, local AI, and more.",
    tag: "Pillar 02",
  },
  {
    title: "Agent Learning Paths",
    href: "/paths" as const,
    blurb:
      "Guided paths that connect articles, agents, products, and community prompts into a weekly builder loop.",
    tag: "Pillar 03",
  },
  {
    title: "Interactive AI Tools",
    href: "/tools" as const,
    blurb:
      "Build system prompts with Prompt Pilot and compile custom agent instructions with GPT Trainer instantly.",
    tag: "Pillar 04",
  },
  {
    title: "Agent Digital Products",
    href: "/products" as const,
    blurb:
      "Starter kits, blueprints, prompt libraries, SOPs, and memory systems to ship agents faster.",
    tag: "Pillar 05",
  },
  {
    title: "Work With Us",
    href: "/work-with-us" as const,
    blurb: "Workflow strategy, controlled pilots, production AI integrations, and managed automation operations.",
    tag: "Pillar 06",
  },
  {
    title: "Open Commons",
    href: "/open-commons" as const,
    blurb:
      "Community-built policy patterns, test fixtures, and practical AI infrastructure that stays useful in the open.",
    tag: "Pillar 07",
  },
];

export function formatPrice(cents?: number | null) {
  if (cents == null) return null;
  return `$${(cents / 100).toFixed(0)}`;
}
