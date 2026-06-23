import { type StripeEnv } from "@/lib/stripe.server";
import { getPremiumEntry, type PremiumKind } from "@/lib/premium-catalog";

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type GrantResult =
  | { granted: true; kind: PremiumKind; slug: string }
  | { granted: false; reason: "missing-metadata" | "not-paid" | "unknown-item" | "amount-mismatch" | "db-error" };

/**
 * Grant the entitlement implied by a paid Stripe checkout session. Shared by the
 * signature-verified webhook AND the user-triggered checkout-return reconciliation,
 * so both paths apply the exact same validation + idempotent upsert.
 *
 * Callers that are NOT signature-verified (the return page) MUST additionally confirm
 * sessionObj.metadata.userId matches the authenticated caller before calling this —
 * this helper trusts the metadata for what was purchased but verifies it against the
 * catalog + amount paid.
 */
export async function grantFromSession(sessionObj: any, env: StripeEnv): Promise<GrantResult> {
  const meta = sessionObj?.metadata ?? {};
  const userId = meta.userId;
  const kind = meta.unlock_kind as PremiumKind | undefined;
  const slug = meta.unlock_slug;
  const sessionId = sessionObj?.id ?? null;

  if (!userId || !kind || !slug) {
    console.warn("[fulfillment-grant] skipping: missing metadata", { sessionId });
    return { granted: false, reason: "missing-metadata" };
  }
  if (sessionObj?.payment_status && sessionObj.payment_status !== "paid") {
    console.log("[fulfillment-grant] not paid yet", {
      sessionId,
      status: sessionObj.payment_status,
    });
    return { granted: false, reason: "not-paid" };
  }

  // Never trust metadata for what was purchased: resolve (kind, slug) against the
  // catalog, and confirm the amount actually paid matches the catalog price before
  // granting. This defeats a forged/mismatched checkout.
  const entry = getPremiumEntry(kind, slug);
  if (!entry) {
    console.warn("[fulfillment-grant] skipping: unknown catalog item", { sessionId, kind, slug });
    return { granted: false, reason: "unknown-item" };
  }
  const amountPaid = sessionObj?.amount_total;
  if (typeof amountPaid === "number" && amountPaid !== entry.amountCents) {
    console.warn("[fulfillment-grant] skipping: amount mismatch", {
      sessionId,
      expected: entry.amountCents,
      got: amountPaid,
    });
    return { granted: false, reason: "amount-mismatch" };
  }
  const priceId = entry.priceId;

  const admin = await getAdmin();
  const { error } = await admin.from("user_entitlements").upsert(
    {
      user_id: userId,
      kind,
      slug,
      price_id: priceId,
      stripe_session_id: sessionId,
      environment: env,
      granted_at: new Date().toISOString(),
    },
    { onConflict: "user_id,kind,slug,environment" },
  );
  if (error) {
    console.error("[fulfillment-grant] upsert error", error);
    return { granted: false, reason: "db-error" };
  }
  return { granted: true, kind, slug };
}
