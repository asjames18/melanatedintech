import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Wrench,
  Store,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Layers,
  Building2,
} from "lucide-react";

export function PlatformOverview() {
  const resources = [
    {
      icon: GraduationCap,
      title: "Practical AI education",
      eyebrow: "Learn at your pace",
      description:
        "Field guides, playbooks, and learning paths for owners and teams who want a useful starting point—not a platform tour.",
      ctaText: "Explore the Knowledge Hub",
      ctaHref: "/knowledge",
      badge: "Free resources",
      color:
        "from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      icon: Wrench,
      title: "Tools workbench",
      eyebrow: "Try it yourself",
      description:
        "Use Prompt Pilot, SOP Generator, and other browser tools when you want to draft, test, or think on your own.",
      ctaText: "Open the tools hub",
      ctaHref: "/tools",
      badge: "Interactive tools",
      color: "from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      icon: Store,
      title: "Agent marketplace",
      eyebrow: "Browse when you are ready",
      description:
        "Pre-built agents and packs remain available. They are a library behind the work—not the first thing we ask you to buy.",
      ctaText: "Browse agents",
      ctaHref: "/agents",
      badge: "Secondary",
      color:
        "from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      icon: BookOpen,
      title: "Starter kits & products",
      eyebrow: "Self-serve next",
      description:
        "Digital products and starter packs for teams that already know the workflow and want a kit, not a discovery engagement.",
      ctaText: "See products",
      ctaHref: "/products",
      badge: "Self-serve",
      color:
        "from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    },
  ];

  return (
    <section className="border-b border-border bg-card/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Still here when you want to explore
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Education, tools, and the marketplace stay reachable.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            The front door is one workflow and a clear next step. Learning, the tools workbench, and
            the agent marketplace remain available further in—not as equal first-screen pillars.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {resources.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`grid h-12 w-12 place-items-center rounded-xl border bg-gradient-to-br ${uc.color}`}
                    >
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

                <div className="mt-6 border-t border-border/50 pt-4">
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

        <div className="mt-12 rounded-2xl border border-border bg-gradient-to-r from-card via-muted/30 to-card p-8">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold">Operators &amp; owners</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Primary audience: one repeated workflow that is already costing follow-through.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold">Nonprofits &amp; higher ed</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Intake, follow-up, and approvals that need to stay human-led.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold">Learners</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Guides and tools remain open—use them when you want to learn, not as the homepage
                  pitch.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold">Builders</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  Blueprints, tests, and the marketplace stay available without leading the first
                  screen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
