import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ToolCrossSell } from "@/components/tool-cross-sell";
import { buildSeoMeta } from "@/lib/seo";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowRight,
  Sparkles,
  Wand2,
  Timer,
  GitBranch,
  BookOpenCheck,
  ShieldCheck,
  Cpu,
  Calculator,
  FileText,
  Layers,
  Trophy,
  Workflow,
  PhoneCall,
} from "lucide-react";

export const Route = createFileRoute("/tools/")({
  head: () => ({
    ...buildSeoMeta({
      title: "Interactive AI Tools — Melanated In Tech",
      description:
        "Interactive tools to help you craft perfect prompts and compile instructions for custom AI agents.",
      url: "/tools",
    }),
  }),
  component: ToolsIndex,
});

function ToolsIndex() {
  const tools = [
    {
      title: "Voice Agent Builder",
      description:
        "Design, rehearse, and export starter phone voice AI agent configs for Vapi AI and Retell AI, built for small businesses, non-profits, ministries, and customer support.",
      href: "/tools/voice-agent-builder" as const,
      Icon: PhoneCall,
      badge: "Voice AI & Calls",
      colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "AI Playbook",
      description:
        "Type in what you do — wedding photographer, HVAC contractor, realtor — and get a personalized pack of AI prompts for marketing, sales, and operations, written for your exact business.",
      href: "/tools/ai-playbook" as const,
      Icon: BookOpenCheck,
      badge: "Personalized Prompts",
      colorClass: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
    },
    {
      title: "Prompt Pilot",
      description:
        "Your AI idea launchpad. Drag, click, and build structured prompts in seconds. Seed your instructions with built-in templates and manage your custom library.",
      href: "/tools/prompt-pilot" as const,
      Icon: Wand2,
      badge: "Prompt Builder",
      colorClass: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50",
    },
    {
      title: "GPT Trainer",
      description:
        "Generate structured, professional system instructions for custom GPTs or AI agents. Tune tone, set rules, provide a knowledge base, and define training examples.",
      href: "/tools/gpt-trainer" as const,
      Icon: Sparkles,
      badge: "Instruction Compiler",
      colorClass: "text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/50",
    },
    {
      title: "Model Playground",
      description:
        "Compare outputs, generation latency, and token efficiency in real time side-by-side. Test prompts against Llama, Gemini, Qwen, and other free models simultaneously.",
      href: "/tools/model-playground" as const,
      Icon: Timer,
      badge: "Side-by-Side Sandbox",
      colorClass: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      title: "Agent Architect",
      description:
        "Design multi-agent architectures and workflows. Select patterns like router, orchestrator, or evaluator, configure custom instructions, and export code for LangGraph, CrewAI & Vercel AI SDK.",
      href: "/tools/agent-architect" as const,
      Icon: GitBranch,
      badge: "Workflow Designer",
      colorClass: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50",
    },
    {
      title: "RAG Chunker",
      description:
        "Prepare knowledge documents for AI Vector Search & RAG. Split text into optimized chunks, inspect token metrics, and export formatted JSON data.",
      href: "/tools/rag-chunker" as const,
      Icon: Layers,
      badge: "Vector DB Chunker",
      colorClass: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50",
    },
    {
      title: "Prompt A/B Tester",
      description:
        "Side-by-side system prompt A/B testing studio. Compare responses, latency, and instruction following with automated AI rubric scoring.",
      href: "/tools/ab-tester" as const,
      Icon: Trophy,
      badge: "A/B Split Tester",
      colorClass: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50",
    },
    {
      title: "AI SOP Generator",
      description:
        "Build formal Standard Operating Procedure (SOP) documents for human teams collaborating with autonomous AI agents.",
      href: "/tools/sop-generator" as const,
      Icon: Workflow,
      badge: "Team SOP Generator",
      colorClass: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50",
    },
    {
      title: "Eval Studio",
      description:
        "Automated stress testing studio for AI agents. Run prompt injection, hallucination traps, PII drills, and generate formal OWASP / NIST compliance audit reports.",
      href: "/tools/eval-studio" as const,
      Icon: ShieldCheck,
      badge: "Agent Safety Audit",
      colorClass: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
    },
    {
      title: "MCP Builder",
      description:
        "Visual Model Context Protocol (MCP) server builder. Connect AI agents to Supabase, Google Drive, Notion, GitHub, and Slack with 1-click config exports.",
      href: "/tools/mcp-builder" as const,
      Icon: Cpu,
      badge: "MCP Config Generator",
      colorClass: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50",
    },
    {
      title: "ROI Calculator",
      description:
        "Quantify your financial return on investment when implementing AI agents. Calculate monthly LLM API costs vs. labor hours saved for your team or organization.",
      href: "/tools/roi-calculator" as const,
      Icon: Calculator,
      badge: "Token & Business ROI",
      colorClass: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50",
    },
    {
      title: "Policy Generator",
      description:
        "Generate formal Acceptable AI Use Policy documents for small businesses, non-profits, ministries, and technology teams to establish clear organizational AI governance.",
      href: "/tools/policy-generator" as const,
      Icon: FileText,
      badge: "AI Governance",
      colorClass: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50",
    },
  ];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Interactive Utilities"
        title="AI Power-Up Tools."
        description="Simplify prompt engineering, system prompt creation, and agent customization with our interactive tools."
      />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map(({ title, description, href, Icon, badge, colorClass }) => (
            <Link
              key={title}
              to={href}
              onClick={() => trackEvent("tool_card_clicked", { tool: href })}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-foreground/15"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-xl p-3 ${colorClass}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground">
                  {badge}
                </span>
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-foreground group-hover:text-primary">
                {title}
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
              <div className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Launch Tool{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>

        <ToolCrossSell tool="tools-index" />
      </section>
    </SiteLayout>
  );
}
