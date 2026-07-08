/**
 * Maps premium agent/product slugs to their Stripe price IDs
 * (lookup_keys created via the payments tool). Items not in this map
 * are treated as "contact for pricing" — no checkout button shown.
 *
 * For items with a price_cents value in the database, the DB value takes
 * precedence over this static map (priceId still comes from the map).
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
    "personal-chief-of-staff": {
      priceId: "agent_personal_chief_of_staff_onetime",
      amountCents: 4900,
    },
    "customer-support-agent": {
      priceId: "agent_customer_support_agent_onetime",
      amountCents: 4900,
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
    "prompt-library-pro": {
      priceId: "product_prompt_library_pro_onetime",
      amountCents: 3900,
    },
  },
};

/**
 * Look up a premium entry. Checks the static catalog first; if the item
 * is not listed there, queries the database for a matching active listing
 * with a price_cents value. This lets sellers/admins set prices from the
 * dashboard without touching this file.
 */
export async function resolvePremiumEntry(
  kind: PremiumKind,
  slug: string,
): Promise<PremiumEntry | null> {
  // 1. Static catalog takes precedence (priceId is always from here).
  const staticEntry = PREMIUM_CATALOG[kind]?.[slug];
  if (staticEntry) return staticEntry;

  // 2. Fall back to database: any active listing with a price is sellable.
  const { createClient } = await import("@supabase/supabase-js");
  const { getSupabasePublishableKey, getSupabaseUrl } = await import("@/integrations/supabase/env");
  const sb = createClient(getSupabaseUrl()!, getSupabasePublishableKey()!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

  const table = kind === "agent" ? "agents" : "products";
  const { data } = await sb
    .from(table)
    .select("price_cents")
    .eq("slug", slug)
    .eq("active", true)
    .not("price_cents", "is", null)
    .maybeSingle();

  if (data?.price_cents) {
    // No priceId in the map, so the checkout flow will need to create
    // a price on the fly or use an inline price. Signal that this is
    // a DB-priced item by returning an entry with an empty priceId.
    return { priceId: "", amountCents: data.price_cents };
  }

  return null;
}

/** Synchronous version that only checks the static catalog. */
export function getPremiumEntry(kind: PremiumKind, slug: string): PremiumEntry | null {
  return PREMIUM_CATALOG[kind]?.[slug] ?? null;
}
