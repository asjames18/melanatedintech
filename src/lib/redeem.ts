/**
 * AppSumo bundle SKU contents. Plain client-safe module — the redeem route
 * imports this directly so the server-function module never ships extra
 * exports to the client bundle.
 */
export const BUNDLE_AGENT_SLUGS = [
  "personal-chief-of-staff",
  "pa-inbox-zero",
  "marketing-campaign-strategist",
  "marketing-seo-researcher",
  "customer-support-agent",
] as const;

export type BundleAgentSlug = (typeof BUNDLE_AGENT_SLUGS)[number];

/** Successful agent responses per week included with the bundle. */
export const BUNDLE_WEEKLY_ALLOWANCE = 200;
