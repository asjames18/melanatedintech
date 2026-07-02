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
import { buildSeoMeta } from "@/lib/seo";
import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  systemPrompt: z.string().optional(),
  userMessage: z.string().optional(),
});

export const Route = createFileRoute("/tools/model-playground")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    ...buildSeoMeta({
      title: "Model Playground — Melanated In Tech",
      description:
        "Compare prompt outputs, generation speed, and token counts side-by-side across free AI models.",
      url: "/tools/model-playground",
    }),
  }),
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
          </div>
        </div>
      </main>
    </SiteLayout>
  );
}
