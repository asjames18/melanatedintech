import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Download, Loader2, Sparkles } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { buildSeoMeta } from "@/lib/seo";
import { verifyScorecardSession } from "@/lib/scorecard.functions";
import { ScorecardQuestionnaireForm } from "@/components/scorecard/scorecard-questionnaire-form";
import { getStripeEnvironment, hasPaymentsClientToken } from "@/lib/stripe";
import { SCORECARD_PDF_FILENAME } from "@/lib/scorecard-commerce";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/scorecard_/thank-you")({
  validateSearch: (search: Record<string, unknown>) => ({
    session_id: typeof search.session_id === "string" ? search.session_id : "",
  }),
  head: () => {
    const seo = buildSeoMeta({
      title: "Your Workflow Opportunity Scorecard | Melanated in Tech",
      description:
        "Payment received. Complete the short questionnaire to generate your scored Workflow Opportunity Scorecard PDF.",
      url: "/scorecard/thank-you",
    });
    return {
      meta: [...seo.meta, { name: "robots", content: "noindex, nofollow" }],
      links: seo.links,
    };
  },
  component: ScorecardThankYouPage,
});

type GateState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      email: string | null;
      name: string | null;
      alreadyCompleted: boolean;
      report: null | {
        opportunityScore: number;
        band: string;
        sprintFit: string;
        nextStep: string;
        nextStepLine?: string;
        pdfBase64: string | null;
        pdfFilename: string;
        buyerName: string;
      };
    };

function downloadPdf(base64: string, filename: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ScorecardThankYouPage() {
  const { session_id: sessionId } = Route.useSearch();
  const verifyFn = useServerFn(verifyScorecardSession);
  const [gate, setGate] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!sessionId) {
        setGate({
          status: "error",
          message:
            "Missing checkout session. Return from Stripe with a session_id, or reopen the link from your receipt.",
        });
        return;
      }
      try {
        const environment = hasPaymentsClientToken() ? getStripeEnvironment() : "live";
        const result = await verifyFn({ data: { sessionId, environment } });
        if (cancelled) return;
        if (!result.ok) {
          setGate({ status: "error", message: result.error });
          return;
        }
        trackEvent("scorecard_thank_you_viewed", {
          already_completed: result.alreadyCompleted,
        });
        setGate({
          status: "ready",
          email: result.email,
          name: result.name,
          alreadyCompleted: result.alreadyCompleted,
          report: result.report,
        });
      } catch (error) {
        if (cancelled) return;
        setGate({
          status: "error",
          message: error instanceof Error ? error.message : "Could not verify your payment.",
        });
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [sessionId, verifyFn]);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklch,var(--color-primary)_15%,transparent),transparent_40%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_85%,var(--color-muted)_15%))] py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-primary/30 bg-card p-6 sm:p-10 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Workflow Opportunity Scorecard
              </span>
              {gate.status === "ready" && (
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/20">
                  Payment confirmed
                </span>
              )}
            </div>

            {gate.status === "loading" && (
              <div className="mt-10 flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying your Stripe checkout session…
              </div>
            )}

            {gate.status === "error" && (
              <div className="mt-8 space-y-4">
                <div className="flex gap-3">
                  <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
                  <div>
                    <h1 className="font-display text-2xl font-semibold">We couldn’t unlock the questionnaire</h1>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{gate.message}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/scorecard">Back to Scorecard</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <a href="mailto:antonio@melanatedintech.com">Email support</a>
                  </Button>
                </div>
              </div>
            )}

            {gate.status === "ready" && gate.alreadyCompleted && gate.report && (
              <div className="mt-8 space-y-6">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-600" />
                  <div>
                    <h1 className="font-display text-2xl font-semibold sm:text-3xl">
                      Welcome back, {gate.report.buyerName || "there"}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      Opportunity score{" "}
                      <strong className="text-foreground">{gate.report.opportunityScore}</strong> (
                      {gate.report.band}) · Sprint fit:{" "}
                      <strong className="text-foreground">{gate.report.sprintFit}</strong>
                    </p>
                    {gate.report.nextStepLine && (
                      <p className="mt-3 text-sm text-muted-foreground">{gate.report.nextStepLine}</p>
                    )}
                  </div>
                </div>
                {gate.report.pdfBase64 ? (
                  <Button
                    className="gap-2"
                    onClick={() =>
                      downloadPdf(
                        gate.report!.pdfBase64!,
                        gate.report!.pdfFilename || SCORECARD_PDF_FILENAME,
                      )
                    }
                  >
                    <Download className="h-4 w-4" /> Download {SCORECARD_PDF_FILENAME}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Your report is on file. If the download is missing, reply to your fulfillment email.
                  </p>
                )}
              </div>
            )}

            {gate.status === "ready" && !gate.alreadyCompleted && (
              <div className="mt-8 space-y-6">
                <div>
                  <h1 className="font-display text-2xl font-semibold sm:text-3xl">
                    Payment received. Complete your Scorecard.
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    The Workflow Opportunity Scorecard is a self-serve snapshot. It is not the $297
                    AI Workflow Diagnostic and not the Workflow Opportunity Sprint.
                  </p>
                </div>
                <ScorecardQuestionnaireForm
                  sessionId={sessionId}
                  defaultEmail={gate.email}
                  defaultName={gate.name}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
