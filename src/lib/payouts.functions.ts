import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createStripeClient } from "@/lib/stripe.server";

// ---------- Stripe Connect account management ----------

async function getSellerProfileForPayout(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data, error } = await supabaseAdmin
    .from("seller_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("No seller profile found. Complete your profile first.");
  return data;
}

/**
 * Create or retrieve a Stripe Connect account for the seller and generate
 * an onboarding link. Returns the URL the seller should be redirected to.
 */
export const createConnectOnboardingLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ baseUrl: z.string().url() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = createStripeClient("sandbox");

    const profile = await getSellerProfileForPayout(context.userId);

    let accountId = profile.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: {
          seller_profile_id: profile.id,
          user_id: context.userId,
        },
      });

      accountId = account.id;

      await supabaseAdmin
        .from("seller_profiles")
        .update({
          stripe_account_id: accountId,
          stripe_account_status: "pending",
        })
        .eq("id", profile.id);
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${data.baseUrl}/seller/payouts/refresh`,
      return_url: `${data.baseUrl}/seller/payouts/complete`,
      type: "account_onboarding",
    });

    return { url: accountLink.url };
  });

/**
 * Check the status of a seller's Stripe Connect account and update the profile.
 * Called after the seller returns from onboarding.
 */
export const checkConnectAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const stripe = createStripeClient("sandbox");

    const profile = await getSellerProfileForPayout(context.userId);

    if (!profile.stripe_account_id) {
      return { status: "pending", payout_enabled: false };
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    const payoutEnabled = account.payouts_enabled && account.charges_enabled;
    const status = payoutEnabled ? "connected" : "pending";

    await supabaseAdmin
      .from("seller_profiles")
      .update({
        stripe_account_status: status,
        payout_enabled: payoutEnabled,
      })
      .eq("id", profile.id);

    return { status, payout_enabled: payoutEnabled };
  });

/**
 * Record seller earnings when a purchase completes.
 * Called from the webhook handler.
 */
export async function recordSellerEarnings(
  sellerProfileId: string,
  sessionId: string,
  totalCents: number,
  commissionRate: number,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const sellerCents = Math.round(totalCents * (1 - commissionRate / 100));

  const { error } = await supabaseAdmin
    .from("user_entitlements")
    .update({
      seller_id: sellerProfileId,
      commission_cents: sellerCents,
      seller_paid: false,
    })
    .eq("stripe_session_id", sessionId);

  if (error) {
    console.error("Failed to record seller earnings:", error.message);
  }

  return { sellerCents, totalCents };
}
