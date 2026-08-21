import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Clock,
  DollarSign,
  FileSpreadsheet,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { UnlockButton } from "@/components/unlock-button";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";

export const Route = createFileRoute("/diagnostic")({
  head: () => ({
    ...buildSeoMeta({
      title: "Revenue Leak Diagnostic ($297) | Melanated In Tech",
      description:
        "Pinpoint missed leads, estimate follow-up bottlenecks, and get an actionable 30-day revenue recovery roadmap.",
      url: "/diagnostic",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Revenue Leak Diagnostic", path: "/diagnostic" },
        ]),
      ),
    ],
  }),
  component: RevenueLeakDiagnostic,
});

const DELIVERABLES = [
  {
    Icon: Clock,
    title: "45-Minute Bottleneck Audit",
    body: "Live review of your inbound call routing, missed-lead triggers, estimate follow-ups, and scheduling handoffs.",
  },
  {
    Icon: FileSpreadsheet,
    title: "1-Page Revenue Leak Map",
    body: "A structured visual breakdown of exact drop-off points, software disconnects, and after-hours vulnerabilities.",
  },
  {
    Icon: DollarSign,
    title: "Conservative Recovery Estimate",
    body: "Data-backed projection of recoverable monthly revenue from missed inquiries and stagnant estimates.",
  },
  {
    Icon: Workflow,
    title: "30-Day Action Sequence",
    body: "Step-by-step implementation blueprint ready for your internal team or credited toward our 30-Day Pilot.",
  },
];

const FAQS = [
  [
    "Can the $297 diagnostic fee be credited toward a pilot?",
    "Yes. 100% of your $297 diagnostic fee is automatically credited toward the initial deposit if you proceed with our $1,500 30-Day Recovery Pilot.",
  ],
  [
    "Who is this diagnostic built for?",
    "It is specifically designed for local service businesses (HVAC, plumbing, electrical, roofing, field services) with 2–20 employees, one location, and active inbound lead volume.",
  ],
  [
    "What happens immediately after I checkout?",
    "You will land on a secure confirmation page with instant access to schedule your 45-minute audit session and download your preliminary intake checklist.",
  ],
  [
    "Do I need to give you full system access beforehand?",
    "No. We conduct the audit based on your existing workflows, scheduling software, and sample lead paths. Full integration access is only needed during a pilot build.",
  ],
];

function RevenueLeakDiagnostic() {
  useEffect(() => {
    trackEvent("diagnostic_page_viewed", { ...funnelAttribution() });
  }, []);

  return (
    <SiteLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--color-primary)_15%,transparent),transparent_40%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_85%,var(--color-muted)_15%))]">
        <div className="bg-grid absolute inset-0 opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> High-Value Diagnostic
              </span>
              <h1 className="mt-5 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Find out exactly where your business is losing leads & revenue.
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Before investing thousands in custom software, run a 45-minute paid diagnostic to map your operational leaks, quantify missed revenue, and get a clear 30-day recovery plan.
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> 100% credited toward pilot
                </span>
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <CalendarCheck className="h-4 w-4 text-primary" /> Instant scheduling after checkout
                </span>
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Actionable 30-day blueprint
                </span>
              </div>
            </div>

            {/* Pricing Card */}
            <div className="rounded-3xl border border-primary/20 bg-card p-8 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Paid Audit Engagement
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-semibold">Revenue Leak Diagnostic</h3>
                </div>
                <div className="text-right">
                  <p className="font-display text-4xl font-bold text-foreground">$297</p>
                  <p className="text-xs text-muted-foreground">One-time investment</p>
                </div>
              </div>

              <ul className="mt-6 space-y-3.5 text-sm text-muted-foreground">
                {[
                  "45-minute live audit session",
                  "Missed-call & after-hours leak evaluation",
                  "Estimate follow-up & stale quote analysis",
                  "Visual bottleneck & workflow map",
                  "Conservative recovery ROI model",
                  "100% credited toward $1,500 Pilot deposit",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <UnlockButton
                  kind="product"
                  slug="revenue-leak-diagnostic"
                  itemName="Revenue Leak Diagnostic ($297)"
                  priceCents={29700}
                  tier="premium"
                />
              </div>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Secure SSL & Stripe Checkout. Instant calendar booking upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              What You Receive
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Concrete answers, not generic automation advice.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Most service businesses lose 15%–30% of qualified leads simply due to delayed response times or un-followed estimates. We deliver a clear diagnostic report ready for immediate action.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {DELIVERABLES.map(({ Icon, title, body }) => (
              <article key={title} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Diagnostic vs Pilot Explanation */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> The Middle Rung Guarantee
                </span>
                <h2 className="mt-3 font-display text-3xl font-semibold">
                  Zero risk when you decide to build.
                </h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  We built the $297 Revenue Leak Diagnostic to remove friction. If you decide after the diagnostic that you want us to install and configure your 30-Day Recovery Pilot ($1,500), your full $297 purchase is applied directly to the pilot deposit.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/50 p-6">
                <h3 className="font-display text-lg font-semibold">How the credit works:</h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">Diagnostic Price</span>
                    <span className="font-semibold text-foreground">$297</span>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <span className="text-muted-foreground">30-Day Pilot Deposit (50%)</span>
                    <span className="font-semibold text-foreground">$750</span>
                  </div>
                  <div className="flex justify-between pt-1 text-primary">
                    <span className="font-semibold">Net Deposit Due for Pilot</span>
                    <span className="font-bold">$453</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/get-a-demo">View 30-Day Pilot Details <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Frequently Asked Questions</p>
        <h2 className="mt-2 font-display text-3xl font-semibold">Questions about the diagnostic.</h2>

        <div className="mt-8 space-y-4">
          {FAQS.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-border bg-card p-6">
              <summary className="cursor-pointer font-display text-lg font-semibold list-none flex justify-between items-center">
                {q}
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
