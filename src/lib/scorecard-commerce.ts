/**
 * Workflow Opportunity Scorecard — Stripe commerce wiring.
 *
 * Live $1 smoke IDs are the defaults (Antonio clearance 2026-09-22).
 * Override via env so Commerce can swap to $19 without a code change.
 * Do NOT route this SKU through pack entitlement grants.
 */

export const SCORECARD_SKU = "workflow_opportunity_scorecard" as const;
export const SCORECARD_LOOKUP_KEY_SMOKE = "sku_workflow_opportunity_scorecard_1" as const;
export const SCORECARD_PDF_FILENAME = "MIT-Workflow-Opportunity-Scorecard.pdf" as const;
export const SCORECARD_EMAIL_SUBJECT = "Your Workflow Opportunity Scorecard" as const;

export type ScorecardCommerceEnv = "sandbox" | "live";

type ScorecardStripeIds = {
  productId: string;
  priceId: string;
  paymentLinkId: string;
  paymentLinkUrl: string;
  lookupKey: string;
  /** Accepted settled USD amounts for this SKU (smoke $1; later $19). */
  acceptedAmountCents: readonly number[];
};

function envOr(key: string, fallback: string): string {
  const fromProcess = typeof process !== "undefined" ? process.env[key]?.trim() : undefined;
  if (fromProcess) return fromProcess;
  // Vite client: only VITE_* is inlined. Used for the Pay CTA URL.
  if (key === "SCORECARD_STRIPE_PAYMENT_LINK_URL" || key === "VITE_SCORECARD_PAYMENT_LINK_URL") {
    try {
      const viteVal = (import.meta as { env?: Record<string, string | undefined> }).env
        ?.VITE_SCORECARD_PAYMENT_LINK_URL;
      if (viteVal?.trim()) return viteVal.trim();
    } catch {
      /* SSR / non-vite */
    }
  }
  return fallback;
}

function parseAmountList(raw: string | undefined, fallback: readonly number[]): readonly number[] {
  if (!raw?.trim()) return fallback;
  const parsed = raw
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  return parsed.length ? parsed : fallback;
}

/** Live (primary smoke) — defaults match Commerce handoff 2026-09-22. */
export function getScorecardLiveIds(): ScorecardStripeIds {
  return {
    productId: envOr("SCORECARD_STRIPE_PRODUCT_ID", "prod_VJAhE7ilp34sJl"),
    priceId: envOr("SCORECARD_STRIPE_PRICE_ID", "price_1UIYLl9upxllsVQBeyDPmjqR"),
    paymentLinkId: envOr("SCORECARD_STRIPE_PAYMENT_LINK_ID", "plink_1UIYLs9upxllsVQBRjihsr8D"),
    paymentLinkUrl: envOr(
      "SCORECARD_STRIPE_PAYMENT_LINK_URL",
      "https://buy.stripe.com/bJe9ANejh0zO0eP0Mu3gk00",
    ),
    lookupKey: envOr("SCORECARD_STRIPE_LOOKUP_KEY", SCORECARD_LOOKUP_KEY_SMOKE),
    acceptedAmountCents: parseAmountList(process.env.SCORECARD_ACCEPTED_AMOUNT_CENTS, [100]),
  };
}

/** Sandbox twin (optional dry-run). */
export function getScorecardSandboxIds(): ScorecardStripeIds {
  return {
    productId: envOr("SCORECARD_STRIPE_SANDBOX_PRODUCT_ID", "prod_VJAhtOsI5JsBO4"),
    priceId: envOr("SCORECARD_STRIPE_SANDBOX_PRICE_ID", "price_1UIYMJ8FdjmpOpeLVOHN3khy"),
    paymentLinkId: envOr(
      "SCORECARD_STRIPE_SANDBOX_PAYMENT_LINK_ID",
      "plink_1UIYMO8FdjmpOpeL4diZ84wn",
    ),
    paymentLinkUrl: envOr(
      "SCORECARD_STRIPE_SANDBOX_PAYMENT_LINK_URL",
      "https://buy.stripe.com/test_5kQ6oB1mg7AC5Kn9EB7Vm00",
    ),
    lookupKey: envOr("SCORECARD_STRIPE_SANDBOX_LOOKUP_KEY", SCORECARD_LOOKUP_KEY_SMOKE),
    acceptedAmountCents: parseAmountList(
      process.env.SCORECARD_SANDBOX_ACCEPTED_AMOUNT_CENTS,
      [100],
    ),
  };
}

export function getScorecardIds(env: ScorecardCommerceEnv): ScorecardStripeIds {
  return env === "live" ? getScorecardLiveIds() : getScorecardSandboxIds();
}

/**
 * Buyer-facing Pay CTA URL. Prefers the live Payment Link unless the site is
 * running against a test publishable key.
 */
export function getScorecardPaymentLinkUrl(env: ScorecardCommerceEnv = "live"): string {
  return getScorecardIds(env).paymentLinkUrl;
}

export function isScorecardSkuMetadata(meta: Record<string, string> | null | undefined): boolean {
  if (!meta) return false;
  const sku = (meta.sku || meta.unlock_slug || "").trim().toLowerCase();
  if (sku === SCORECARD_SKU) return true;
  const lookup = (meta.lookup_key || meta.price_id || "").trim().toLowerCase();
  return lookup.includes("workflow_opportunity_scorecard");
}

export function isScorecardPriceId(priceId: string | null | undefined): boolean {
  if (!priceId) return false;
  const live = getScorecardLiveIds().priceId;
  const sandbox = getScorecardSandboxIds().priceId;
  return priceId === live || priceId === sandbox;
}

export function isAcceptedScorecardAmount(
  env: ScorecardCommerceEnv,
  amountCents: number | null | undefined,
): boolean {
  if (typeof amountCents !== "number") return false;
  return getScorecardIds(env).acceptedAmountCents.includes(amountCents);
}
