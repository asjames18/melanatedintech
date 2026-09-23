import { type StripeEnv } from "@/lib/stripe.server";
import { getPremiumEntry, type PremiumKind } from "@/lib/premium-catalog";

type CheckoutSessionLike = {
  id?: string | null;
  metadata?: Record<string, string> | null;
  payment_status?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  /**
   * Stripe-verified buyer email, collected at checkout. The ONLY identity
   * source for guest purchases — never trust client-submitted email.
   */
  customer_details?: { email?: string | null } | null;
  /**
   * Present when Stripe Adaptive Pricing charged the buyer in their local
   * currency. `amount_total` is then denominated in that currency, and this
   * object carries the original settlement amount.
   */
  currency_conversion?: { amount_total?: number | null } | null;
};

/**
 * Guest checkout account provisioning (backlog #16, approved 2026-09-23).
 *
 * A guest buyer paid without a Supabase account. We provision one for them
 * AFTER payment is verified, so the entitlement has an owner and the buyer
 * can access their purchase:
 *   1. Email comes ONLY from Stripe's verified customer_details — never the
 *      client. No verified email → no grant.
 *   2. Find-or-create: try admin.createUser (email pre-confirmed — payment
 *      already verified the buyer's control of the checkout); on duplicate,
 *      look up the existing user id.
 *   3. The caller grants the entitlement to that user id (idempotent upsert).
 *   4. A magic-link sign-in email goes out via the transactional queue so the
 *      buyer can access their purchase. The email is transactional
 *      fulfillment, not marketing.
 *
 * Returns the user id, or null when provisioning failed (caller must refuse
 * the grant in that case — never grant to a null owner).
 */
/**
 * Buyer-facing display name for the magic-link fulfillment email. The premium
 * catalog (premium-catalog.ts) carries no display names, so read the listing
 * row the same way the seller lookup does. Falls back to a prettified slug
 * ("Lead Qualification Agent Sop") and finally to the kind — never the raw
 * slug, which reads like a URL to the buyer.
 */
async function buyerFacingProductName(kind: string, slug: string): Promise<string> {
  if (slug === "revenue-leak-diagnostic") return "Revenue Leak Diagnostic";
  if (slug) {
    try {
      const admin = await getAdmin();
      let name: string | null = null;
      if (kind === "agent") {
        const { data } = await admin
          .from("agents")
          .select("name")
          .eq("slug", slug)
          .maybeSingle();
        name = (data as { name?: string | null } | null)?.name?.trim() ?? null;
      } else if (kind === "product") {
        const { data } = await admin
          .from("products")
          .select("name")
          .eq("slug", slug)
          .maybeSingle();
        name = (data as { name?: string | null } | null)?.name?.trim() ?? null;
      }
      if (name) return name;
    } catch {
      // A name-lookup failure must not cost the buyer their sign-in email;
      // fall through to the slug prettification below.
    }
    return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return kind;
}

async function provisionGuestBuyer(
  session: CheckoutSessionLike,
  env: StripeEnv,
): Promise<string | null> {
  const email = session.customer_details?.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("[fulfillment-grant] guest session has no verified buyer email", {
      sessionId: session.id,
    });
    return null;
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  let userId: string | null = null;

  // createUser is idempotent-safe here: a duplicate email returns an error we
  // handle by looking up the existing user instead of failing the grant.
  const { data: created, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { provisioned_via: "guest_checkout", stripe_session: session.id ?? null },
    });
  if (created?.user?.id) {
    userId = created.user.id;
  } else {
    const msg = (createError?.message ?? "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered") || msg.includes("exists")) {
      // Existing account — find its id so the entitlement lands on the
      // right owner. Paged lookup; the user table is small.
      const perPage = 100;
      let page = 1;
      for (;;) {
        const { data: pageData, error: listError } =
          await supabaseAdmin.auth.admin.listUsers({ page, perPage });
        if (listError || !pageData?.users?.length) break;
        const found = pageData.users.find(
          (u) => u.email?.toLowerCase() === email,
        );
        if (found) {
          userId = found.id;
          break;
        }
        if (pageData.users.length < perPage) break;
        page += 1;
      }
    } else {
      console.error("[fulfillment-grant] guest account creation failed", {
        sessionId: session.id,
        error: createError?.message,
      });
      return null;
    }
  }

  if (!userId) {
    console.error("[fulfillment-grant] guest user id unresolved", { sessionId: session.id });
    return null;
  }

  // Magic-link sign-in so the buyer can access their purchase. Transactional
  // fulfillment — not a marketing message.
  try {
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({ type: "magiclink", email });
    const actionLink = linkData?.properties?.action_link;
    if (linkError || !actionLink) throw linkError ?? new Error("no action link");
    const kind = session.metadata?.unlock_kind ?? "purchase";
    const slug = session.metadata?.unlock_slug ?? "";
    const productName = await buyerFacingProductName(kind, slug);
    await supabaseAdmin.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        to: email,
        subject: `Your ${productName} purchase — sign in to access it`,
        html_body: [
          `<p>Your payment went through. Here's your purchase:</p>`,
          `<p><strong>${productName}</strong></p>`,
          `<p><a href="${actionLink}">Sign in to access your purchase</a></p>`,
          `<p>This link expires soon and can only be used once. If it expires, request a new one from the sign-in page.</p>`,
          `<p>— Melanated in Tech</p>`,
        ].join("\n"),
        text_body: [
          `Your payment went through. Here's your purchase:`,
          ``,
          productName,
          ``,
          `Sign in to access your purchase: ${actionLink}`,
          ``,
          `This link expires soon and can only be used once.`,
          ``,
          `— Melanated in Tech`,
        ].join("\n"),
        metadata: {
          source: "guest_checkout_account_setup",
          user_id: userId,
          stripe_session: session.id ?? null,
          unlock_kind: kind,
          unlock_slug: slug,
        },
      },
    });
  } catch (error) {
    // Non-fatal: the entitlement is granted below and the buyer can always
    // use password reset / request a fresh magic link. Log loudly.
    console.error("[fulfillment-grant] guest magic-link email failed", {
      sessionId: session.id,
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return userId;
}

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
      reason: "missing-metadata" | "not-paid" | "unknown-item" | "db-error";
    }
  | {
      granted: false;
      reason: "amount-mismatch";
      kind: PremiumKind;
      slug: string;
      expectedCents: number;
      gotCents: number | null;
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

  const userIdFromMeta = meta.userId;
  const kind = meta.unlock_kind as PremiumKind | undefined;
  const slug = meta.unlock_slug;
  const sessionId = sessionObj?.id ?? null;

  // Payment must be confirmed BEFORE any guest account provisioning.
  if (sessionObj?.payment_status && sessionObj.payment_status !== "paid") {
    console.log("[fulfillment-grant] not paid yet", {
      sessionId,
      status: sessionObj.payment_status,
    });
    return { granted: false, reason: "not-paid" };
  }

  // kind/slug must be present before catalog validation below. (userId is
  // resolved separately: authed buyers carry it in metadata, guests get
  // provisioned after validation passes.)
  if (!kind || !slug) {
    console.warn("[fulfillment-grant] skipping: missing metadata", { sessionId });
    return { granted: false, reason: "missing-metadata" };
  }

  // Never trust metadata for what was purchased: resolve (kind, slug) against the
  // catalog, and confirm the amount actually paid matches the catalog price before
  // granting. This defeats a forged/mismatched checkout — and it runs BEFORE any
  // side effects (account creation, magic-link emails), so a session we are about
  // to refuse never triggers them.
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
    return {
      granted: false,
      reason: "amount-mismatch",
      kind,
      slug,
      expectedCents: entry.amountCents,
      gotCents: amountPaid,
    };
  }
  const priceId = entry.priceId || `dynamic_${kind}_${slug}`;

  // Guest checkout (backlog #16, approved 2026-09-23): no userId in metadata
  // because the buyer had no account at purchase time. Provision one from
  // Stripe's verified buyer email — only AFTER payment confirmation AND the
  // catalog/amount validation above have passed. Refuse the grant if
  // provisioning fails — never grant to a null owner.
  let userId = userIdFromMeta;
  if (meta.guest === "1" && !userId) {
    // Idempotency: the return page AND the webhook can both trigger this
    // grant. If this session was already granted, skip re-provisioning and
    // the duplicate magic-link email.
    if (sessionId) {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: alreadyGranted } = await supabaseAdmin
        .from("user_entitlements")
        .select("user_id")
        .eq("stripe_session_id", sessionId)
        .maybeSingle();
      if (alreadyGranted?.user_id) {
        return { granted: true, kind, slug };
      }
    }
    const provisioned = await provisionGuestBuyer(sessionObj, env);
    if (!provisioned) {
      console.warn("[fulfillment-grant] guest provisioning failed, refusing grant", {
        sessionId,
      });
      return { granted: false, reason: "missing-metadata" };
    }
    userId = provisioned;
  }

  if (!userId) {
    console.warn("[fulfillment-grant] skipping: missing user id", { sessionId });
    return { granted: false, reason: "missing-metadata" };
  }

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
