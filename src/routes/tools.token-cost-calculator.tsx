import { useState, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  Cpu,
  Search,
  RefreshCw,
  Sparkles,
  Info,
  CheckCircle2,
  Filter,
  Plus,
  Trash2,
} from "lucide-react";

export const Route = createFileRoute("/tools/token-cost-calculator")({
  head: () => {
    const seo = buildSeoMeta({
      title: "OpenRouter AI API Cost & Token Budget Estimator — Melanated In Tech",
      description:
        "Calculate monthly API costs across 200+ up-to-date AI models fetched live from OpenRouter (DeepSeek R1, GPT-4o, Claude 3.5, Gemini 2.0, Llama 3.3).",
      url: "/tools/token-cost-calculator",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "Token Cost Estimator", path: "/tools/token-cost-calculator" },
          ]),
        ),
      ],
    };
  },
  component: TokenCostCalculator,
});

export interface OpenRouterModel {
  id: string;
  name: string;
  provider: string;
  inputPer1M: number;
  outputPer1M: number;
  contextLength: number;
}

// Fallback list of modern models
const FALLBACK_MODELS: OpenRouterModel[] = [
  {
    id: "deepseek/deepseek-r1",
    name: "DeepSeek: R1 (Reasoning)",
    provider: "DeepSeek",
    inputPer1M: 0.55,
    outputPer1M: 2.19,
    contextLength: 16384,
  },
  {
    id: "openai/gpt-4o-2024-11-20",
    name: "OpenAI: GPT-4o (Latest)",
    provider: "OpenAI",
    inputPer1M: 2.5,
    outputPer1M: 10.0,
    contextLength: 128000,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "OpenAI: GPT-4o-mini",
    provider: "OpenAI",
    inputPer1M: 0.15,
    outputPer1M: 0.6,
    contextLength: 128000,
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Anthropic: Claude 3.5 Sonnet",
    provider: "Anthropic",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
    contextLength: 200000,
  },
  {
    id: "google/gemini-2.0-flash-001",
    name: "Google: Gemini 2.0 Flash",
    provider: "Google",
    inputPer1M: 0.1,
    outputPer1M: 0.4,
    contextLength: 1048576,
  },
  {
    id: "google/gemini-1.5-pro",
    name: "Google: Gemini 1.5 Pro",
    provider: "Google",
    inputPer1M: 1.25,
    outputPer1M: 5.0,
    contextLength: 2000000,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Meta: Llama 3.3 70B Instruct",
    provider: "Meta",
    inputPer1M: 0.12,
    outputPer1M: 0.3,
    contextLength: 128000,
  },
  {
    id: "mistralai/mistral-large-2411",
    name: "Mistral: Mistral Large 2411",
    provider: "Mistral",
    inputPer1M: 2.0,
    outputPer1M: 6.0,
    contextLength: 128000,
  },
  {
    id: "qwen/qwen-2.5-72b-instruct",
    name: "Qwen: Qwen 2.5 72B Instruct",
    provider: "Qwen",
    inputPer1M: 0.35,
    outputPer1M: 0.4,
    contextLength: 32768,
  },
];

export function TokenCostCalculator() {
  const [dailyRequests, setDailyRequests] = useState(250);
  const [avgInputTokens, setAvgInputTokens] = useState(800);
  const [avgOutputTokens, setAvgOutputTokens] = useState(300);

  const [models, setModels] = useState<OpenRouterModel[]>(FALLBACK_MODELS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("All");

  // Selected models to compare
  const [comparedModelIds, setComparedModelIds] = useState<string[]>([
    "deepseek/deepseek-r1",
    "openai/gpt-4o-2024-11-20",
    "openai/gpt-4o-mini",
    "anthropic/claude-3.5-sonnet",
    "google/gemini-2.0-flash-001",
  ]);

  // Fetch live OpenRouter model info on load
  const fetchOpenRouterModels = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models");
      if (!res.ok) throw new Error("Failed to fetch OpenRouter models");
      const json = await res.json();
      if (Array.isArray(json.data) && json.data.length > 0) {
        const parsed: OpenRouterModel[] = json.data
          .map((m: any) => {
            const promptPrice = Number(m.pricing?.prompt ?? 0) * 1000000;
            const completionPrice = Number(m.pricing?.completion ?? 0) * 1000000;
            const provider = m.id.split("/")[0] || "Other";
            return {
              id: m.id,
              name: m.name || m.id,
              provider: provider.charAt(0).toUpperCase() + provider.slice(1),
              inputPer1M: Math.round(promptPrice * 1000) / 1000,
              outputPer1M: Math.round(completionPrice * 1000) / 1000,
              contextLength: m.context_length || 0,
            };
          })
          .filter((m: OpenRouterModel) => m.inputPer1M >= 0 && m.outputPer1M >= 0);

        if (parsed.length > 0) {
          setModels(parsed);
          trackEvent("openrouter_models_fetched", { count: parsed.length });
        }
      }
    } catch (err) {
      console.warn("Could not fetch OpenRouter models, using fallback list", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenRouterModels();
  }, []);

  const providers = useMemo(() => {
    const set = new Set(models.map((m) => m.provider));
    return ["All", ...Array.from(set).sort()];
  }, [models]);

  const filteredModels = useMemo(() => {
    return models.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProvider =
        selectedProvider === "All" ||
        m.provider.toLowerCase() === selectedProvider.toLowerCase();
      return matchesSearch && matchesProvider;
    });
  }, [models, searchQuery, selectedProvider]);

  const monthlyRequests = dailyRequests * 30;
  const totalMonthlyInputM = (monthlyRequests * avgInputTokens) / 1000000;
  const totalMonthlyOutputM = (monthlyRequests * avgOutputTokens) / 1000000;

  const calculateCost = (m: OpenRouterModel) => {
    const inputCost = totalMonthlyInputM * m.inputPer1M;
    const outputCost = totalMonthlyOutputM * m.outputPer1M;
    return inputCost + outputCost;
  };

  const toggleModelComparison = (id: string) => {
    if (comparedModelIds.includes(id)) {
      if (comparedModelIds.length > 1) {
        setComparedModelIds(comparedModelIds.filter((mId) => mId !== id));
      }
    } else {
      setComparedModelIds([...comparedModelIds, id]);
    }
  };

  const comparedModelsList = useMemo(() => {
    return comparedModelIds
      .map((id) => models.find((m) => m.id === id))
      .filter((m): m is OpenRouterModel => m !== undefined)
      .sort((a, b) => calculateCost(a) - calculateCost(b));
  }, [comparedModelIds, models, totalMonthlyInputM, totalMonthlyOutputM]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Benchmarking Tool"
        title="OpenRouter AI API Cost & Token Estimator"
        description="Select and compare live API costs for 200+ models fetched in real time from OpenRouter (DeepSeek R1, GPT-4o, Claude 3.5, Gemini 2.0, Llama 3.3)."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Controls & Usage Parameters */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold">Usage Parameters</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Set expected daily request volume and average token sizes per turn.
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Daily Agent Queries / Calls</span>
                    <span className="text-primary font-bold">{dailyRequests} / day</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="5000"
                    step="10"
                    value={dailyRequests}
                    onChange={(e) => setDailyRequests(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    ~{monthlyRequests.toLocaleString()} queries per month
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Avg. Input Tokens (Prompt + System)</span>
                    <span className="text-primary font-bold">{avgInputTokens} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={avgInputTokens}
                    onChange={(e) => setAvgInputTokens(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Avg. Output Tokens (Completion)</span>
                    <span className="text-primary font-bold">{avgOutputTokens} tokens</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="4000"
                    step="50"
                    value={avgOutputTokens}
                    onChange={(e) => setAvgOutputTokens(Number(e.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </div>
              </div>
            </div>

            {/* Live OpenRouter Model Picker & Search */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-sm font-bold">Pick Models to Compare</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Live OpenRouter catalog ({models.length} models)
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={fetchOpenRouterModels}
                  disabled={loading}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary" : ""}`} />
                </Button>
              </div>

              <div className="mt-4 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search model (e.g. DeepSeek, Claude, Gemini)..."
                    className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs font-medium focus:border-primary focus:outline-none"
                >
                  {providers.slice(0, 10).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 max-h-[260px] space-y-1.5 overflow-y-auto pr-1">
                {filteredModels.slice(0, 30).map((m) => {
                  const isChecked = comparedModelIds.includes(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleModelComparison(m.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-xs transition-colors ${
                        isChecked
                          ? "border-primary bg-primary/10 font-medium text-foreground"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/40"
                      }`}
                    >
                      <span className="truncate max-w-[200px]">{m.name}</span>
                      <span className="font-mono text-[10px]">
                        ${m.inputPer1M}/1M in · ${m.outputPer1M}/1M out
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Results */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold">Estimated Monthly Model Cost</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Based on {monthlyRequests.toLocaleString()} queries ({totalMonthlyInputM.toFixed(2)}M prompt + {totalMonthlyOutputM.toFixed(2)}M completion tokens/mo)
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                  {comparedModelsList.length} Models Selected
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {comparedModelsList.map((model, idx) => {
                  const cost = calculateCost(model);
                  const isCheapest = idx === 0;
                  return (
                    <div
                      key={model.id}
                      className={`relative rounded-xl border p-4 transition-all ${
                        isCheapest
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-display text-base font-bold text-foreground">
                              {model.name}
                            </span>
                            {isCheapest && (
                              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                Lowest Cost
                              </span>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {model.provider} · Context: {model.contextLength > 0 ? `${(model.contextLength / 1000).toFixed(0)}k tokens` : "Standard"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-display text-2xl font-extrabold text-foreground">
                              ${cost < 1 ? cost.toFixed(2) : Math.round(cost).toLocaleString()}{" "}
                              <span className="text-xs font-normal text-muted-foreground">/ mo</span>
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              ${model.inputPer1M}/1M prompt · ${model.outputPer1M}/1M completion
                            </p>
                          </div>

                          {comparedModelIds.length > 1 && (
                            <button
                              onClick={() => toggleModelComparison(model.id)}
                              className="text-muted-foreground transition-colors hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Sparkles className="h-4 w-4" /> OpenRouter Routing Optimization
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  By using OpenRouter model routing, you can route routine tasks to low-cost fast models like <strong>Gemini 2.0 Flash ($0.10/1M)</strong> and complex reasoning to <strong>DeepSeek R1 ($0.55/1M)</strong> to save up to 80% on monthly LLM budgets.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ToolCrossSell tool="token-cost-calculator" />
      </section>
    </SiteLayout>
  );
}
