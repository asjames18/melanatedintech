import { createFileRoute } from "@tanstack/react-router";
import {
  type StripeEnv,
  verifyWebhook,
  createStripeClient,
  type StripeEventLike,
} from "@/lib/stripe.server";
import { grantFromSession, type GrantResult } from "@/lib/fulfillment-grant.server";

/** Fields a provider-normalized transaction object may carry. */
type NormalizedSessionObject = {
  id?: unknown;
  currency?: unknown;
  checkout_session_id?: unknown;
  session_id?: unknown;
  metadata?: { session_id?: unknown } | null;
};

function asRecord(obj: unknown): NormalizedSessionObject {
  return (obj ?? {}) as NormalizedSessionObject;
}

function stringField(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function sessionIdOf(obj: unknown): string | null {
  const sessionObj = asRecord(obj);
  return (
    stringField(sessionObj.checkout_session_id) ??
    stringField(sessionObj.session_id) ??
    stringField(sessionObj.metadata?.session_id)
  );
}

/**
 * React to a grant result. A database failure is rethrown so the endpoint
 * returns non-2xx and Stripe retries the event — otherwise a paid buyer
 * silently ends up with no entitlement. An amount mismatch is money in with
 * nothing out: alert the admin immediately, then ack (200) so Stripe does not
 * redeliver a session we have deliberately refused.
 */
async function settleGrantResult(result: GrantResult, obj: unknown): Promise<void> {
  if (result.granted) return;
  if (result.reason === "db-error") {
    throw new Error("Fulfillment grant failed with a database error; retrying via Stripe.");
  }
  if (result.reason === "amount-mismatch") {
    const { enqueuePaymentMismatchAlert } = await import("@/lib/welcome-email.server");
    const raw = asRecord(obj);
    await enqueuePaymentMismatchAlert({
      sessionId: stringField(raw.id),
      kind: result.kind,
      slug: result.slug,
      expectedCents: result.expectedCents,
      gotCents: result.gotCents,
      currency: stringField(raw.currency),
    });
  }
  // missing-metadata / not-paid / unknown-item: nothing to fulfill; ack.
}

async function handleEvent(event: StripeEventLike, env: StripeEnv) {
  const obj = event.data.object;
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const result = await grantFromSession(obj, env);
      await settleGrantResult(result, obj);
      return;
    }
    case "transaction.completed": {
      // Lovable-normalized event — never grant on metadata alone. Resolve back
      // to a real Checkout Session and require it to be paid first.
      const sessionId = sessionIdOf(obj);
      if (!sessionId) {
        console.warn("[payments-webhook] transaction.completed without a session id; ignoring");
        return;
      }
      try {
        const stripe = createStripeClient(env);
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
          console.log("[payments-webhook] transaction.completed session not paid; ignoring", {
            sessionId,
            payment_status: session.payment_status,
          });
          return;
        }
        const result = await grantFromSession(session, env);
        await settleGrantResult(result, session);
      } catch (e) {
        // Rethrow so the endpoint returns non-2xx and Stripe retries.
        console.error("[payments-webhook] transaction.completed handling failed", e);
        throw e;
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
          // Cross-mode guard: a live event must never be fulfilled through the
          // sandbox endpoint and vice versa. Genuine Stripe events always carry
          // livemode; when it is absent (normalized provider events) there is
          // nothing to cross-check, so only a defined mismatch rejects.
          if (event.livemode !== undefined && event.livemode !== (env === "live")) {
            console.error("[payments-webhook] livemode mismatch", {
              livemode: event.livemode,
              env,
            });
            return new Response("Webhook livemode mismatch", { status: 400 });
          }
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
