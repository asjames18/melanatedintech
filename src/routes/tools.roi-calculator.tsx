import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calculator, TrendingUp, DollarSign, Clock, Users, Sparkles, Copy, Search, RefreshCw, Check, Globe, Cpu } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { ToolGuide } from "@/components/tool-guide";
import { trackEvent } from "@/lib/analytics";
import { fetchLiveLlmPricing, LlmModelPricing } from "@/lib/public-apis.functions";

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

const FALLBACK_MODELS: LlmModelPricing[] = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5 Flash", provider: "GOOGLE", promptPricePerM: 0.15, completionPricePerM: 0.60, contextLength: 1000000 },
  { id: "openai/gpt-4o-mini", name: "GPT-4o mini", provider: "OPENAI", promptPricePerM: 0.15, completionPricePerM: 0.60, contextLength: 128000 },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku", provider: "ANTHROPIC", promptPricePerM: 0.80, completionPricePerM: 4.00, contextLength: 200000 },
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OPENAI", promptPricePerM: 2.50, completionPricePerM: 10.00, contextLength: 128000 },
  { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7 Sonnet", provider: "ANTHROPIC", promptPricePerM: 3.00, completionPricePerM: 15.00, contextLength: 200000 },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3", provider: "DEEPSEEK", promptPricePerM: 0.14, completionPricePerM: 0.28, contextLength: 64000 },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B", provider: "META", promptPricePerM: 0.35, completionPricePerM: 0.40, contextLength: 128000 },
];

function RoiCalculatorPage() {
  const [teamSize, setTeamSize] = useState<number>(5);
  const [hourlyRate, setHourlyRate] = useState<number>(45);
  const [hoursSavedPerWeek, setHoursSavedPerWeek] = useState<number>(4);
  const [queriesPerDay, setQueriesPerDay] = useState<number>(30);
  const [selectedModelId, setSelectedModelId] = useState<string>("google/gemini-2.5-flash");
  const [modelSearch, setModelSearch] = useState<string>("");

  const [liveModels, setLiveModels] = useState<LlmModelPricing[]>(FALLBACK_MODELS);
  const [isLoadingModels, setIsLoadingModels] = useState<boolean>(false);

  const loadModels = (query?: string) => {
    setIsLoadingModels(true);
    fetchLiveLlmPricing({ data: { limit: 150, query: query?.trim() } })
      .then((res) => {
        if (res && res.length > 0) {
          setLiveModels(res as LlmModelPricing[]);
        }
      })
      .catch((err) => console.warn("Failed fetching live LLM prices:", err))
      .finally(() => setIsLoadingModels(false));
  };

  useEffect(() => {
    loadModels();
  }, []);

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return liveModels;
    const q = modelSearch.trim().toLowerCase();
    return liveModels.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.provider.toLowerCase().includes(q)
    );
  }, [liveModels, modelSearch]);

  const currentModel = useMemo(() => {
    return liveModels.find((m) => m.id === selectedModelId) ?? liveModels[0] ?? FALLBACK_MODELS[0];
  }, [selectedModelId, liveModels]);

  // Calculations
  const metrics = useMemo(() => {
    const workDaysPerMonth = 22;
    const totalMonthlyQueries = teamSize * queriesPerDay * workDaysPerMonth;
    
    // Avg 500 input tokens & 300 output tokens per query
    const totalInputTokensM = (totalMonthlyQueries * 500) / 1_000_000;
    const totalOutputTokensM = (totalMonthlyQueries * 300) / 1_000_000;

    const monthlyApiCost = totalInputTokensM * currentModel.promptPricePerM + totalOutputTokensM * currentModel.completionPricePerM;
    const monthlyHoursSaved = teamSize * hoursSavedPerWeek * 4.33;
    const monthlyLaborSavingsDollars = monthlyHoursSaved * hourlyRate;

    const netMonthlySavings = monthlyLaborSavingsDollars - monthlyApiCost;
    const netAnnualSavings = netMonthlySavings * 12;

    const roiMultiplier = monthlyApiCost > 0 ? (monthlyLaborSavingsDollars / monthlyApiCost).toFixed(1) : "N/A";

    return {
      monthlyApiCost: Math.max(0.01, monthlyApiCost),
      monthlyHoursSaved: Math.round(monthlyHoursSaved),
      monthlyLaborSavingsDollars: Math.round(monthlyLaborSavingsDollars),
      netAnnualSavings: Math.round(netAnnualSavings),
      roiMultiplier,
    };
  }, [teamSize, hourlyRate, hoursSavedPerWeek, queriesPerDay, currentModel]);

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

                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="model-select" className="text-xs font-semibold flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-primary" /> AI Model & Live Pricing
                    </Label>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Globe className="h-3 w-3" /> Live OpenRouter API
                    </span>
                  </div>

                  {/* Search Input for Models */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search 150+ AI models (e.g. gpt-4o, claude, deepseek, llama)..."
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="pl-8 text-xs font-mono h-8 bg-background"
                    />
                  </div>

                  {/* Model Dropdown */}
                  <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                    <SelectTrigger id="model-select" className="text-xs font-mono">
                      <SelectValue placeholder="Select Model" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {filteredModels.length === 0 ? (
                        <div className="p-2 text-xs text-muted-foreground text-center">No matching models found.</div>
                      ) : (
                        filteredModels.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="text-xs font-mono">
                            <span className="font-medium text-foreground">{m.name}</span>{" "}
                            <span className="text-muted-foreground">
                              (${m.promptPricePerM}/1M in · ${m.completionPricePerM}/1M out)
                            </span>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  {/* Current Selected Model Price Details */}
                  {currentModel && (
                    <div className="p-2.5 rounded-lg border border-border bg-muted/20 text-[11px] font-mono space-y-1">
                      <div className="flex items-center justify-between font-semibold text-foreground">
                        <span>{currentModel.name}</span>
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{currentModel.provider}</span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>Input Rate: <strong className="text-emerald-600 dark:text-emerald-400">${currentModel.promptPricePerM}/1M</strong></span>
                        <span>Output Rate: <strong className="text-emerald-600 dark:text-emerald-400">${currentModel.completionPricePerM}/1M</strong></span>
                      </div>
                    </div>
                  )}
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
                      <span className="font-semibold text-foreground">{currentModel.name}</span>
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
