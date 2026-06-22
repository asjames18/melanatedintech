import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order complete — Melanated In Tech" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  return (
    <SiteLayout>
      <section className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent2/15 text-accent2">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-display text-3xl font-semibold">You're in.</h1>
        <p className="mt-3 text-muted-foreground">
          {session_id
            ? "Your purchase is processing. Your unlock will appear in your account in a few seconds."
            : "Thanks for stopping by. Head back to the marketplace to keep exploring."}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link to="/account">Go to my account <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/agents">Browse agents</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
