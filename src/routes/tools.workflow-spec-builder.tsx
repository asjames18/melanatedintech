import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta, ldScript, breadcrumbLd } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  Workflow,
  Sparkles,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Plus,
  Trash2,
  Code2,
  FileJson,
  Layers,
} from "lucide-react";

export const Route = createFileRoute("/tools/workflow-spec-builder")({
  head: () => {
    const seo = buildSeoMeta({
      title: "AI Automation Workflow Spec Builder — Melanated In Tech",
      description:
        "Visually build AI automation workflows and export ready-to-import blueprints for Zapier, Make.com, n8n, and webhooks.",
      url: "/tools/workflow-spec-builder",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          breadcrumbLd([
            { name: "AI Tools", path: "/tools" },
            { name: "Workflow Spec Builder", path: "/tools/workflow-spec-builder" },
          ]),
        ),
      ],
    };
  },
  component: WorkflowSpecBuilder,
});

type Platform = "zapier" | "make" | "n8n" | "webhook";

interface Step {
  id: string;
  name: string;
  type: "trigger" | "ai" | "action" | "filter";
  details: string;
}

export function WorkflowSpecBuilder() {
  const [workflowName, setWorkflowName] = useState("Missed Call Revenue Recovery Automation");
  const [platform, setPlatform] = useState<Platform>("zapier");
  const [steps, setSteps] = useState<Step[]>([
    {
      id: "1",
      name: "Inbound Phone Call Missed",
      type: "trigger",
      details: "Twilio / OpenPhone webhook fires when an incoming client call goes unanswered.",
    },
    {
      id: "2",
      name: "AI Lead Classifier & Intent Parser",
      type: "ai",
      details:
        "AI extracts customer name, urgency, and service requested from voicemail or caller ID.",
    },
    {
      id: "3",
      name: "Check if Existing Client in CRM",
      type: "filter",
      details: "Search CRM database for phone number to determine existing account status.",
    },
    {
      id: "4",
      name: "Send Instant SMS Follow-up & Booking Link",
      type: "action",
      details: "Send personalized SMS with calendar link and notify staff via Slack.",
    },
  ]);

  const [copied, setCopied] = useState(false);

  const addStep = (type: Step["type"]) => {
    const newStep: Step = {
      id: Date.now().toString(),
      name:
        type === "ai"
          ? "AI Summary & Data Extractor"
          : type === "action"
            ? "Send SMS / Update CRM"
            : type === "filter"
              ? "Condition Check"
              : "New Event Trigger",
      type,
      details: "Configure details for this step.",
    };
    setSteps([...steps, newStep]);
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter((s) => s.id !== id));
  };

  const updateStep = (id: string, field: "name" | "details", val: string) => {
    setSteps(steps.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const generateExport = () => {
    if (platform === "zapier") {
      return JSON.stringify(
        {
          title: workflowName,
          platform: "Zapier",
          version: "1.0",
          steps: steps.map((s, idx) => ({
            step_number: idx + 1,
            step_type: s.type.toUpperCase(),
            action_name: s.name,
            config: s.details,
          })),
        },
        null,
        2,
      );
    }
    if (platform === "make") {
      return JSON.stringify(
        {
          name: workflowName,
          flow: steps.map((s, idx) => ({
            id: idx + 1,
            module: `builtin:${s.type}`,
            metadata: { title: s.name, description: s.details },
          })),
        },
        null,
        2,
      );
    }
    if (platform === "n8n") {
      return JSON.stringify(
        {
          name: workflowName,
          nodes: steps.map((s, idx) => ({
            parameters: { note: s.details },
            name: s.name,
            type: `n8n-nodes-base.${s.type}`,
            position: [250 * (idx + 1), 300],
          })),
        },
        null,
        2,
      );
    }
    return JSON.stringify(
      {
        workflow_name: workflowName,
        webhook_spec: {
          event: "inbound_trigger",
          payload_fields: ["caller_phone", "timestamp", "audio_url"],
          pipeline: steps,
        },
      },
      null,
      2,
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateExport());
    setCopied(true);
    trackEvent("tool_export", { tool: "workflow_spec_builder", platform });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Workbench Tool"
        title="AI Automation Workflow Spec Builder"
        description="Design visual AI automation pipelines and instantly export ready-to-import blueprints for Zapier, Make.com, n8n, or raw Webhooks."
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Builder Column */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <label className="text-xs font-semibold uppercase tracking-wider text-primary">
                Workflow Title
              </label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-2.5 font-display text-lg font-semibold text-foreground focus:border-primary focus:outline-none"
              />

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pipeline Steps ({steps.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addStep("ai")}
                    className="gap-1 text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> + AI Step
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addStep("action")}
                    className="gap-1 text-xs"
                  >
                    <Zap className="h-3.5 w-3.5 text-emerald-500" /> + Action
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addStep("filter")}
                    className="gap-1 text-xs"
                  >
                    <Layers className="h-3.5 w-3.5 text-blue-500" /> + Filter
                  </Button>
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {steps.map((s, idx) => (
                  <div
                    key={s.id}
                    className="group relative rounded-xl border border-border bg-muted/30 p-4 transition-all hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {idx + 1}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            s.type === "trigger"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : s.type === "ai"
                                ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                                : s.type === "action"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {s.type}
                        </span>
                      </div>
                      {steps.length > 1 && (
                        <button
                          onClick={() => removeStep(s.id)}
                          className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => updateStep(s.id, "name", e.target.value)}
                      className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm font-semibold focus:border-primary focus:outline-none"
                    />

                    <textarea
                      rows={2}
                      value={s.details}
                      onChange={(e) => updateStep(s.id, "details", e.target.value)}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Column */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Export Blueprint Format
                </p>
                <FileJson className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="mt-3 grid grid-cols-4 gap-2">
                {(["zapier", "make", "n8n", "webhook"] as Platform[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`rounded-lg border py-2 text-xs font-bold capitalize transition-colors ${
                      platform === p
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="relative mt-4">
                <pre className="max-h-[380px] overflow-x-auto rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs text-emerald-400">
                  {generateExport()}
                </pre>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className="absolute right-3 top-3 gap-1.5 bg-primary text-xs"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied Blueprint!" : "Copy Spec"}
                </Button>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4">
                <h4 className="font-display text-sm font-semibold">Need Turnkey Setup?</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Our team can deploy this exact workflow live for your business within a 30-Day Recovery Pilot.
                </p>
                <Link
                  to="/diagnostic"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                >
                  Run $297 Revenue Leak Diagnostic <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <ToolCrossSell tool="workflow-spec-builder" />
      </section>
    </SiteLayout>
  );
}
