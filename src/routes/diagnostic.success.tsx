import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  PhoneCall,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { buildSeoMeta } from "@/lib/seo";
import { useEntitlements } from "@/hooks/use-entitlement";
import { DiagnosticIntakeForm } from "@/components/diagnostic-intake-form";

/** Matches the PREMIUM_CATALOG product slug the diagnostic is sold under. */
const DIAGNOSTIC_SLUG = "revenue-leak-diagnostic";

export const Route = createFileRoute("/diagnostic/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: (search.session_id as string) || "",
  }),
  head: () => {
    const seo = buildSeoMeta({
      title: "Diagnostic Payment Received | Melanated In Tech",
      description:
        "Your $297 Revenue Leak Diagnostic payment is confirmed. Schedule your 45-minute audit session.",
      url: "/diagnostic/success",
    });
    return {
      // robots must be a meta entry. A bare `robots:` key on this object is
      // silently dropped — TanStack Start only reads meta/links/scripts — which
      // left this receipt page indexable despite intending otherwise.
      meta: [...seo.meta, { name: "robots", content: "noindex, nofollow" }],
      links: seo.links,
    };
  },
  component: DiagnosticSuccessPage,
});

function DiagnosticSuccessPage() {
  // Payment is confirmed authoritatively by confirmCheckoutSession on
  // /checkout/return, which writes the entitlement before redirecting here. This
  // page therefore never verifies payment itself — the previous version polled
  // diagnostic_leads, a table nothing ever wrote to, so the spinner always ran
  // its full retry budget and then declared success anyway.
  //
  // Nothing here is gated on a lookup: the booking link is the thing the buyer
  // paid for and must render even if Supabase is unreachable.
  const { data: entitlements } = useEntitlements();
  const owned = (entitlements ?? []).some(
    (e: { kind: string; slug: string }) => e.kind === "product" && e.slug === DIAGNOSTIC_SLUG,
  );

  const bookingUrl =
    import.meta.env.VITE_DIAGNOSTIC_BOOKING_URL ||
    "https://calendly.com/melanatedintech/revenue-leak-diagnostic";

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--color-primary)_15%,transparent),transparent_40%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_85%,var(--color-muted)_15%))] py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/30 bg-card p-8 sm:p-12 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Melanated in Tech / Revenue Systems
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-500 border border-emerald-500/20">
                Payment Confirmed ($297)
              </span>
            </div>

            <div>
                <div className="mt-6 flex items-start gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary shrink-0">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div>
                    <h1 className="font-display text-3xl font-semibold sm:text-4xl text-foreground">
                      Payment received. Your diagnostic is ready to schedule.
                    </h1>
                    <p className="mt-2 text-base text-muted-foreground leading-relaxed">
                      Thank you for investing in your operational clarity. We have logged your payment and reserved your 45-minute Revenue Leak Diagnostic session.
                    </p>
                  </div>
                </div>

                {/* Next Steps / Preparation Checklist */}
                <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6 sm:p-8">
                  <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" /> Session Preparation Checklist
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    To get maximum ROI from our 45 minutes together, please have the following items accessible before your call:
                  </p>

                  <ul className="mt-5 space-y-3 text-sm text-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span><strong>Current Operating Software:</strong> Name of your dispatch, CRM, or scheduling software (e.g., ServiceTitan, Housecall Pro, Jobber, Excel).</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span><strong>Inquiry Volume:</strong> Approximate number of monthly calls, web leads, or estimate requests.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span><strong>Primary Bottleneck:</strong> One recent example of an after-hours missed lead, un-followed estimate, or manual handoff drop-off.</span>
                    </li>
                  </ul>
                </div>

                {/* Bounded Session Disclaimer */}
                <div className="mt-6 border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Bounded Session Notice:</strong> This is a structured, 45-minute working audit. It produces a concrete Revenue Leak Map & 30-Day Action Blueprint. 100% ($297) is credited toward our $1,500 Pilot deposit if you decide to build.
                  </p>
                </div>

                {/* CTA Action Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
                  >
                    <CalendarCheck className="h-4 w-4" /> Schedule Your 45-Minute Audit <ArrowRight className="h-4 w-4" />
                  </a>

                  <Button asChild variant="outline" className="rounded-xl px-6 py-3.5">
                    <Link to="/contact">Need Support / Questions?</Link>
                  </Button>
                </div>

                {/* Post-payment qualification. Shown only to a confirmed buyer —
                    the server function rejects anyone without the entitlement, so
                    rendering it to a non-owner would only produce a dead end. */}
                {owned ? (
                  <div className="mt-10 border-t border-border pt-8">
                    <DiagnosticIntakeForm />
                  </div>
                ) : null}
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
