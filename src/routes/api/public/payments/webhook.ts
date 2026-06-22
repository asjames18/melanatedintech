import { createFileRoute } from "@tanstack/react-router";
import { type StripeEnv, verifyWebhook, createStripeClient } from "@/lib/stripe.server";

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function grantFromSession(sessionObj: any, env: StripeEnv) {
  const meta = sessionObj?.metadata ?? {};
  const userId = meta.userId;
  const kind = meta.unlock_kind;
  const slug = meta.unlock_slug;
  const priceId = meta.price_id ?? null;
  const sessionId = sessionObj?.id ?? null;

  if (!userId || !kind || !slug) {
    console.warn("[payments-webhook] skipping: missing metadata", { sessionId });
    return;
  }
  if (sessionObj?.payment_status && sessionObj.payment_status !== "paid") {
    console.log("[payments-webhook] not paid yet", { sessionId, status: sessionObj.payment_status });
    return;
  }

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
  if (error) console.error("[payments-webhook] upsert error", error);
}

async function handleEvent(event: { type: string; data: { object: any } }, env: StripeEnv) {
  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await grantFromSession(obj, env);
      return;
    case "transaction.completed": {
      // Lovable-normalized event — try to resolve back to a checkout session
      const sessionId =
        obj?.checkout_session_id ?? obj?.session_id ?? obj?.metadata?.session_id;
      if (sessionId) {
        try {
          const stripe = createStripeClient(env);
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          await grantFromSession(session, env);
        } catch (e) {
          console.error("[payments-webhook] retrieve session failed", e);
        }
      } else if (obj?.metadata?.userId) {
        await grantFromSession(obj, env);
      }
      return;
    }
    default:
      console.log("[payments-webhook] ignored", event.type);
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          return Response.json({ received: true, ignored: "invalid env" });
        }
        const env: StripeEnv = rawEnv;
        try {
          const event = await verifyWebhook(request, env);
          await handleEvent(event, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("[payments-webhook] error", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
