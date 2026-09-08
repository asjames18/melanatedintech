import { Link } from "@tanstack/react-router";
import { Check, X, Sparkles, ArrowRight, Shield, Award, HelpCircle } from "lucide-react";
import type { AiComparison } from "@/lib/ai-tools-data";
import { getAiTool } from "@/lib/ai-tools-data";
import { Button } from "@/components/ui/button";
import { AiLeadModal } from "./ai-lead-modal";

interface AiComparisonTableProps {
  comparison: AiComparison;
}

export function AiComparisonTable({ comparison }: AiComparisonTableProps) {
  const toolA = getAiTool(comparison.toolA.slug);
  const toolB = getAiTool(comparison.toolB.slug);

  return (
    <div className="space-y-8">
      {/* Quick Summary Banner */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Award className="h-4 w-4" />
          <span>MIT Editorial Verdict</span>
        </div>
        <p className="mt-2 text-base font-semibold text-foreground leading-relaxed">
          {comparison.verdict}
        </p>
      </div>

      {/* Side-by-Side Comparison Table (horizontally scrollable on mobile) */}
      <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="p-4 sm:p-5 font-bold text-foreground w-1/3">Feature / Criterion</th>
                <th className="p-4 sm:p-5 font-bold text-primary w-1/3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/ai-tools/$slug"
                      params={{ slug: comparison.toolA.slug }}
                      className="hover:underline transition-colors font-bold text-sm sm:text-base text-primary"
                    >
                      {comparison.toolA.name}
                    </Link>
                    {toolA && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary shrink-0">
                        MIT {toolA.mitRecommendationScore}%
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-4 sm:p-5 font-bold text-emerald-600 dark:text-emerald-400 w-1/3">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      to="/ai-tools/$slug"
                      params={{ slug: comparison.toolB.slug }}
                      className="hover:underline transition-colors font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400"
                    >
                      {comparison.toolB.name}
                    </Link>
                    {toolB && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                        MIT {toolB.mitRecommendationScore}%
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {/* Category Breakdown */}
              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20">Category</td>
                <td className="p-4 font-medium text-foreground">{toolA?.primaryCategory ?? "N/A"}</td>
                <td className="p-4 font-medium text-foreground">{toolB?.primaryCategory ?? "N/A"}</td>
              </tr>

              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20">Starting Price</td>
                <td className="p-4 font-medium text-foreground">{toolA?.startingPrice ?? "N/A"}</td>
                <td className="p-4 font-medium text-foreground">{toolB?.startingPrice ?? "N/A"}</td>
              </tr>

              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20">Free Tier / Trial</td>
                <td className="p-4 font-medium text-foreground">
                  {toolA?.freePlan ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <Check className="h-4 w-4" /> Yes
                    </span>
                  ) : toolA?.freeTrial ? (
                    "Free Trial"
                  ) : (
                    "Paid Only"
                  )}
                </td>
                <td className="p-4 font-medium text-foreground">
                  {toolB?.freePlan ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <Check className="h-4 w-4" /> Yes
                    </span>
                  ) : toolB?.freeTrial ? (
                    "Free Trial"
                  ) : (
                    "Paid Only"
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20">Self-Hosting Available</td>
                <td className="p-4 font-medium text-foreground">
                  {toolA?.selfHosted ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <Check className="h-4 w-4" /> Yes (Docker / On-Premise)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <X className="h-4 w-4" /> Cloud SaaS only
                    </span>
                  )}
                </td>
                <td className="p-4 font-medium text-foreground">
                  {toolB?.selfHosted ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                      <Check className="h-4 w-4" /> Yes (Docker / On-Premise)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <X className="h-4 w-4" /> Cloud SaaS only
                    </span>
                  )}
                </td>
              </tr>

              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20">Open Source</td>
                <td className="p-4 font-medium text-foreground">
                  {toolA?.openSource ? "Yes (Open Source)" : "Proprietary"}
                </td>
                <td className="p-4 font-medium text-foreground">
                  {toolB?.openSource ? "Yes (Open Source)" : "Proprietary"}
                </td>
              </tr>

              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20">API Available</td>
                <td className="p-4 font-medium text-foreground">
                  {toolA?.apiAvailable ? "Yes" : "No"}
                </td>
                <td className="p-4 font-medium text-foreground">
                  {toolB?.apiAvailable ? "Yes" : "No"}
                </td>
              </tr>

              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20">SOC 2 / Compliance</td>
                <td className="p-4 font-medium text-foreground">
                  {toolA?.enterpriseReadiness.soc2Status ?? "None"}
                </td>
                <td className="p-4 font-medium text-foreground">
                  {toolB?.enterpriseReadiness.soc2Status ?? "None"}
                </td>
              </tr>

              {/* Criteria Detailed Analysis */}
              {comparison.criteriaBreakdown.map((row) => (
                <tr key={row.criterion}>
                  <td className="p-4 font-semibold text-muted-foreground bg-muted/20 align-top">
                    {row.criterion}
                  </td>
                  <td
                    className={`p-4 align-top leading-relaxed ${
                      row.advantage === "Tool A"
                        ? "bg-primary/5 font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.toolAAssessment}
                  </td>
                  <td
                    className={`p-4 align-top leading-relaxed ${
                      row.advantage === "Tool B"
                        ? "bg-emerald-500/5 font-medium text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {row.toolBAssessment}
                  </td>
                </tr>
              ))}

              {/* Best For Row */}
              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20 align-top">Best For</td>
                <td className="p-4 align-top text-foreground leading-relaxed">{toolA?.bestFor}</td>
                <td className="p-4 align-top text-foreground leading-relaxed">{toolB?.bestFor}</td>
              </tr>

              {/* Dedicated Profile Action Row */}
              <tr>
                <td className="p-4 font-semibold text-muted-foreground bg-muted/20 align-middle">Deep Dive</td>
                <td className="p-4 align-middle">
                  <Link
                    to="/ai-tools/$slug"
                    params={{ slug: comparison.toolA.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <span>View {comparison.toolA.name} Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
                <td className="p-4 align-middle">
                  <Link
                    to="/ai-tools/$slug"
                    params={{ slug: comparison.toolB.slug }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>View {comparison.toolB.name} Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* MIT Recommendation by User Persona */}
      <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Which One Fits Your Role?
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparison.mitVerdictByPersona.map((verdict) => (
            <div
              key={verdict.persona}
              className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-1.5"
            >
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                For {verdict.persona}s
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {verdict.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Conversion CTA */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-lg font-bold text-foreground">
            Still not sure which one fits your workflow?
          </h4>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md">
            Describe what you are trying to automate. Our AI Stack Builder will recommend the exact right combination for your budget and technical level.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/ai-stack-builder"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs sm:text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
          >
            <span>Find My AI Stack</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <AiLeadModal
            buttonText="Talk to MIT"
            buttonVariant="outline"
            defaultProblem={`Comparing ${comparison.toolA.name} and ${comparison.toolB.name} for our organization`}
          />
        </div>
      </div>
    </div>
  );
}
