import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouter, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { confirmCheckoutSession, confirmGuestCheckoutSession } from "@/lib/payments.functions";
import { getStripeEnvironment, hasPaymentsClientToken } from "@/lib/stripe";
import { getPremiumEntry } from "@/lib/premium-catalog";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [{ title: "Order complete — Melanated in Tech" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutReturn,
});

type Unlocked = { kind: "agent" | "product"; slug: string; guest: boolean };
type Status = "confirming" | "unlocked" | "pending";

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  const router = useRouter();
  const navigate = useNavigate();
  const confirmFn = useServerFn(confirmCheckoutSession);
  const confirmGuestFn = useServerFn(confirmGuestCheckoutSession);

  const [status, setStatus] = useState<Status>(session_id ? "confirming" : "pending");
  const [unlocked, setUnlocked] = useState<Unlocked | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (!session_id || ran.current) return;
    ran.current = true;

    if (!hasPaymentsClientToken()) {
      setStatus("pending");
      return;
    }

    let cancelled = false;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    (async () => {
      // Guests have no session: try the authenticated confirm first, fall
      // back to the guest confirm. The guest path verifies payment_status and
      // the guest flag server-side before granting.
      const { data: { user } } = await supabase.auth.getUser();
      const isGuest = !user;

      // Grant directly from the paid session so delivery does not wait on the webhook.
      // Retry a few times to cover the rare case where the payment is still settling.
      for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
        try {
          const result = isGuest
            ? await confirmGuestFn({
                data: { sessionId: session_id, environment: getStripeEnvironment() },
              })
            : await confirmFn({
                data: { sessionId: session_id, environment: getStripeEnvironment() },
              });
          if (cancelled) return;
          if (result.owned) {
            setUnlocked({ kind: result.kind, slug: result.slug, guest: isGuest });
            setStatus("unlocked");
            trackEvent("purchase_completed", { itemType: result.kind, itemSlug: result.slug, guest: isGuest });
            // Refresh entitlement cache so the rest of the app sees the unlock.
            router.invalidate();

            // Service purchases (a booked session, not a download) have their own
            // post-purchase route; packs stay on this page and link to the item.
            const entry = getPremiumEntry(result.kind, result.slug);
            if (entry?.fulfillmentRoute) {
              navigate({ to: entry.fulfillmentRoute, search: { session_id } });
              return;
            }
            return;
          }
        } catch (error) {
          // Fall through to retry / pending, but never silently — a bug in this
          // block (rather than a slow-settling payment) must still be visible.
          console.error("[checkout-return] confirm attempt failed", error);
        }
        if (attempt < 2) await sleep(1500);
      }
      if (!cancelled) setStatus("pending");
    })();

    return () => {
      cancelled = true;
    };
  }, [session_id, confirmFn, confirmGuestFn, router, navigate]);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        {status === "confirming" ? (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent2/15 text-accent2">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold">Unlocking your purchase…</h1>
            <p className="mt-3 text-muted-foreground">
              Confirming your payment and setting up your access. This only takes a moment.
            </p>
          </>
        ) : status === "unlocked" && unlocked ? (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent2/15 text-accent2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold">You're unlocked.</h1>
            {unlocked.guest ? (
              <>
                <p className="mt-3 text-muted-foreground">
                  Your payment went through. We just emailed your sign-in link — use it to
                  access your purchase anytime.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                  <Button asChild>
                    <Link
                      to={unlocked.kind === "product" ? "/products/$slug" : "/agents/$slug"}
                      params={{ slug: unlocked.slug }}
                    >
                      View your purchase <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/auth">Sign in</Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="mt-3 text-muted-foreground">
                  Your purchase is ready. Open it now to grab everything inside.
                </p>
                <div className="mt-8 flex justify-center gap-3">
                  <Button asChild>
                    <Link
                      to={unlocked.kind === "product" ? "/products/$slug" : "/agents/$slug"}
                      params={{ slug: unlocked.slug }}
                    >
                      Open your purchase <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link to="/account">Go to my account</Link>
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent2/15 text-accent2">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="mt-6 font-display text-3xl font-semibold">You're in.</h1>
            <p className="mt-3 text-muted-foreground">
              {session_id
                ? "Your purchase is processing. Your unlock will appear in your account in a few moments — refresh if you don't see it right away."
                : "Thanks for stopping by. Head back to the marketplace to keep exploring."}
            </p>
            <div className="mt-8 flex justify-center gap-3">
              <Button asChild>
                <Link to="/account">
                  Go to my account <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/agents">Browse agents</Link>
              </Button>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
