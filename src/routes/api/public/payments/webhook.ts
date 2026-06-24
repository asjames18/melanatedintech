import { createFileRoute } from "@tanstack/react-router";
import {
  type StripeEnv,
  verifyWebhook,
  createStripeClient,
  type StripeEventLike,
} from "@/lib/stripe.server";
import { grantFromSession } from "@/lib/fulfillment-grant.server";

async function handleEvent(event: StripeEventLike, env: StripeEnv) {
  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await grantFromSession(obj, env);
      return;
    case "transaction.completed": {
      // Lovable-normalized event - try to resolve back to a checkout session
      const sessionId = obj?.checkout_session_id ?? obj?.session_id ?? obj?.metadata?.session_id;
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
