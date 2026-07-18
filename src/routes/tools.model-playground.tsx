import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Play, RotateCcw, Sparkles, Timer, Hash, AlertTriangle, ArrowLeft } from "lucide-react";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { ToolGuide } from "@/components/tool-guide";
import { trackEvent } from "@/lib/analytics";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const GUIDE_DATA = {
  whatItIs: "A side-by-side LLM sandbox for comparing responses, latency, and token cost economics across multiple AI models.",
  whyUseIt: "Enables objective benchmarking of model quality, generation speed, and API costs before deploying an agent to production.",
  howToUse: [
    "Enter your System Prompt and User Test Query in the top control panel (or pick a Preset Benchmark).",
    "Select different AI models for Column 1, Column 2, or Column 3 (e.g. Llama 3.3 70B, Gemini 2.0, Qwen 2.5).",
    "Click 'Run Side-by-Side Comparison' to execute all models simultaneously and compare outputs and latency metrics.",
  ],
};

const searchSchema = z.object({
  systemPrompt: z.string().optional(),
  userMessage: z.string().optional(),
});

export const Route = createFileRoute("/tools/model-playground")({
  validateSearch: zodValidator(searchSchema),
  head: () => {
    const seo = buildSeoMeta({
      title: "Model Playground — Melanated In Tech",
      description:
        "Compare prompt outputs, generation speed, and token counts side-by-side across free AI models.",
      url: "/tools/model-playground",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "Model Playground", path: "/tools/model-playground" },
          ]),
        ),
      ],
    };
  },
  component: ModelPlaygroundPage,
});

const FREE_MODELS = [
  { id: "openrouter/openrouter/free", name: "Auto Free Router" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", name: "Llama 3.3 70B" },
  { id: "google/gemini-2.5-flash:free", name: "Gemini 2.5 Flash" },
  { id: "deepseek/deepseek-chat:free", name: "DeepSeek V3" },
  { id: "deepseek/deepseek-r1:free", name: "DeepSeek R1" },
  { id: "qwen/qwen-2.5-72b-instruct:free", name: "Qwen 2.5 72B" },
];

const PRESET_BENCHMARKS = [
  {
    name: "Logical Reasoning",
    system: "You are an expert analytical reasoner. Think step-by-step.",
    user: "A farmer has 17 sheep and all but 9 die. How many sheep does the farmer have left?",
  },
  {
    name: "Code Generation",
    system: "You are a senior TypeScript engineer. Output concise, production-ready code with types.",
    user: "Write a TypeScript function to safely parse a JSON string into a strongly-typed object with error handling.",
  },
  {
    name: "JSON Extraction",
    system: "You are a structured data extractor. Return strictly valid JSON with no markdown backticks.",
    user: "Extract name, company, and email from: 'Hi I'm Sarah Jenkins, CTO at NovaTech Labs. Reach out to sjenkins@novatech.io for inquiries.'",
  },
  {
    name: "Marketing Copy",
    system: "You are a creative copywriter for tech startups. Keep it engaging, punchy, and modern.",
    user: "Write 3 tagline variations for a zero-code AI agent builder for small business owners.",
  },
];

interface ColumnState {
  model: string;
  output: string;
  loading: boolean;
  error: string | null;
  duration: number | null; // in ms
  tokens: number | null;
  resolvedModel: string | null;
}

function ModelPlaygroundPage() {
  const { systemPrompt: initialSystem, userMessage: initialUser } = Route.useSearch();

  const [systemPrompt, setSystemPrompt] = useState(
    initialSystem ?? "You are a helpful, direct, and concise tech assistant.",
  );
  const [userMessage, setUserMessage] = useState(
    initialUser ?? "Explain the concept of an AI Agent in one short sentence.",
  );
  const [temperature, setTemperature] = useState("0.7");

  // State for the 3 comparison columns
  const [columns, setColumns] = useState<ColumnState[]>([
    {
      model: "meta-llama/llama-3.3-70b-instruct:free",
      output: "",
      loading: false,
      error: null,
      duration: null,
      tokens: null,
      resolvedModel: null,
    },
    {
      model: "google/gemini-2.5-flash:free",
      output: "",
      loading: false,
      error: null,
      duration: null,
      tokens: null,
      resolvedModel: null,
    },
    {
      model: "qwen/qwen-2.5-72b-instruct:free",
      output: "",
      loading: false,
      error: null,
      duration: null,
      tokens: null,
      resolvedModel: null,
    },
  ]);

  const updateColumnModel = (colIndex: number, newModel: string) => {
    setColumns((prev) =>
      prev.map((col, idx) => (idx === colIndex ? { ...col, model: newModel } : col)),
    );
  };

  const handleClear = () => {
    setSystemPrompt("");
    setUserMessage("");
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        output: "",
        loading: false,
        error: null,
        duration: null,
        tokens: null,
        resolvedModel: null,
      })),
    );
  };

  const runSingleColumn = async (colIndex: number, col: ColumnState) => {
    setColumns((prev) =>
      prev.map((c, idx) =>
        idx === colIndex
          ? {
              ...c,
              loading: true,
              error: null,
              output: "",
              duration: null,
              tokens: null,
              resolvedModel: null,
            }
          : c,
      ),
    );

    const startTime = performance.now();
    try {
      const response = await fetch("/api/public/agents/chat?env=sandbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userMessage }],
          model: col.model,
          override_system_prompt: systemPrompt,
          temperature: Number(temperature),
        }),
      });

      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error ?? `HTTP Error ${response.status}`);
      }

      setColumns((prev) =>
        prev.map((c, idx) =>
          idx === colIndex
            ? {
                ...c,
                loading: false,
                output: data?.content ?? data?.message?.content ?? "No output text received.",
                duration: durationMs,
                resolvedModel: data.activeModel ?? col.model,
                tokens: data.usage?.total_tokens ?? null,
              }
            : c,
        ),
      );
    } catch (err: unknown) {
      const endTime = performance.now();
      const durationMs = Math.round(endTime - startTime);

      setColumns((prev) =>
        prev.map((c, idx) =>
          idx === colIndex
            ? {
                ...c,
                loading: false,
                error: err instanceof Error ? err.message : "Failed to generate.",
                duration: durationMs,
              }
            : c,
        ),
      );
    }
  };

  const handleCompare = () => {
    if (!userMessage.trim()) {
      toast.warning("Please enter a user query message first.");
      return;
    }

    trackEvent("model_playground_run", { models: columns.map((c) => c.model) });
    toast.info("Running side-by-side comparison...");
    columns.forEach((col, index) => {
      runSingleColumn(index, col);
    });
  };

  const isAnyLoading = useMemo(() => columns.some((c) => c.loading), [columns]);

  return (
    <SiteLayout>
      <div className="border-b border-border bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/tools"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Tools Dashboard
          </Link>
        </div>
      </div>

      <PageHeader
        eyebrow="AI Developer Sandbox"
        title="Side-by-Side Playground"
        description="Write a prompt and test multiple free models at the same time. Instantly compare responses, response times, and token cost metrics."
      />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ToolGuide guide={GUIDE_DATA} />
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Settings Panel (Left Column) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Prompt Configurations
                </CardTitle>
                <CardDescription>
                  Configure instructions and prompt variables to send to the comparison deck.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                    Benchmark Presets (Click to Load)
                  </Label>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_BENCHMARKS.map((bm) => (
                      <button
                        key={bm.name}
                        onClick={() => {
                          setSystemPrompt(bm.system);
                          setUserMessage(bm.user);
                          toast.info(`Loaded benchmark: ${bm.name}`);
                        }}
                        className="rounded-full border border-border bg-secondary/60 px-2.5 py-1 text-[11px] font-medium text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        {bm.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="system-prompt"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    System Prompt
                  </Label>
                  <Textarea
                    id="system-prompt"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="E.g., You are a Python expert..."
                    rows={4}
                    className="resize-none font-mono text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="user-message"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    User Query / Input
                  </Label>
                  <Textarea
                    id="user-message"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Enter the query you want to test..."
                    rows={3}
                    className="resize-none text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="temperature"
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Temperature ({temperature})
                  </Label>
                  <Input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className="h-9 cursor-pointer"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <Button
                    onClick={handleCompare}
                    disabled={isAnyLoading}
                    className="flex-1 gap-1.5"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Run Comparison
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    disabled={isAnyLoading}
                    className="gap-1.5"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border bg-muted/30 shadow-none">
              <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
                <p className="font-semibold text-foreground">Why compare?</p>
                <p>
                  Free models have varying latencies, token parameters, and styling rules. Using
                  this playground helps you identify which model handles your specific prompt
                  context most efficiently before deploying your agent.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Comparison Deck (Right Column) */}
          <div className="lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-3">
              {columns.map((col, index) => (
                <div key={index} className="flex flex-col space-y-4">
                  {/* Select Model Dropdown */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Model {index + 1}
                    </Label>
                    <Select
                      value={col.model}
                      onValueChange={(val) => updateColumnModel(index, val)}
                      disabled={isAnyLoading}
                    >
                      <SelectTrigger className="w-full text-xs">
                        <SelectValue placeholder="Select Model" />
                      </SelectTrigger>
                      <SelectContent>
                        {FREE_MODELS.map((item) => (
                          <SelectItem key={item.id} value={item.id} className="text-xs">
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Output Card */}
                  <Card className="flex-1 flex flex-col border border-border bg-card shadow-sm min-h-[380px]">
                    <div className="border-b border-border/80 bg-muted/10 p-3 flex flex-wrap gap-2 items-center justify-between">
                      <span className="text-[10px] font-bold text-primary tracking-wider uppercase truncate max-w-[120px]">
                        {FREE_MODELS.find((m) => m.id === col.model)?.name ?? "Custom"}
                      </span>

                      {/* Performance Indicators */}
                      <div className="flex items-center gap-2">
                        {col.duration !== null && (
                          <span
                            className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium border ${
                              col.duration < 1500
                                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : col.duration < 3000
                                  ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                  : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            <Timer className="h-3 w-3" />
                            {col.duration}ms
                          </span>
                        )}
                        {col.tokens !== null && (
                          <span className="inline-flex items-center gap-0.5 rounded bg-blue-500/10 border border-blue-500/20 px-1 py-0.5 text-[10px] font-medium text-blue-600">
                            <Hash className="h-3 w-3" />
                            {col.tokens}
                          </span>
                        )}
                      </div>
                    </div>

                    <CardContent className="flex-1 flex flex-col p-4 text-xs font-sans">
                      {col.loading ? (
                        <div className="flex-1 flex flex-col justify-center items-center space-y-3">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <p className="text-[11px] text-muted-foreground animate-pulse">
                            Generating response...
                          </p>
                        </div>
                      ) : col.error ? (
                        <div className="flex-1 flex flex-col justify-center items-center text-center p-4 bg-destructive/5 rounded-xl border border-destructive/10">
                          <AlertTriangle className="h-6 w-6 text-destructive mb-2" />
                          <p className="font-semibold text-destructive">Generation Failed</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{col.error}</p>
                          <Button
                            onClick={() => runSingleColumn(index, col)}
                            size="sm"
                            variant="link"
                            className="mt-2 text-primary"
                          >
                            Retry
                          </Button>
                        </div>
                      ) : col.output ? (
                        <div className="flex-1 overflow-y-auto max-h-[350px] whitespace-pre-wrap leading-relaxed text-foreground select-text pr-1">
                          {col.output}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-center text-muted-foreground border border-dashed border-border/85 rounded-xl bg-muted/5">
                          <p className="text-[11px]">Playground Idle</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground/80">
                            Waiting to run query comparison.
                          </p>
                        </div>
                      )}
                    </CardContent>

                    {/* Resolved Model Footer info */}
                    {col.resolvedModel && col.resolvedModel !== col.model && (
                      <div className="border-t border-border/60 bg-muted/5 px-3 py-1.5 text-[9px] text-muted-foreground truncate">
                        Active model: {col.resolvedModel}
                      </div>
                    )}
                  </Card>
                </div>
              ))}
            </div>

            <ToolCrossSell tool="model-playground" />

            {/* Token Economics & Monthly Cost Estimator */}
            <section className="mt-12 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <Hash className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-foreground">Token Economics & Production Cost Estimator</h3>
                  <p className="text-xs text-muted-foreground">
                    Understand real-world production costs when scaling AI workflows from prototype to production.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { provider: "Gemini 2.5 Flash", inputCost: "$0.15 / 1M", outputCost: "$0.60 / 1M", est10k: "$0.75 / mo", est50k: "$3.75 / mo", badge: "Best Value" },
                  { provider: "DeepSeek V3", inputCost: "$0.27 / 1M", outputCost: "$1.10 / 1M", est10k: "$1.37 / mo", est50k: "$6.85 / mo", badge: "Open Weights" },
                  { provider: "GPT-4o mini", inputCost: "$0.15 / 1M", outputCost: "$0.60 / 1M", est10k: "$0.75 / mo", est50k: "$3.75 / mo", badge: "Lightweight" },
                  { provider: "Claude 3.7 Sonnet", inputCost: "$3.00 / 1M", outputCost: "$15.00 / 1M", est10k: "$18.00 / mo", est50k: "$90.00 / mo", badge: "Premium Reasoning" },
                ].map((tier) => (
                  <div key={tier.provider} className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{tier.provider}</span>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        {tier.badge}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t border-border/50">
                      <div className="flex justify-between"><span>Input Token Rate:</span> <span className="font-mono text-foreground">{tier.inputCost}</span></div>
                      <div className="flex justify-between"><span>Output Token Rate:</span> <span className="font-mono text-foreground">{tier.outputCost}</span></div>
                      <div className="flex justify-between font-medium text-foreground pt-1 border-t border-border/40"><span>Est. 10k queries/mo:</span> <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{tier.est10k}</span></div>
                      <div className="flex justify-between font-medium text-foreground"><span>Est. 50k queries/mo:</span> <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{tier.est50k}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
