import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { getPremiumEntry } from "@/lib/premium-catalog";

const envSchema = z.enum(["sandbox", "live"]);

type CheckoutResult = { clientSecret: string } | { error: string };

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
      const entry = getPremiumEntry(data.kind, data.slug);
      if (!entry) throw new Error("This item is not available for purchase.");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const stripe = createStripeClient(data.environment);

      const prices = await stripe.prices.list({ lookup_keys: [entry.priceId] });
      if (!prices.data.length) throw new Error("Price not found");
      const stripePrice = prices.data[0];

      const customerId = await resolveOrCreateCustomer(stripe, {
        email: user?.email ?? undefined,
        userId,
      });

      const productId =
        typeof stripePrice.product === "string" ? stripePrice.product : stripePrice.product.id;
      const product = await stripe.products.retrieve(productId);

      const session = await stripe.checkout.sessions.create({
        line_items: [{ price: stripePrice.id, quantity: 1 }],
        mode: "payment",
        ui_mode: "embedded_page",
        return_url: data.returnUrl,
        customer: customerId,
        payment_intent_data: { description: product.name },
        metadata: {
          userId,
          unlock_kind: data.kind,
          unlock_slug: data.slug,
          price_id: entry.priceId,
        },
      } as any);

      return { clientSecret: session.client_secret ?? "" };
    } catch (error) {
      console.error("createUnlockCheckout error", error);
      return { error: getStripeErrorMessage(error) };
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
