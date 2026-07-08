import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { buildSeoMeta } from "@/lib/seo";
import { ArrowRight, Sparkles, Wand2, Timer, GitBranch } from "lucide-react";

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
        "Design multi-agent architectures and workflows. Select patterns like router, orchestrator, or evaluator, configure custom instructions and tools for each node, and generate boilerplate code in Python or TypeScript.",
      href: "/tools/agent-architect" as const,
      Icon: GitBranch,
      badge: "Workflow Designer",
      colorClass: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50",
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {tools.map(({ title, description, href, Icon, badge, colorClass }) => (
            <Link
              key={title}
              to={href}
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
      </section>
    </SiteLayout>
  );
}
