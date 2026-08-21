import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Wrench,
  Store,
  Zap,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Layers,
  Building2,
} from "lucide-react";

export function PlatformOverview() {
  const useCases = [
    {
      icon: GraduationCap,
      title: "Learn & Master AI Agents",
      eyebrow: "Practical Education",
      description:
        "No fluff or hype. Master practical AI agent workflows, prompt engineering, and operational automation through interactive playbooks, guides, and the Melanated in Tech podcast.",
      ctaText: "Explore Knowledge Hub",
      ctaHref: "/knowledge",
      badge: "Free Education",
      color: "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      icon: Wrench,
      title: "Free Interactive Tools Workbench",
      eyebrow: "Build in Your Browser",
      description:
        "Use free, hands-on tools directly on the site: Prompt Pilot, Agent Architect, SOP Generator, ROI Calculator, RAG Chunker, and Voice Agent Builder.",
      ctaText: "Open Tools Hub",
      ctaHref: "/tools",
      badge: "Interactive Tools",
      color: "from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      icon: Store,
      title: "AI Agent & Product Marketplace",
      eyebrow: "Ready to Deploy",
      description:
        "Discover, evaluate, and acquire pre-built AI agents, niche automation packs, prompt libraries, and architecture blueprints built for real business workflows.",
      ctaText: "Browse Marketplace",
      ctaHref: "/products",
      badge: "Verified Marketplace",
      color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      icon: Zap,
      title: "Done-With-You Implementation",
      eyebrow: "Turnkey Systems",
      description:
        "For service businesses and organizations needing bespoke systems: start with a $297 Revenue Leak Diagnostic or a 30-Day Fixed-Scope Pilot with human handoffs built in.",
      ctaText: "Run $297 Diagnostic",
      ctaHref: "/diagnostic",
      badge: "Bespoke Services",
      color: "from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <section className="border-b border-border bg-card/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> What Is Melanated In Tech?
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            More than automations. <br />
            <span className="text-gradient-brand">An end-to-end AI operating platform.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Whether you want to learn how AI agents work, use free interactive workbench tools, find pre-built marketplace templates, or deploy turnkey revenue recovery systems—we build technology around real outcomes.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {useCases.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br border ${uc.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {uc.badge}
                    </span>
                  </div>
                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-primary">
                    {uc.eyebrow}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold">{uc.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {uc.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/50">
                  <Link
                    to={uc.ctaHref}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    {uc.ctaText}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Who We Serve Banner */}
        <div className="mt-12 rounded-2xl border border-border bg-gradient-to-r from-card via-muted/30 to-card p-8">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold">Learners & Creators</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Master prompt engineering, agentic architecture, and AI concepts without tech jargon.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold">Service Business Owners</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Plug revenue leaks in missed calls, open estimates, and stale client follow-ups.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold">Developers & Builders</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Access agent blueprints, test tools, and submit custom agents to the marketplace.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold">Non-Profits & Higher Ed</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Streamline inquiry workflows, advisory tools, and institutional AI capability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
