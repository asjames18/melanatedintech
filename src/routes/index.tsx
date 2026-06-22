import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Hero } from "@/components/hero";
import { SiteLayout } from "@/components/site-layout";
import { AgentCard, ArticleCard } from "@/components/cards";
import { WaitlistForm } from "@/components/waitlist-form";
import { listAgents, listArticles } from "@/lib/public.functions";
import { PILLARS } from "@/lib/site";
import { ArrowRight } from "lucide-react";

const agentsQO = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });
const articlesQO = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Melanated In Tech — The home for AI agents" },
      { name: "description", content: "Marketplace, knowledge hub, products, and services for people building, deploying, and benefiting from AI agents." },
      { property: "og:title", content: "Melanated In Tech — The home for AI agents" },
      { property: "og:description", content: "The destination for AI agent knowledge, solutions, and innovation." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(agentsQO),
      context.queryClient.ensureQueryData(articlesQO),
    ]);
  },
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-12">Not found.</div></SiteLayout>,
  component: Home,
});

function Home() {
  const { data: agents } = useSuspenseQuery(agentsQO);
  const { data: articles } = useSuspenseQuery(articlesQO);
  const featuredAgents = agents.filter((a) => a.featured).slice(0, 4);
  const topArticles = articles.slice(0, 3);

  return (
    <SiteLayout>
      <Hero />

      {/* Featured agents */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary">Featured agents</p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Production-ready AI agents.
              </h2>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Hand-picked agents that solve real problems for ministries, businesses, sales teams, and creators.
              </p>
            </div>
            <Link to="/agents" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All agents <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredAgents.map((a) => (
              <AgentCard key={a.id} {...a} tier={a.tier} capabilities={a.capabilities} />
            ))}
          </div>
        </div>
      </section>

      {/* Pillars — all about agents */}
      <section className="border-b border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-medium uppercase tracking-wider text-primary">The platform</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
            Five pillars. One focus: AI agents.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <Link
                key={p.title}
                to={p.href}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{p.tag}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.blurb}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Explore <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-primary">Knowledge hub</p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Field notes from people shipping agents.
              </h2>
            </div>
            <Link to="/knowledge" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              All articles <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {topArticles.map((a) => (
              <ArticleCard key={a.id} {...a} />
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist */}
      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-foreground p-10 text-background sm:p-14">
            <div className="bg-grid absolute inset-0 opacity-[0.08]" />
            <div className="relative grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                  Join the agent builder waitlist.
                </h2>
                <p className="mt-3 max-w-xl text-sm text-background/70">
                  Be first to access new agents, blueprints, and the builder community. No spam — just what's
                  worth your time.
                </p>
              </div>
              <div className="lg:justify-self-end lg:w-full lg:max-w-md">
                <WaitlistForm source="home" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
