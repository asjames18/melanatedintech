/**
 * Maps premium agent/product slugs to their Stripe price IDs
 * (lookup_keys created via the payments tool). Items not in this map
 * are treated as "contact for pricing" — no checkout button shown.
 */
export type PremiumKind = "agent" | "product";

export interface PremiumEntry {
  priceId: string;
  amountCents: number;
}

export const PREMIUM_CATALOG: Record<PremiumKind, Record<string, PremiumEntry>> = {
  agent: {
    "marketing-campaign-strategist": {
      priceId: "agent_marketing_campaign_strategist_onetime",
      amountCents: 4900,
    },
    "pa-inbox-zero": { priceId: "agent_pa_inbox_zero_onetime", amountCents: 3900 },
    "marketing-seo-researcher": {
      priceId: "agent_marketing_seo_researcher_onetime",
      amountCents: 5900,
    },
  },
  product: {
    "agent-skill-pack-core": {
      priceId: "product_agent_skill_pack_core_onetime",
      amountCents: 4900,
    },
    "workflow-templates-ops": {
      priceId: "product_workflow_templates_ops_onetime",
      amountCents: 3900,
    },
  },
};

export function getPremiumEntry(kind: PremiumKind, slug: string): PremiumEntry | null {
  return PREMIUM_CATALOG[kind]?.[slug] ?? null;
}
