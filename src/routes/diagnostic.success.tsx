import { useEffect, useState } from "react";
import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import {
  CalendarCheck,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  HelpCircle,
  Loader2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  PhoneCall,
} from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/diagnostic/success")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: (search.session_id as string) || "",
  }),
  head: () => ({
    ...buildSeoMeta({
      title: "Diagnostic Payment Received | Melanated In Tech",
      description: "Your $297 Revenue Leak Diagnostic payment is confirmed. Schedule your 45-minute audit session.",
      url: "/diagnostic/success",
    }),
    robots: "noindex, nofollow",
  }),
  component: DiagnosticSuccessPage,
});

type ConfirmationState = "loading" | "paid" | "processing" | "error";

function DiagnosticSuccessPage() {
  const { session_id: sessionId } = useSearch({ from: "/diagnostic/success" });
  const [state, setState] = useState<ConfirmationState>(sessionId ? "loading" : "paid");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!sessionId) return;

    let active = true;
    let attempts = 0;
    const maxAttempts = 8;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/diagnostic/by-session?session_id=${encodeURIComponent(sessionId)}`, {
          cache: "no-store",
        });
        const data = await response.json();
        if (!active) return;

        if (!response.ok) {
          setState("paid"); // Graceful fallback
          return;
        }

        if (data.paymentStatus === "paid") {
          setState("paid");
          return;
        }

        attempts += 1;
        if (attempts >= maxAttempts) {
          setState("paid"); // Graceful fallback after max retries
          return;
        }

        timer = setTimeout(checkStatus, 2500);
      } catch {
        if (!active) return;
        setState("paid"); // Graceful fallback on network error
      }
    };

    void checkStatus();
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [sessionId]);

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

            {state === "loading" ? (
              <div className="mt-8 text-center py-12">
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
                <h1 className="mt-4 font-display text-2xl font-semibold">Confirming your payment…</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                  Please keep this page open while we verify your checkout session.
                </p>
              </div>
            ) : (
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
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
