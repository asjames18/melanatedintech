import { type StripeEnv } from "@/lib/stripe.server";
import { getPremiumEntry, type PremiumKind } from "@/lib/premium-catalog";

type CheckoutSessionLike = {
  id?: string | null;
  metadata?: Record<string, string> | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  /**
   * Present when Stripe Adaptive Pricing charged the buyer in their local
   * currency. `amount_total` is then denominated in that currency, and this
   * object carries the original settlement amount.
   */
  currency_conversion?: { amount_total?: number | null } | null;
};

/**
 * The amount actually settled in our own currency (USD), or null when the
 * session does not state one.
 *
 * Adaptive Pricing is enabled on the account, so a non-US buyer's
 * `amount_total` arrives in their presentment currency (e.g. 40100 CAD cents
 * for a $297 item). Comparing that raw figure against a USD catalog price
 * fails for every international sale — the card is charged and the entitlement
 * is refused. `currency_conversion.amount_total` is the USD figure to check.
 */
function settledUsdCents(session: CheckoutSessionLike): number | null {
  const converted = session.currency_conversion?.amount_total;
  if (typeof converted === "number") return converted;

  const total = session.amount_total;
  if (typeof total !== "number") return null;

  // No conversion block: trust the total only if it is genuinely USD.
  const currency = session.currency?.toLowerCase();
  if (currency && currency !== "usd") return null;
  return total;
}

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

export type GrantResult =
  | { granted: true; kind: PremiumKind; slug: string }
  | {
      granted: false;
      reason: "missing-metadata" | "not-paid" | "unknown-item" | "amount-mismatch" | "db-error";
    };

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
export async function grantFromSession(
  sessionObj: CheckoutSessionLike,
  env: StripeEnv,
): Promise<GrantResult> {
  const meta = sessionObj?.metadata ?? {};

  // Check if this checkout session belongs to a client invoice
  if (meta.invoice_number && meta.payment_type) {
    const res = await handleInvoicePaymentFromSession(sessionObj);
    if (res.processed) {
      // Invoices process entitlement through their own status flow
      return { granted: false, reason: "missing-metadata" };
    }
  }

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
  const { resolvePremiumEntry } = await import("@/lib/premium-catalog");
  const entry = await resolvePremiumEntry(kind, slug);
  if (!entry) {
    console.warn("[fulfillment-grant] skipping: unknown catalog item", { sessionId, kind, slug });
    return { granted: false, reason: "unknown-item" };
  }
  const amountPaid = settledUsdCents(sessionObj);
  if (typeof amountPaid === "number" && amountPaid !== entry.amountCents) {
    // A paid session whose amount we cannot reconcile is money in with nothing
    // out — the single worst failure mode here. Log it at error level so it is
    // findable in Workers logs rather than buried among warnings.
    console.error("[fulfillment-grant] REFUSED: amount mismatch on a paid session", {
      sessionId,
      expected: entry.amountCents,
      got: amountPaid,
      currency: sessionObj?.currency,
      adaptivePricing: sessionObj?.currency_conversion != null,
    });
    return { granted: false, reason: "amount-mismatch" };
  }
  const priceId = entry.priceId || `dynamic_${kind}_${slug}`;

  const admin = await getAdmin();

  // Look up the seller who owns this listing (if any).
  let sellerId: string | null = null;
  if (kind === "agent") {
    const { data: agent } = await admin
      .from("agents")
      .select("seller_id")
      .eq("slug", slug)
      .maybeSingle();
    sellerId = agent?.seller_id ?? null;
  } else if (kind === "product") {
    const { data: product } = await admin
      .from("products")
      .select("seller_id")
      .eq("slug", slug)
      .maybeSingle();
    sellerId = product?.seller_id ?? null;
  }

  const { error } = await admin.from("user_entitlements").upsert(
    {
      user_id: userId,
      kind,
      slug,
      price_id: priceId,
      stripe_session_id: sessionId,
      environment: env,
      granted_at: new Date().toISOString(),
      seller_id: sellerId,
    } as never,
    { onConflict: "user_id,kind,slug,environment" },
  );
  if (error) {
    console.error("[fulfillment-grant] upsert error", error);
    return { granted: false, reason: "db-error" };
  }
  return { granted: true, kind, slug };
}

export async function handleInvoicePaymentFromSession(
  sessionObj: CheckoutSessionLike,
): Promise<{ processed: boolean; error?: string }> {
  const meta = sessionObj?.metadata ?? {};
  const invoiceNumber = meta.invoice_number;
  const paymentType = meta.payment_type as "deposit" | "final" | undefined;

  if (!invoiceNumber || !paymentType) {
    return { processed: false };
  }

  if (sessionObj?.payment_status && sessionObj.payment_status !== "paid") {
    console.log("[invoice-grant] skipping: not paid yet", { invoiceNumber, paymentType });
    return { processed: false, error: "not-paid" };
  }

  // Amount actually settled, in USD. Adaptive Pricing is enabled on the account,
  // so a non-US client's amount_total arrives in their own currency — reconciled
  // the same way entitlement grants are, or an international client's deposit
  // would look like a mismatch.
  const settled = settledUsdCents(sessionObj);

  const admin = await getAdmin();
  const { data: invoice } = await admin
    .from("client_invoices" as never)
    .select("*")
    .eq("invoice_number" as never, invoiceNumber)
    .maybeSingle();

  if (!invoice) {
    console.warn("[invoice-grant] invoice not found", invoiceNumber);
    return { processed: false, error: "invoice-not-found" };
  }

  const inv = invoice as unknown as {
    invoice_number: string;
    client_name: string;
    client_email: string;
    service_type: string;
    title: string;
    deposit_cents: number;
    final_cents: number;
    status: "deposit_pending" | "deposit_paid" | "fully_paid" | "cancelled" | "draft";
  };
  const now = new Date().toISOString();

  // Reconcile against what the invoice says is owed for this stage. The amount is
  // set server-side and the webhook payload is Stripe-signed, so this should never
  // fire — which is exactly why it is worth asserting: this path carries the
  // largest transactions on the platform and was the only one advancing a payment
  // stage purely on payment_status, with no check on how much was actually paid.
  const expectedCents = paymentType === "deposit" ? inv.deposit_cents : inv.final_cents;
  if (settled != null && expectedCents != null && settled !== expectedCents) {
    console.error("[invoice-grant] REFUSED: amount does not match the invoice", {
      invoiceNumber,
      paymentType,
      expected: expectedCents,
      got: settled,
      currency: sessionObj?.currency,
    });
    return { processed: false, error: "amount-mismatch" };
  }

  if (paymentType === "deposit" && inv.status === "deposit_pending") {
    await admin
      .from("client_invoices" as never)
      .update({
        status: "deposit_paid",
        deposit_paid_at: now,
        updated_at: now,
      } as never)
      .eq("invoice_number" as never, invoiceNumber);

    const { enqueueInvoicePaymentNotifications } = await import("@/lib/welcome-email.server");
    await enqueueInvoicePaymentNotifications({
      invoiceNumber: inv.invoice_number,
      clientName: inv.client_name,
      clientEmail: inv.client_email,
      paymentType: "deposit",
      amountPaidCents: inv.deposit_cents,
      serviceType: inv.service_type,
      title: inv.title,
    });
    await advanceLinkedServiceLead(admin, invoiceNumber, "deposit");
    return { processed: true };
  } else if (paymentType === "final" && inv.status === "deposit_paid") {
    await admin
      .from("client_invoices" as never)
      .update({
        status: "fully_paid",
        final_paid_at: now,
        updated_at: now,
      } as never)
      .eq("invoice_number" as never, invoiceNumber);

    const { enqueueInvoicePaymentNotifications } = await import("@/lib/welcome-email.server");
    await enqueueInvoicePaymentNotifications({
      invoiceNumber: inv.invoice_number,
      clientName: inv.client_name,
      clientEmail: inv.client_email,
      paymentType: "final",
      amountPaidCents: inv.final_cents,
      serviceType: inv.service_type,
      title: inv.title,
    });
    await advanceLinkedServiceLead(admin, invoiceNumber, "final");
    return { processed: true };
  }

  return { processed: true };
}

async function advanceLinkedServiceLead(
  admin: Awaited<ReturnType<typeof getAdmin>>,
  invoiceNumber: string,
  paymentType: "deposit" | "final",
) {
  try {
    const { data: lead } = await admin
      .from("service_system_leads" as never)
      .select("id,service_model")
      .eq("invoice_number" as never, invoiceNumber)
      .maybeSingle();
    if (!lead) return;
    const record = lead as unknown as { id: string; service_model: string };
    const now = new Date().toISOString();
    if (paymentType === "deposit") {
      await admin
        .from("service_system_leads" as never)
        .update({ status: "won", updated_at: now } as never)
        .eq("id" as never, record.id);
    }
    const eventName = paymentType === "deposit" ? "deposit_paid" : "pilot_launched";
    await Promise.all([
      admin.from("service_system_lead_events" as never).insert({
        lead_id: record.id,
        event_type: eventName,
        metadata: { payment_type: paymentType },
      } as never),
      admin.from("analytics_events").insert({
        name: eventName,
        occurred_at: now,
        props: { service_model: record.service_model, funnel_stage: eventName },
      }),
    ]);
  } catch (error) {
    // Lead-pipeline telemetry must never block paid invoice fulfillment.
    console.error("[invoice-grant] linked lead update failed", error);
  }
}
