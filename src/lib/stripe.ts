import { loadStripe, type Stripe } from "@stripe/stripe-js";

export type StripeEnv = "sandbox" | "live";

/**
 * Stripe publishable key. Same problem as the Supabase keys: `import.meta.env`
 * is inlined at build time, so a bundle built without it can never recover it and
 * checkout throws "Payments are not configured for this build". The Worker holds
 * it as a secret and injects it per-request — see injectPublicEnv in
 * src/server.ts. Read that first, then fall back to the build-time value.
 */
function readClientToken(): string | undefined {
  if (typeof window !== "undefined") {
    const injected = (window as { __PUBLIC_ENV__?: Record<string, string | undefined> })
      .__PUBLIC_ENV__?.VITE_PAYMENTS_CLIENT_TOKEN;
    if (typeof injected === "string" && injected.trim()) return injected;
  }
  const built = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;
  return built?.trim() ? built : undefined;
}

export function getStripeEnvironment(): StripeEnv {
  const clientToken = readClientToken();
  if (clientToken?.startsWith("pk_test_")) return "sandbox";
  if (clientToken?.startsWith("pk_live_")) return "live";
  throw new Error(
    "Payments are not configured for this build. Configure the Stripe publishable key in Cloudflare to enable checkout.",
  );
}

let stripePromise: Promise<Stripe | null> | null = null;
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    getStripeEnvironment();
    stripePromise = loadStripe(readClientToken() as string);
  }
  return stripePromise;
}

export function hasPaymentsClientToken(): boolean {
  return Boolean(readClientToken());
}
