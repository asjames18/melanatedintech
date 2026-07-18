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

export const createUnlockCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
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

      let lineItems;
      let paymentIntentDescription = "";

      if (entry.priceId) {
        const prices = await stripe.prices.list({ lookup_keys: [entry.priceId] });
        if (!prices.data.length) throw new Error("Price not found");
        const stripePrice = prices.data[0];

        const productId =
          typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
        const product = await stripe.products.retrieve(productId);
        paymentIntentDescription = product.name;

        lineItems = [{ price: stripePrice.id, quantity: 1 }];
      } else {
        // Fallback to database dynamic/inline price creation for Stripe checkout
        const table = data.kind === "agent" ? "agents" : "products";
        const { data: itemData } = await supabase
          .from(table)
          .select("name")
          .eq("slug", data.slug)
          .maybeSingle();

        const name = itemData?.name || `${data.kind}: ${data.slug}`;
        paymentIntentDescription = name;

        lineItems = [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name,
                metadata: {
                  unlock_kind: data.kind,
                  unlock_slug: data.slug,
                },
              },
              unit_amount: entry.amountCents,
            },
            quantity: 1,
          },
        ];
      }

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
 * Self-healing fulfillment: grant the entitlement straight from a paid checkout
 * session when the buyer lands back on /checkout/return, so delivery does NOT depend
 * on the Stripe webhook firing. The webhook remains a backup. Idempotent - re-calling
 * for the same session is a no-op thanks to the upsert in grantFromSession.
 */
export const confirmCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: { sessionId: string; environment: StripeEnv }) =>
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
