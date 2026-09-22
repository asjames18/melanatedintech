import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";
import { getScorecardPaymentLinkUrl } from "@/lib/scorecard-commerce";
import { hasPaymentsClientToken, getStripeEnvironment } from "@/lib/stripe";

export const Route = createFileRoute("/scorecard")({
  head: () => ({
    ...buildSeoMeta({
      title: "Workflow Opportunity Scorecard | Melanated in Tech",
      description:
        "Name one costly repeated workflow. Pay, answer a short questionnaire, and get a scored snapshot with leak themes, a first AI-worker candidate, and Sprint fit — not a Diagnostic or Sprint.",
      url: "/scorecard",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Workflow Opportunity Scorecard", path: "/scorecard" },
        ]),
      ),
    ],
  }),
  component: ScorecardLandingPage,
});

const DELIVERABLES = [
  {
    Icon: ClipboardList,
    title: "Opportunity score (0–100)",
    body: "A directional band — Low / Medium / High — inferred from your answers, with plain-language meaning.",
  },
  {
    Icon: Workflow,
    title: "Time / money leak themes",
    body: "Where this workflow usually leaks, labeled as inferred from your inputs — not measured ROI.",
  },
  {
    Icon: Sparkles,
    title: "First AI-worker candidate",
    body: "One suggested bounded job for that workflow, with an explicit human-approval callout.",
  },
  {
    Icon: FileText,
    title: "Sprint fit + next step",
    body: "Fit / Maybe / Not yet, plus one recommended next step (Fit Finder, Diagnostic, or Sprint inquire).",
  },
];

function payUrl(): string {
  try {
    if (hasPaymentsClientToken()) {
      return getScorecardPaymentLinkUrl(getStripeEnvironment());
    }
  } catch {
    // fall through to live default
  }
  return getScorecardPaymentLinkUrl("live");
}

function ScorecardLandingPage() {
  useEffect(() => {
    trackEvent("scorecard_page_viewed", { ...funnelAttribution() });
  }, []);

  const checkoutUrl = payUrl();

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--color-primary)_15%,transparent),transparent_40%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_85%,var(--color-muted)_15%))]">
        <div className="bg-grid absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Self-serve on-ramp
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Name one costly workflow. Get a scored snapshot.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              The Workflow Opportunity Scorecard is a self-serve snapshot that helps you name the
              costly workflow — before a $297 diagnostic or a 10-business-day Sprint.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="gap-2">
                <a
                  href={checkoutUrl}
                  onClick={() =>
                    trackEvent("scorecard_pay_clicked", {
                      ...funnelAttribution(),
                      offer: "workflow_opportunity_scorecard",
                    })
                  }
                >
                  Pay now <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <span className="text-sm text-muted-foreground">
                One-time · not a subscription · digital goods
              </span>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2 font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" /> Pay → questionnaire → PDF
              </span>
              <span className="inline-flex items-center gap-2 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" /> No guaranteed ROI
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">What you get</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {DELIVERABLES.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold">{title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">How it works</h2>
          <ol className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              ["Pay", "Secure Stripe checkout for the Scorecard."],
              ["Answer", "Short questionnaire about one repeated workflow (~5–8 minutes)."],
              ["Download", "Scored PDF on the thank-you page + fulfillment email."],
            ].map(([title, body], i) => (
              <li key={title} className="rounded-2xl border border-border bg-card p-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Step {i + 1}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">Who it’s for</h2>
        <p className="mt-4 max-w-3xl text-muted-foreground leading-relaxed">
          Owners and ops leads who can name a repeated workflow. Not for “AI for everything”
          browsers. You should be able to describe one workflow in a single sentence.
        </p>

        <div className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
          <h3 className="font-display text-lg font-semibold">Explicit separation</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              Scorecard ≠ <Link to="/diagnostic" className="text-foreground underline">$297 AI Workflow Diagnostic</Link>
            </li>
            <li>
              Scorecard ≠{" "}
              <Link
                to="/work-with-us"
                hash="workflow-opportunity-sprint"
                className="text-foreground underline"
              >
                Workflow Opportunity Sprint
              </Link>{" "}
              (planning engagement — inquire separately)
            </li>
            <li>Scorecard ≠ Recovery Pilot / Website Launch Sprint</li>
          </ul>
          <p className="mt-4 text-sm font-medium text-foreground">
            The Workflow Opportunity Scorecard is a self-serve snapshot. It is not the $297 AI
            Workflow Diagnostic and not the Workflow Opportunity Sprint.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <a href={checkoutUrl}>
              Pay now <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="outline">
            <Link to="/start-small">Start free with Fit Finder</Link>
          </Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground max-w-2xl">
          No guaranteed ROI. Scores are directional from your answers, not a measured baseline.
          Questions? antonio@melanatedintech.com
        </p>
      </section>
    </SiteLayout>
  );
}
