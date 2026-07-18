import { Link, useNavigate } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ArrowRight, Bot, Sparkles, Workflow, Zap } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

const HeroGuide = lazy(() => import("./hero-guide").then((mod) => ({ default: mod.HeroGuide })));

export function Hero() {
  const [loadGuide, setLoadGuide] = useState(false);
  const [heroNiche, setHeroNiche] = useState("");
  const navigate = useNavigate();

  const goToPlaybook = () => {
    const niche = heroNiche.trim();
    trackEvent("hero_playbook_submitted", { hasNiche: niche.length > 0 });
    navigate({
      to: "/tools/ai-playbook",
      search: niche ? { niche } : {},
    });
  };

  useEffect(() => {
    let idleHandle: number | null = null;
    let timeoutHandle: number | null = null;

    const schedule = () => {
      timeoutHandle = window.setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idleHandle = window.requestIdleCallback(() => setLoadGuide(true), { timeout: 3000 });
        } else {
          setLoadGuide(true);
        }
      }, 2500);
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      window.removeEventListener("load", schedule);
      if (timeoutHandle !== null) window.clearTimeout(timeoutHandle);
      if (idleHandle !== null && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-border bg-[radial-gradient(circle_at_20%_18%,color-mix(in_oklch,var(--color-accent)_42%,transparent),transparent_34%),linear-gradient(180deg,var(--color-background),color-mix(in_oklch,var(--color-background)_72%,var(--color-accent)_28%))]">
      <div className="bg-grid absolute inset-0 opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="space-y-6 text-left lg:col-span-7">
            <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Build, deploy, and benefit from{" "}
              <span className="text-gradient-brand">AI agents.</span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Melanated In Tech is the marketplace, knowledge hub, and build partner for people
              putting AI agents to work - in businesses, ministries, creator studios, and beyond.
            </p>

            <div className="max-w-xl pt-2">
              <p className="text-sm font-semibold text-foreground">
                Start free: type what you do, get your personalized AI playbook.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <input
                  value={heroNiche}
                  onChange={(e) => setHeroNiche(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && goToPlaybook()}
                  maxLength={80}
                  placeholder="e.g. hair salon, realtor, youth pastor, personal trainer…"
                  className="h-12 flex-1 rounded-md border border-border bg-card px-4 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
                />
                <button
                  onClick={goToPlaybook}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  Get my free playbook <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                <Link to="/start-small" className="hover:text-foreground hover:underline">
                  Or find your first useful agent →
                </Link>
                <Link to="/knowledge" className="hover:text-foreground hover:underline">
                  Explore the knowledge hub →
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent2" /> Production-ready agents
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" /> Ministry &amp; business ready
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Workflow className="h-3.5 w-3.5 text-accent2" /> Built by operators, not theorists
              </span>
            </div>
          </div>

          <div className="lg:col-span-5">
            {loadGuide ? (
              <Suspense fallback={<HeroGuidePreview />}>
                <HeroGuide />
              </Suspense>
            ) : (
              <HeroGuidePreview />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroGuidePreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/80 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xs font-semibold text-foreground">MIT Assistant</h2>
            <p className="text-[9px] text-muted-foreground">Platform Guide Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Online (Free)
          </span>
        </div>
      </div>

      <div className="flex h-[280px] flex-col gap-3 p-4 text-xs leading-relaxed">
        <div className="flex max-w-[85%] gap-2.5 self-start">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
            <Bot className="h-3 w-3" />
          </div>
          <div className="rounded-2xl rounded-tl-none border border-border/50 bg-muted/80 px-3 py-2 text-foreground">
            Hi! I'm MIT Assistant. Tell me what you do — I'll point you to the right agent, guide,
            or free tool to start with.
          </div>
        </div>
      </div>

      <div className="border-t border-border/30 bg-muted/10 px-4 pb-2 pt-1">
        <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
          Frequently Asked
        </p>
        <div className="flex flex-wrap gap-1.5">
          {[
            "What can AI agents do for my business?",
            "Help me find my first agent",
            "What's free to try?",
          ].map((q) => (
            <span
              key={q}
              className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-[10px] font-medium text-foreground"
            >
              {q}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border/60 bg-muted/20 p-3">
        <div className="h-9 flex-1 rounded-md border border-input bg-background" />
        <div className="h-9 w-9 rounded-md bg-primary" />
      </div>
    </div>
  );
}
