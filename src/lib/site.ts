// Canonical production origin. Used for the sitemap, SEO canonical/OG URLs,
// and structured data. No trailing slash.
export const SITE_URL = "https://melanatedintech.com";

export const SITE = {
  name: "Melanated In Tech",
  short: "MIT",
  tagline: "The home for AI agents.",
  description:
    "Melanated In Tech is the destination for AI agent knowledge, marketplace, products, and services — built for the people putting agents to work.",
};

export const NAV = [
  { to: "/agents", label: "Marketplace" },
  { to: "/knowledge", label: "Knowledge Hub" },
  { to: "/products", label: "Products" },
  { to: "/services", label: "Services" },
  { to: "/community", label: "Community" },
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
    title: "Agent Digital Products",
    href: "/products" as const,
    blurb:
      "Starter kits, blueprints, prompt libraries, SOPs, and memory systems to ship agents faster.",
    tag: "Pillar 03",
  },
  {
    title: "Agent Services",
    href: "/services" as const,
    blurb: "Strategy sprints, custom agent builds, and ministry implementations — done with you.",
    tag: "Pillar 04",
  },
  {
    title: "Agent Builder Community",
    href: "/community" as const,
    blurb: "A community for people building, deploying, and benefiting from AI agents.",
    tag: "Pillar 05",
  },
];

export function formatPrice(cents?: number | null) {
  if (cents == null) return null;
  return `$${(cents / 100).toFixed(0)}`;
}
