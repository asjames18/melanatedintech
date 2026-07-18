import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calculator, TrendingUp, DollarSign, Clock, Users, Sparkles, Copy } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { ToolGuide } from "@/components/tool-guide";
import { trackEvent } from "@/lib/analytics";

const GUIDE_DATA = {
  whatItIs: "An interactive financial return on investment (ROI) calculator for AI agent implementations.",
  whyUseIt: "Provides data-driven financial projections comparing estimated LLM API token costs against labor hours saved for business cases and leadership approval.",
  howToUse: [
    "Adjust team size and average employee hourly wage sliders.",
    "Select your target LLM API model (GPT-4o, Claude 3.5 Sonnet, Llama 3.3 70B, etc.) and estimated daily queries.",
    "Review monthly API costs vs. labor savings to see your Net Annual ROI ($) and Payback Period.",
  ],
};

export const Route = createFileRoute("/tools/roi-calculator")({
  head: () => {
    const seo = buildSeoMeta({
      title: "AI Token & Business ROI Calculator — Melanated In Tech",
      description:
        "Calculate AI agent API cost vs. business ROI. Estimate monthly token expenditure and annual labor savings for your team.",
      url: "/tools/roi-calculator",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "ROI Calculator", path: "/tools/roi-calculator" },
          ]),
        ),
      ],
    };
  },
  component: RoiCalculatorPage,
});

const MODELS = [
  { id: "gemini-flash", name: "Gemini 2.5 Flash", inputPerM: 0.15, outputPerM: 0.60, tier: "Lightweight" },
  { id: "gpt-4o-mini", name: "GPT-4o mini", inputPerM: 0.15, outputPerM: 0.60, tier: "Lightweight" },
  { id: "claude-haiku", name: "Claude 3.5 Haiku", inputPerM: 0.80, outputPerM: 4.00, tier: "Mid-tier" },
  { id: "gpt-4o", name: "GPT-4o", inputPerM: 2.50, outputPerM: 10.00, tier: "Flagship" },
  { id: "claude-sonnet", name: "Claude 3.7 Sonnet", inputPerM: 3.00, outputPerM: 15.00, tier: "Flagship" },
];

function RoiCalculatorPage() {
  const [teamSize, setTeamSize] = useState<number>(5);
  const [hourlyRate, setHourlyRate] = useState<number>(45);
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState<number>(4);
  const [queriesPerDay, setQueriesPerDay] = useState<number>(30);
  const [selectedModelId, setSelectedModelId] = useState<string>("gemini-flash");

  const model = useMemo(() => MODELS.find((m) => m.id === selectedModelId) ?? MODELS[0], [selectedModelId]);

  // Calculations
  const metrics = useMemo(() => {
    const workDaysPerMonth = 22;
    const totalMonthlyQueries = teamSize * queriesPerDay * workDaysPerMonth;
    
    // Avg 500 input tokens & 300 output tokens per query
    const totalInputTokensM = (totalMonthlyQueries * 500) / 1_000_000;
    const totalOutputTokensM = (totalMonthlyQueries * 300) / 1_000_000;

    const monthlyApiCost = totalInputTokensM * model.inputPerM + totalOutputTokensM * model.outputPerM;
    const monthlyHoursSaved = teamSize * hoursSavedPerWeek * 4.33;
    const monthlyLaborSavingsDollars = monthlyHoursSaved * hourlyRate;

    const netMonthlySavings = monthlyLaborSavingsDollars - monthlyApiCost;
    const netAnnualSavings = netMonthlySavings * 12;

    const roiMultiplier = monthlyApiCost > 0 ? (monthlyLaborSavingsDollars / monthlyApiCost).toFixed(1) : "N/A";

    return {
      monthlyApiCost: Math.max(0.5, monthlyApiCost),
      monthlyHoursSaved: Math.round(monthlyHoursSaved),
      monthlyLaborSavingsDollars: Math.round(monthlyLaborSavingsDollars),
      netAnnualSavings: Math.round(netAnnualSavings),
      roiMultiplier,
    };
  }, [teamSize, hourlyRate, hoursSavedPerWeek, queriesPerDay, model]);

  const handleShareResult = () => {
    const summaryText = `AI Agent ROI Estimate for Team of ${teamSize}:
- Monthly LLM API Cost: $${metrics.monthlyApiCost.toFixed(2)}
- Monthly Hours Saved: ${metrics.monthlyHoursSaved} hrs
- Monthly Labor Value: $${metrics.monthlyLaborSavingsDollars.toLocaleString()}
- Annual Net ROI: $${metrics.netAnnualSavings.toLocaleString()} (${metrics.roiMultiplier}x ROI)
Calculated via Melanated In Tech ROI Tool.`;

    navigator.clipboard.writeText(summaryText).then(
      () => {
        trackEvent("roi_calculator_share");
        toast.success("ROI Summary copied to clipboard!");
      },
      () => toast.error("Failed to copy summary.")
    );
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Utilities"
        title="AI Token & Business ROI Calculator."
        description="Quantify your financial return on investment when implementing AI agents. Calculate LLM API costs vs. labor hours saved for your team or organization."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ToolGuide guide={GUIDE_DATA} />
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Inputs Panel (Left Col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-bold flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Team & Usage Parameters
                </CardTitle>
                <CardDescription>Adjust sliders and values for your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <Label htmlFor="team-size flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 inline mr-1 text-primary" /> Team Size
                    </Label>
                    <span className="font-mono text-primary">{teamSize} people</span>
                  </div>
                  <Input
                    id="team-size"
                    type="number"
                    min={1}
                    max={500}
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <Label htmlFor="hourly-rate">
                      <DollarSign className="h-3.5 w-3.5 inline mr-1 text-emerald-500" /> Avg Hourly Rate / Salary Value
                    </Label>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">${hourlyRate}/hr</span>
                  </div>
                  <Input
                    id="hourly-rate"
                    type="number"
                    min={10}
                    max={500}
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value) || 10)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <Label htmlFor="hours-saved">
                      <Clock className="h-3.5 w-3.5 inline mr-1 text-amber-500" /> Hours Saved / Week per Employee
                    </Label>
                    <span className="font-mono text-amber-600 dark:text-amber-400">{hoursSavedPerWeek} hrs/week</span>
                  </div>
                  <Input
                    id="hours-saved"
                    type="number"
                    min={1}
                    max={40}
                    value={hoursSavedPerWeek}
                    onChange={(e) => setHoursSavedPerWeek(Number(e.target.value) || 1)}
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <Label htmlFor="queries-day">Daily AI Agent Queries per Person</Label>
                    <span className="font-mono">{queriesPerDay} queries/day</span>
                  </div>
                  <Input
                    id="queries-day"
                    type="number"
                    min={5}
                    max={500}
                    value={queriesPerDay}
                    onChange={(e) => setQueriesPerDay(Number(e.target.value) || 5)}
                  />
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <Label htmlFor="model-select" className="text-xs font-semibold">
                    AI Model Tier
                  </Label>
                  <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                    <SelectTrigger id="model-select">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} (${m.inputPerM}/1M input)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Overview (Right Col-span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="font-display text-xl font-bold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    Estimated Financial Return
                  </CardTitle>
                  <CardDescription>Based on model pricing and team labor savings</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleShareResult} className="gap-1.5">
                  <Copy className="h-3.5 w-3.5" /> Share Summary
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Big Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30 space-y-1">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                      Annual Net ROI Savings
                    </span>
                    <p className="font-display text-3xl font-bold text-emerald-600 dark:text-emerald-300">
                      ${metrics.netAnnualSavings.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground pt-1">
                      Net financial gain after deducting API costs.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-1">
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                      ROI Multiplier
                    </span>
                    <p className="font-display text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                      {metrics.roiMultiplier}x ROI
                    </p>
                    <p className="text-xs text-muted-foreground pt-1">
                      Return for every $1 spent on LLM API infrastructure.
                    </p>
                  </div>
                </div>

                {/* Detailed Breakdown Table */}
                <div className="space-y-3 pt-2 border-t border-border">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Monthly Operational Breakdown
                  </h4>
                  <div className="rounded-xl border border-border bg-muted/20 divide-y divide-border/60 text-xs">
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Selected Model:</span>
                      <span className="font-semibold text-foreground">{model.name}</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Est. Monthly LLM API Expense:</span>
                      <span className="font-mono font-bold text-foreground">${metrics.monthlyApiCost.toFixed(2)}/mo</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Total Team Hours Saved / Mo:</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{metrics.monthlyHoursSaved} hours</span>
                    </div>
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Monthly Value of Saved Labor:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${metrics.monthlyLaborSavingsDollars.toLocaleString()}/mo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <ToolCrossSell tool="roi-calculator" />
      </main>
    </SiteLayout>
  );
}
