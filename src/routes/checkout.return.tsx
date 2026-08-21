import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { confirmCheckoutSession } from "@/lib/payments.functions";
import { getStripeEnvironment, hasPaymentsClientToken } from "@/lib/stripe";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [{ title: "Order complete — Melanated In Tech" }, { name: "robots", content: "noindex" }],
  }),
  component: CheckoutReturn,
});

type Unlocked = { kind: "agent" | "product"; slug: string };
type Status = "confirming" | "unlocked" | "pending";

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  const router = useRouter();
  const confirmFn = useServerFn(confirmCheckoutSession);

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
      // Grant directly from the paid session so delivery does not wait on the webhook.
      // Retry a few times to cover the rare case where the payment is still settling.
      for (let attempt = 0; attempt < 3 && !cancelled; attempt++) {
        try {
          const result = await confirmFn({
            data: { sessionId: session_id, environment: getStripeEnvironment() },
          });
          if (cancelled) return;
          if (result.owned) {
            setUnlocked({ kind: result.kind, slug: result.slug });
            setStatus("unlocked");
            trackEvent("purchase_completed", { itemType: result.kind, itemSlug: result.slug });
            // Refresh entitlement cache so the rest of the app sees the unlock.
            router.invalidate();

            if (result.slug === "revenue-leak-diagnostic") {
              navigate({ to: "/diagnostic/success", search: { session_id } });
              return;
            }
            return;
          }
        } catch {
          // fall through to retry / pending
        }
        if (attempt < 2) await sleep(1500);
      }
      if (!cancelled) setStatus("pending");
    })();

    return () => {
      cancelled = true;
    };
  }, [session_id, confirmFn, router]);

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
