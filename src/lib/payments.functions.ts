import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { getPremiumEntry, type PremiumKind } from "@/lib/premium-catalog";
import { grantFromSession } from "@/lib/fulfillment-grant.server";

const envSchema = z.enum(["sandbox", "live"]);

type CheckoutResult = { clientSecret: string } | { error: string };

type ConfirmResult = { owned: true; kind: PremiumKind; slug: string } | { owned: false };

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  opts: { email?: string; userId: string },
): Promise<string> {
  if (!/^[a-zA-Z0-9_-]+$/.test(opts.userId)) throw new Error("Invalid userId");
  const found = await stripe.customers.search({
    query: `metadata['userId']:'${opts.userId}'`,
    limit: 1,
  });
  if (found.data.length) return found.data[0].id;
  if (opts.email) {
    const byEmail = await stripe.customers.list({ email: opts.email, limit: 1 });
    if (byEmail.data.length) {
      const c = byEmail.data[0];
      if (c.metadata?.userId !== opts.userId) {
        await stripe.customers.update(c.id, {
          metadata: { ...c.metadata, userId: opts.userId },
        });
      }
      return c.id;
    }
  }
  const created = await stripe.customers.create({
    ...(opts.email && { email: opts.email }),
    metadata: { userId: opts.userId },
  });
  return created.id;
}

/**
 * Build the Stripe line items for an unlock purchase from OUR catalog —
 * never from client input. Shared by the authenticated and guest checkout
 * flows so both charge exactly the catalog price.
 */
type UnlockSessionCreateParams = Parameters<
  ReturnType<typeof createStripeClient>["checkout"]["sessions"]["create"]
>[0];

async function buildUnlockLineItems(
  stripe: ReturnType<typeof createStripeClient>,
  kind: PremiumKind,
  slug: string,
  entry: { priceId: string; amountCents: number },
): Promise<{
  lineItems: NonNullable<NonNullable<UnlockSessionCreateParams>["line_items"]>;
  paymentIntentDescription: string;
}> {
  let lineItems: NonNullable<NonNullable<UnlockSessionCreateParams>["line_items"]>;
  let paymentIntentDescription = "";

  let stripePrice = null;
  if (entry.priceId) {
    try {
      const prices = await stripe.prices.list({ lookup_keys: [entry.priceId], limit: 1 });
      if (prices.data.length) {
        stripePrice = prices.data[0];
      }
    } catch (err) {
      console.warn("Stripe price lookup key error, falling back to inline price:", err);
    }
  }

  if (stripePrice) {
    // Fail fast before charging: the Stripe price object must still match
    // our catalog. If someone edited the price in the Stripe dashboard, a
    // buyer could be charged an amount the fulfillment grant would refuse.
    const priceAmount = stripePrice.unit_amount;
    const priceCurrency = (stripePrice.currency ?? "").toLowerCase();
    if (priceCurrency !== "usd" || priceAmount == null || priceAmount !== entry.amountCents) {
      console.error("[unlockCheckout] Stripe price drifted from catalog", {
        kind,
        slug,
        stripePriceId: stripePrice.id,
        stripeAmount: priceAmount,
        stripeCurrency: stripePrice.currency,
        catalogAmountCents: entry.amountCents,
      });
      throw new Error(
        "This item's checkout price is out of sync. Please contact support before paying.",
      );
    }
    const productId =
      typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
    const product = await stripe.products.retrieve(productId);
    paymentIntentDescription = product.name;

    lineItems = [{ price: stripePrice.id, quantity: 1 }];
  } else {
    // Fallback to database/catalog inline price creation for Stripe checkout
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const table = kind === "agent" ? "agents" : "products";
    const { data: itemData } = await supabaseAdmin
      .from(table)
      .select("name")
      .eq("slug", slug)
      .maybeSingle();

    const name =
      slug === "revenue-leak-diagnostic"
        ? "Revenue Leak Diagnostic ($297)"
        : (itemData?.name || `${kind}: ${slug}`);
    paymentIntentDescription = name;

    lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name,
            metadata: {
              unlock_kind: kind,
              unlock_slug: slug,
            },
          },
          unit_amount: entry.amountCents,
        },
        quantity: 1,
      },
    ];
  }

  return { lineItems, paymentIntentDescription };
}

export const createUnlockCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      // priceId is accepted for backwards-compat but ignored: the server derives
      // the real price from (kind, slug) so a client cannot pay for one item and
      // claim entitlement to a different/pricier one.
      priceId?: string;
      kind: "agent" | "product";
      slug: string;
      returnUrl: string;
      environment: StripeEnv;
    }) =>
      z
        .object({
          priceId: z
            .string()
            .regex(/^[a-zA-Z0-9_-]+$/)
            .or(z.literal(""))
            .optional(),
          kind: z.enum(["agent", "product"]),
          slug: z.string().min(1).max(120),
          returnUrl: z.string().url(),
          environment: envSchema,
        })
        .parse(data),
  )
  .handler(async ({ data, context }): Promise<CheckoutResult> => {
    try {
      const { userId, supabase } = context;

      // Source of truth: derive the Stripe price from our catalog, never the client.
      const { resolvePremiumEntry } = await import("@/lib/premium-catalog");
      const entry = await resolvePremiumEntry(data.kind, data.slug);
      if (!entry) throw new Error("This item is not available for purchase.");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const stripe = createStripeClient(data.environment);

      const customerId = await resolveOrCreateCustomer(stripe, {
        email: user?.email ?? undefined,
        userId,
      });

      const { lineItems, paymentIntentDescription } = await buildUnlockLineItems(
        stripe,
        data.kind,
        data.slug,
        entry,
      );

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        ui_mode: "embedded_page" as any,
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description: paymentIntentDescription },
        metadata: {
          userId,
          unlock_kind: data.kind,
          unlock_slug: data.slug,
          price_id: entry.priceId || `dynamic_${data.kind}_${data.slug}`,
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("createUnlockCheckout error", error);
      return { error: getStripeErrorMessage(error) };
    }
  });

/**
 * Guest checkout for unlock purchases (backlog #16, approved 2026-09-23).
 *
 * No authentication required: Stripe collects the buyer's email at checkout
 * (the verified identity source). After payment, the fulfillment grant
 * provisions a Supabase account from that verified email and emails the
 * buyer a magic sign-in link.
 *
 * Security notes:
 * - Price comes from OUR catalog via buildUnlockLineItems — never the client.
 * - metadata carries guest: "1" and NO userId; the grant provisions the
 *   owner from Stripe-verified customer_details.email only.
 * - This is intentionally a SEPARATE function from createUnlockCheckout so
 *   the authenticated flow is untouched.
 */
export const createGuestUnlockCheckout = createServerFn({ method: "POST" })
  .inputValidator(
    (data: { kind: PremiumKind; slug: string; returnUrl: string; environment: string }) => {
      const parsed = z
        .object({
          kind: z.enum(["agent", "product"]),
          slug: z.string().min(1).max(120),
          returnUrl: z.string().url().max(500),
          environment: envSchema,
        })
        .parse(data);
      return parsed;
    },
  )
  .handler(async ({ data }): Promise<CheckoutResult> => {
    try {
      // Source of truth: derive the Stripe price from our catalog, never the client.
      const { resolvePremiumEntry } = await import("@/lib/premium-catalog");
      const entry = await resolvePremiumEntry(data.kind, data.slug);
      if (!entry) throw new Error("This item is not available for purchase.");

      const stripe = createStripeClient(data.environment);

      const { lineItems, paymentIntentDescription } = await buildUnlockLineItems(
        stripe,
        data.kind,
        data.slug,
        entry,
      );

      const session = await stripe.checkout.sessions.create({
        line_items: lineItems,
        mode: "payment",
        ui_mode: "embedded_page" as never,
        return_url: data.returnUrl,
        // No customer: Stripe collects and verifies the buyer's email at checkout.
        payment_intent_data: { description: paymentIntentDescription },
        metadata: {
          guest: "1",
          unlock_kind: data.kind,
          unlock_slug: data.slug,
          price_id: entry.priceId || `dynamic_${data.kind}_${data.slug}`,
        },
      });

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("createGuestUnlockCheckout error", error);
      return { error: getStripeErrorMessage(error) };
    }
  });

/**
 * Guest counterpart to confirmCheckoutSession. No auth middleware — the
 * buyer has no session yet. The Stripe session id is only known to the buyer
 * (it comes from their own checkout redirect URL); we verify
 * payment_status === "paid" AND the guest flag server-side before granting,
 * and we never return PII beyond the purchased item.
 */
export const confirmGuestCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((data: { sessionId: string; environment: string }) => {
    const parsed = z
      .object({
        sessionId: z.string().min(1).max(200),
        environment: envSchema,
      })
      .parse(data);
    return parsed;
  })
  .handler(async ({ data }): Promise<ConfirmResult> => {
    try {
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);
      if (session.payment_status !== "paid") return { owned: false };
      if (session.metadata?.guest !== "1") return { owned: false };
      const result = await grantFromSession(session, data.environment);
      if (result.granted) {
        return { owned: true, kind: result.kind, slug: result.slug };
      }
      return { owned: false };
    } catch (error) {
      console.error("confirmGuestCheckoutSession error", error);
      return { owned: false };
    }
  });

/**
 * Self-healing fulfillment: grant the entitlement straight from a paid checkout
 * session when the buyer lands back on /checkout/return, so delivery does NOT depend
 * on the Stripe webhook firing. The webhook remains a backup. Idempotent - re-calling
 * for the same session is a no-op thanks to the upsert in grantFromSession.
 */
export const confirmCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { sessionId: string; environment: StripeEnv }) =>
    z
      .object({
        sessionId: z.string().min(1).max(200),
        environment: envSchema,
      })
      .parse(data),
  )
  .handler(async ({ data, context }): Promise<ConfirmResult> => {
    try {
      const { userId } = context;
      const stripe = createStripeClient(data.environment);
      const session = await stripe.checkout.sessions.retrieve(data.sessionId);

      // Ownership guard: unlike the webhook (whose payload is Stripe-signed), this path
      // is user-triggered, so we must confirm the session belongs to the caller before
      // trusting its metadata. A user can only confirm their own checkout.
      if (session.metadata?.userId !== userId) {
        return { owned: false };
      }

      const result = await grantFromSession(session, data.environment);
      if (result.granted) {
        return { owned: true, kind: result.kind, slug: result.slug };
      }
      return { owned: false };
    } catch (error) {
      console.error("confirmCheckoutSession error", error);
      return { owned: false };
    }
  });

export const listMyEntitlements = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_entitlements")
      .select("kind, slug, price_id, granted_at, environment")
      .eq("user_id", userId);
    return data ?? [];
  });
