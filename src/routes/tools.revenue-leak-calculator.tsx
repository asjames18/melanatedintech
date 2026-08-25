import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  Calculator,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Download,
} from "lucide-react";

export const Route = createFileRoute("/tools/revenue-leak-calculator")({
  head: () => ({
    ...buildSeoMeta({
      title: "Lead Revenue Leak & Follow-Up Calculator — Melanated In Tech",
      description:
        "Calculate how much revenue your service business loses every year to missed calls, slow response times, and un-followed up estimates.",
      url: "/tools/revenue-leak-calculator",
    }),
  }),
  component: RevenueLeakCalculator,
});

export function RevenueLeakCalculator() {
  const [monthlyInquiries, setMonthlyInquiries] = useState(60);
  const [avgJobValue, setAvgJobValue] = useState(1200);
  const [missedCallRatePct, setMissedCallRatePct] = useState(25);
  const [slowFollowupPct, setSlowFollowupPct] = useState(30);

  // Calculations
  const monthlyMissedCalls = Math.round((monthlyInquiries * missedCallRatePct) / 100);
  const monthlySlowFollowups = Math.round((monthlyInquiries * slowFollowupPct) / 100);
  const totalLeakingLeadsMonthly = monthlyMissedCalls + monthlySlowFollowups;

  // Assuming 25% of leaking leads would have converted with instant AI response
  const recoverableConversionsMonthly = Math.round(totalLeakingLeadsMonthly * 0.25);
  const monthlyLostRevenue = recoverableConversionsMonthly * avgJobValue;
  const annualLostRevenue = monthlyLostRevenue * 12;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Financial Tool"
        title="Lead Revenue Leak & Follow-Up Calculator"
        description="Estimate how much revenue your business loses annually to unanswered calls, delayed responses, and stale quotes—and see how much an automated recovery system can recover."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold">Your Operating Numbers</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Adjust sliders to model your monthly inquiry volume and average client job size.
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Monthly Inquiries (Calls / Forms)</span>
                    <span className="text-primary font-bold">{monthlyInquiries} / mo</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={monthlyInquiries}
                    onChange={(e) => setMonthlyInquiries(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Average Deal / Job Value ($)</span>
                    <span className="text-primary font-bold">${avgJobValue.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={avgJobValue}
                    onChange={(e) => setAvgJobValue(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Missed Call / After-Hours Rate (%)</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {missedCallRatePct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={missedCallRatePct}
                    onChange={(e) => setMissedCallRatePct(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Follow-Up Delay & Stale Quote Rate (%)</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {slowFollowupPct}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={slowFollowupPct}
                    onChange={(e) => setSlowFollowupPct(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Impact Results */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-md">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-destructive">
                <AlertTriangle className="h-4 w-4" /> Annual Estimated Revenue Leak
              </div>

              <div className="mt-4 font-display text-4xl font-extrabold text-destructive sm:text-5xl">
                ${annualLostRevenue.toLocaleString()} <span className="text-base font-normal text-muted-foreground">/ year</span>
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                That is <strong className="text-foreground">${monthlyLostRevenue.toLocaleString()}/month</strong> in lost revenue left on the table due to response delays and uncaptured leads.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border pt-6">
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Leaking Leads / Mo</p>
                  <p className="mt-1 font-display text-xl font-bold text-amber-600 dark:text-amber-400">
                    {totalLeakingLeadsMonthly} leads
                  </p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <p className="text-xs text-muted-foreground">Recoverable / Mo</p>
                  <p className="mt-1 font-display text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {recoverableConversionsMonthly} jobs
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <h4 className="font-display text-sm font-bold">Plug Your Leaks in 30 Days</h4>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Our $297 Revenue Leak Diagnostic maps your exact response friction and guarantees a 100% credit toward a 30-Day Recovery Pilot.
                </p>
                <Link
                  to="/diagnostic"
                  onClick={() => trackEvent("diagnostic_click_from_calc", { annualLostRevenue })}
                  className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90"
                >
                  Book $297 Revenue Leak Diagnostic <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <ToolCrossSell tool="revenue-leak-calculator" />
      </section>
    </SiteLayout>
  );
}
