import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  Cpu,
  DollarSign,
  Layers,
  ArrowRight,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/tools/token-cost-calculator")({
  head: () => ({
    ...buildSeoMeta({
      title: "AI API Cost & Token Budget Estimator — Melanated In Tech",
      description:
        "Estimate monthly API costs for AI agents and LLMs across OpenAI GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro, and Llama 3.3 70B.",
      url: "/tools/token-cost-calculator",
    }),
  }),
  component: TokenCostCalculator,
});

interface ModelPricing {
  name: string;
  provider: string;
  inputPer1M: number;
  outputPer1M: number;
}

const MODELS: Record<string, ModelPricing> = {
  "gpt-4o": { name: "GPT-4o", provider: "OpenAI", inputPer1M: 2.5, outputPer1M: 10.0 },
  "gpt-4o-mini": { name: "GPT-4o mini", provider: "OpenAI", inputPer1M: 0.15, outputPer1M: 0.6 },
  "claude-3-5-sonnet": {
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    inputPer1M: 3.0,
    outputPer1M: 15.0,
  },
  "gemini-1-5-pro": {
    name: "Gemini 1.5 Pro",
    provider: "Google",
    inputPer1M: 1.25,
    outputPer1M: 5.0,
  },
  "llama-3-3-70b": {
    name: "Llama 3.3 70B (Groq)",
    provider: "Meta / Groq",
    inputPer1M: 0.59,
    outputPer1M: 0.79,
  },
  "deepseek-r1": {
    name: "DeepSeek R1",
    provider: "DeepSeek",
    inputPer1M: 0.55,
    outputPer1M: 2.19,
  },
};

export function TokenCostCalculator() {
  const [dailyRequests, setDailyRequests] = useState(250);
  const [avgInputTokens, setAvgInputTokens] = useState(800);
  const [avgOutputTokens, setAvgOutputTokens] = useState(300);
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini");

  const monthlyRequests = dailyRequests * 30;
  const totalMonthlyInputM = (monthlyRequests * avgInputTokens) / 1000000;
  const totalMonthlyOutputM = (monthlyRequests * avgOutputTokens) / 1000000;

  const calculateCost = (mKey: string) => {
    const m = MODELS[mKey];
    const inputCost = totalMonthlyInputM * m.inputPer1M;
    const outputCost = totalMonthlyOutputM * m.outputPer1M;
    return inputCost + outputCost;
  };

  const selectedCost = calculateCost(selectedModel);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Benchmarking Tool"
        title="AI API Cost & Token Budget Estimator"
        description="Estimate monthly LLM API spending for your AI agents across OpenAI, Anthropic Claude, Google Gemini, and Llama 3 models based on token usage."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Inputs */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold">Usage Parameters</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Set expected daily API request volume and average token sizes per turn.
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Daily Agent Queries / API Calls</span>
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
                    ~{(monthlyRequests).toLocaleString()} queries per month
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-sm font-semibold">
                    <span>Avg. Input Tokens (Prompt + History)</span>
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
          </div>

          {/* Pricing Comparison Grid */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display text-lg font-bold">Estimated Monthly Model Cost</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Comparing costs for {monthlyRequests.toLocaleString()} queries ({totalMonthlyInputM.toFixed(2)}M input + {totalMonthlyOutputM.toFixed(2)}M output tokens/mo).
              </p>

              <div className="mt-6 space-y-3">
                {Object.entries(MODELS).map(([key, model]) => {
                  const cost = calculateCost(key);
                  const isSelected = key === selectedModel;
                  return (
                    <div
                      key={key}
                      onClick={() => setSelectedModel(key)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-muted/20 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-display text-sm font-bold">{model.name}</p>
                          <p className="text-[11px] text-muted-foreground">{model.provider}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg font-extrabold text-foreground">
                            ${cost < 1 ? cost.toFixed(2) : Math.round(cost).toLocaleString()}{" "}
                            <span className="text-xs font-normal text-muted-foreground">/ mo</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            ${model.inputPer1M}/1M in · ${model.outputPer1M}/1M out
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-xl border border-border bg-muted/40 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <Info className="h-4 w-4" /> Optimization Tip
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Using a model router (e.g. routing simple SMS replies to GPT-4o mini and complex multi-step reasoning to Claude 3.5 Sonnet) can cut total monthly API spending by up to 70%.
                </p>
              </div>
            </div>
          </div>
        </div>

        <ToolCrossSell currentToolSlug="token-cost-calculator" />
      </section>
    </SiteLayout>
  );
}
