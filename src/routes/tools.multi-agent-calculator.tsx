import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  Calculator,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Zap,
  Sparkles,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export const Route = createFileRoute("/tools/multi-agent-calculator")({
  head: () => {
    const seo = buildSeoMeta({
      title: "Multi-Agent Team Cost & Labor Savings Estimator — Melanated In Tech",
      description:
        "Calculate financial ROI, labor hours saved per month, and API infrastructure costs when deploying a multi-agent AI team.",
      url: "/tools/multi-agent-calculator",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "Multi-Agent Cost Calculator", path: "/tools/multi-agent-calculator" },
          ]),
        ),
      ],
    };
  },
  component: MultiAgentCalculator,
});

export function MultiAgentCalculator() {
  const [agentCount, setAgentCount] = useState<number>(3);
  const [tasksPerDay, setTasksPerDay] = useState<number>(50);
  const [humanHourlyRate, setHumanHourlyRate] = useState<number>(45);
  const [minutesPerHumanTask, setMinutesPerHumanTask] = useState<number>(30);

  // Financial calculations
  const monthlyHumanHours = Math.round((tasksPerDay * (minutesPerHumanTask / 60) * 22)); // 22 working days
  const monthlyHumanCost = Math.round(monthlyHumanHours * humanHourlyRate);

  // Estimated API token consumption (approx $0.02 per task execution)
  const monthlyAgentApiCost = Math.round(tasksPerDay * 22 * 0.05 * agentCount);
  const monthlyHostingCost = 29; // Standard cloud worker hosting
  const totalMonthlyAgentCost = monthlyAgentApiCost + monthlyHostingCost;

  const monthlyNetSavings = Math.max(0, monthlyHumanCost - totalMonthlyAgentCost);
  const annualNetSavings = monthlyNetSavings * 12;
  const roiPercentage = monthlyAgentApiCost > 0 ? Math.round((monthlyNetSavings / totalMonthlyAgentCost) * 100) : 0;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Financial Tool"
        title="Multi-Agent Team Cost & Labor Savings Estimator"
        description="Calculate monthly labor hours saved, API infrastructure costs, and annual financial ROI when deploying a team of autonomous AI agents."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Inputs */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
              <h3 className="font-display text-base font-bold text-foreground">
                Multi-Agent Team Parameters
              </h3>

              <div>
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-muted-foreground">Number of Active Agents</label>
                  <span className="font-mono font-bold text-primary">{agentCount} Agents</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={agentCount}
                  onChange={(e) => setAgentCount(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-muted-foreground">Automated Tasks / Day</label>
                  <span className="font-mono font-bold text-primary">{tasksPerDay} Tasks</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={tasksPerDay}
                  onChange={(e) => setTasksPerDay(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-muted-foreground">Est. Human Staff Rate ($/hr)</label>
                  <span className="font-mono font-bold text-primary">${humanHourlyRate}/hr</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={150}
                  step={5}
                  value={humanHourlyRate}
                  onChange={(e) => setHumanHourlyRate(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs">
                  <label className="font-semibold text-muted-foreground">Human Time Per Task (Mins)</label>
                  <span className="font-mono font-bold text-primary">{minutesPerHumanTask} Mins</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={120}
                  step={5}
                  value={minutesPerHumanTask}
                  onChange={(e) => setMinutesPerHumanTask(Number(e.target.value))}
                  className="mt-2 w-full accent-primary"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Financial Savings Projections
              </span>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5">
                  <p className="text-xs font-semibold text-muted-foreground">Est. Monthly Net Savings</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    ${monthlyNetSavings.toLocaleString()}
                  </p>
                  <p className="mt-1 text-[11px] font-mono text-muted-foreground">
                    (${annualNetSavings.toLocaleString()} / year)
                  </p>
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/10 p-5">
                  <p className="text-xs font-semibold text-muted-foreground">Monthly Hours Recovered</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-primary">
                    {monthlyHumanHours} hrs
                  </p>
                  <p className="mt-1 text-[11px] font-mono text-muted-foreground">
                    ~{(monthlyHumanHours / 160).toFixed(1)} Full-Time Staff Equivalent
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-border pt-6 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Estimated Manual Labor Cost:</span>
                  <span className="font-mono font-bold text-foreground">${monthlyHumanCost.toLocaleString()} / mo</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <span className="text-muted-foreground">Estimated AI API & Infrastructure Burn:</span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400">${totalMonthlyAgentCost.toLocaleString()} / mo</span>
                </div>
                <div className="flex justify-between py-1 font-bold text-sm text-foreground">
                  <span>Projected ROI:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">+{roiPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <ToolCrossSell currentToolSlug="multi-agent-calculator" />
      </section>
    </SiteLayout>
  );
}
