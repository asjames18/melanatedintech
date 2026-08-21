import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  BarChart3,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Download,
  RotateCcw,
  ShieldCheck,
  Zap,
  TrendingUp,
  FileCheck,
} from "lucide-react";

export const Route = createFileRoute("/tools/ai-readiness-assessment")({
  head: () => ({
    ...buildSeoMeta({
      title: "Interactive AI Readiness & Operational Maturity Assessment — Melanated In Tech",
      description:
        "Evaluate your organization's AI readiness across 5 core pillars: SOPs, Data Structure, Tooling Access, Team Literacy, and Security Governance.",
      url: "/tools/ai-readiness-assessment",
    }),
  }),
  component: AIReadinessAssessment,
});

interface Question {
  id: string;
  pillar: string;
  question: string;
  options: { text: string; points: number; hint: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: "sop",
    pillar: "Process & SOP Maturity",
    question: "How well-documented and standardized are your core business workflows?",
    options: [
      { text: "Workflows exist mostly in team members' heads (Ad-hoc)", points: 1, hint: "High variance in execution quality" },
      { text: "We have basic written guides, but they are infrequently updated", points: 2, hint: "Partial standardization" },
      { text: "Detailed step-by-step SOPs exist for 80%+ of key operations", points: 4, hint: "Ideal baseline for AI automation" },
      { text: "Workflows are mapped with clear inputs, outputs, and edge cases", points: 5, hint: "Ready for autonomous agent execution" },
    ],
  },
  {
    id: "data",
    pillar: "Data Accessibility & Structuring",
    question: "Where is your business and operational data stored?",
    options: [
      { text: "Scattered across personal hard drives, emails, and paper notes", points: 1, hint: "Data silo blocker" },
      { text: "Stored in cloud apps (Google Drive, Notion, CRM) but unstructured", points: 2, hint: "Requires RAG indexing" },
      { text: "Organized in centralized databases/CRMs with structured fields", points: 4, hint: "High API query readiness" },
      { text: "Cleaned, indexed, with permissions and API access configured", points: 5, hint: "Production-ready knowledge base" },
    ],
  },
  {
    id: "tooling",
    pillar: "Tooling & API Integration Access",
    question: "What access does your team have to AI models and automation webhooks?",
    options: [
      { text: "Individual free ChatGPT accounts without team oversight", points: 1, hint: "Shadow AI risk" },
      { text: "Paid AI subscriptions (ChatGPT Plus/Claude Pro) used independently", points: 2, hint: "Manual copy-paste workflow" },
      { text: "Using low-code automation tools like Zapier, Make.com, or n8n", points: 4, hint: "Integrated workflow foundation" },
      { text: "API keys, webhooks, and custom model endpoints configured", points: 5, hint: "Full agentic orchestration capabilities" },
    ],
  },
  {
    id: "literacy",
    pillar: "Team Literacy & AI Skills",
    question: "How comfortable is your staff with prompt engineering and AI collaboration?",
    options: [
      { text: "Most team members have never used AI tools in daily work", points: 1, hint: "Training required first" },
      { text: "Some staff use AI for basic writing, brainstorming, or drafting", points: 2, hint: "Emerging interest" },
      { text: "Team regularly uses structured prompts and automated workflows", points: 4, hint: "Strong user adoption" },
      { text: "Dedicated AI champions build and refine custom agent workflows", points: 5, hint: "High internal innovation capacity" },
    ],
  },
  {
    id: "governance",
    pillar: "Security, Privacy & Governance",
    question: "What guidelines or policies exist for AI data safety in your organization?",
    options: [
      { text: "No official guidelines; team members use any tool freely", points: 1, hint: "High compliance risk" },
      { text: "Informal agreement not to paste sensitive customer data into AI", points: 2, hint: "Basic security awareness" },
      { text: "Official AI Acceptable Use Policy and vendor risk checklist in place", points: 4, hint: "Compliant & secure governance" },
      { text: "Strict zero-data-retention APIs, SOC2 compliance, and audit logs", points: 5, hint: "Enterprise security standard" },
    ],
  },
];

export function AIReadinessAssessment() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (questionId: string, points: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: points }));
  };

  const totalPoints = Object.values(answers).reduce((acc, curr) => acc + curr, 0);
  const maxPoints = QUESTIONS.length * 5;
  const percentage = Math.round((totalPoints / maxPoints) * 100);

  const isComplete = Object.keys(answers).length === QUESTIONS.length;

  let maturityLevel = "Ad-Hoc Explorer (Tier 1)";
  let summary = "Your organization is in the early exploration phase. Standardizing your core workflows into SOPs and centralizing data will yield immediate gains.";
  let badgeColor = "text-amber-600 bg-amber-500/10 border-amber-500/30";

  if (percentage >= 80) {
    maturityLevel = "Agent-Native Powerhouse (Tier 4)";
    summary = "Your organization possesses strong data structure, clear SOPs, and governance! You are ready to deploy autonomous multi-agent teams.";
    badgeColor = "text-emerald-600 bg-emerald-500/10 border-emerald-500/30";
  } else if (percentage >= 60) {
    maturityLevel = "Workflow Automation Ready (Tier 3)";
    summary = "Solid operational foundation! Focus on refining API access, agentic boundaries, and prompt guardrails to scale automation safely.";
    badgeColor = "text-blue-600 bg-blue-500/10 border-blue-500/30";
  } else if (percentage >= 40) {
    maturityLevel = "Emerging Digital Adapter (Tier 2)";
    summary = "Good initial momentum. Establishing a clear AI Acceptable Use Policy and centralizing team tools will unlock significant productivity.";
    badgeColor = "text-indigo-600 bg-indigo-500/10 border-indigo-500/30";
  }

  const handleSubmit = () => {
    if (!isComplete) return;
    setSubmitted(true);
    trackEvent("tool_export", { tool: "ai_readiness_assessment", percentage, maturityLevel });
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Workbench Tool"
        title="AI Readiness & Operational Maturity Assessment"
        description="Evaluate your business or institution across 5 core pillars to determine your AI Maturity Tier and receive personalized implementation recommendations."
      />

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {!submitted ? (
          <div className="space-y-8">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-base font-bold">Assessment Progress</h3>
                  <p className="text-xs text-muted-foreground">
                    Answer all 5 questions to generate your organization's AI Maturity Scorecard.
                  </p>
                </div>
                <span className="rounded-full border border-border bg-muted px-3 py-1 font-mono text-xs font-bold text-primary">
                  {Object.keys(answers).length} / {QUESTIONS.length} Answered
                </span>
              </div>
            </div>

            {QUESTIONS.map((q, idx) => (
              <div
                key={q.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-border/80"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {q.pillar}
                  </span>
                </div>

                <h4 className="mt-2 font-display text-base font-bold text-foreground">
                  {q.question}
                </h4>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.points;
                    return (
                      <button
                        key={opt.text}
                        onClick={() => handleSelect(q.id, opt.points)}
                        className={`flex flex-col justify-between rounded-xl border p-4 text-left text-xs transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border/70 bg-background hover:border-primary/50 hover:bg-muted/30"
                        }`}
                      >
                        <span className="font-semibold text-foreground">{opt.text}</span>
                        <span className="mt-2 text-[11px] font-mono text-muted-foreground">
                          💡 {opt.hint}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!isComplete}
                className="gap-2 bg-primary px-8 py-6 font-bold shadow-lg"
              >
                Generate AI Maturity Scorecard <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Score Summary Banner */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-md">
              <div className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:justify-between">
                <div>
                  <span className={`inline-block rounded-full border px-3 py-1 text-xs font-bold ${badgeColor}`}>
                    {maturityLevel}
                  </span>
                  <h2 className="mt-3 font-display text-3xl font-extrabold text-foreground">
                    AI Readiness Score: {percentage}%
                  </h2>
                  <p className="mt-2 max-w-xl text-xs text-muted-foreground leading-relaxed">
                    {summary}
                  </p>
                </div>

                <div className="mt-6 flex flex-col items-center sm:mt-0">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-primary/10">
                    <span className="font-display text-3xl font-extrabold text-primary">
                      {totalPoints}/{maxPoints}
                    </span>
                  </div>
                  <span className="mt-2 text-[11px] font-mono text-muted-foreground">Total Maturity Points</span>
                </div>
              </div>

              {/* Pillar Breakdown */}
              <div className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Highest Readiness Pillar</p>
                  <p className="mt-1 font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Standardized Workflows & Knowledge
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Primary Bottleneck</p>
                  <p className="mt-1 font-display text-sm font-bold text-amber-600 dark:text-amber-400">
                    API & Tool Orchestration Access
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-[11px] font-semibold uppercase text-muted-foreground">Next Action Step</p>
                  <p className="mt-1 font-display text-sm font-bold text-primary">
                    Establish AI Governance & Policy
                  </p>
                </div>
              </div>

              {/* CTA Options */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-border pt-6">
                <Button onClick={handleReset} variant="outline" className="gap-2 text-xs font-bold">
                  <RotateCcw className="h-4 w-4" /> Retake Assessment
                </Button>

                <div className="flex flex-wrap gap-2">
                  <Link to="/diagnostic">
                    <Button className="gap-2 bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700">
                      Book $297 Revenue Audit <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/governance">
                    <Button variant="secondary" className="gap-2 text-xs font-bold">
                      <ShieldCheck className="h-4 w-4" /> View AI Governance Kit
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        <ToolCrossSell currentToolSlug="ai-readiness-assessment" />
      </section>
    </SiteLayout>
  );
}
