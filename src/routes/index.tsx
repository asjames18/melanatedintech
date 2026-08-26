import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, BookOpen, Bot, HandHeart, PackageOpen, ShieldCheck } from "lucide-react";
import { Hero } from "@/components/hero";
import { PlatformOverview } from "@/components/platform-overview";
import { SiteLayout } from "@/components/site-layout";
import { AgentCard, ArticleCard, ProductCard } from "@/components/cards";
import { SystemDemo } from "@/components/system-demo";
import {
  CommercialTrust,
  EngagementProcess,
  PilotOffer,
  SystemsGrid,
} from "@/components/system-sections";
import { listAgents, listArticles, listProducts } from "@/lib/public.functions";
import { SOLUTIONS } from "@/lib/service-systems";
import { buildSeoMeta } from "@/lib/seo";

const agentsQO = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });
const articlesQO = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });
const productsQO = queryOptions({ queryKey: ["products"], queryFn: () => listProducts() });

export const Route = createFileRoute("/")({
  head: () => ({
    ...buildSeoMeta({
      title: "Revenue Recovery Systems for Service Businesses | Melanated In Tech",
      description:
        "Your advertising creates demand — recovery systems help your team act on it. We find and fix the revenue leaking through missed calls, stale estimates, and lapsed clients. Start with a $297 Revenue Leak Diagnostic.",
      url: "/",
    }),
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(agentsQO),
      context.queryClient.ensureQueryData(articlesQO),
      context.queryClient.ensureQueryData(productsQO),
    ]);
  },
  component: Home,
});

function Home() {
  const { data: agents } = useSuspenseQuery(agentsQO);
  const { data: articles } = useSuspenseQuery(articlesQO);
  const { data: products } = useSuspenseQuery(productsQO);
  const featuredAgents = agents.filter((agent) => agent.featured).slice(0, 4);
  const topArticles = articles.slice(0, 3);
  const topProducts = products.slice(0, 3);

  return (
    <SiteLayout>
      <Hero />
      <PlatformOverview />

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Build practical economic power with AI
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Start with a useful workflow—or help improve the shared tools behind it.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Melanated In Tech combines practical learning, accountable business systems, and open
              infrastructure. Choose the path that fits where you are today.
            </p>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            <Link
              to="/start-small"
              className="group rounded-3xl border border-border bg-card p-7 transition-colors hover:border-primary/45 hover:shadow-sm"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">Start with one bounded workflow.</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Find an AI use case with clear inputs, human approval, and a measurable outcome before
                you automate more of your work.
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Choose your first step <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              to="/open-commons"
              className="group rounded-3xl border border-primary/25 bg-primary/5 p-7 transition-colors hover:border-primary/55 hover:shadow-sm"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <HandHeart className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">Build the open commons with us.</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Help shape public AI tools, policy patterns, examples, and test fixtures that make
                useful technology more understandable and accountable.
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Explore Open Commons <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Choose your service model
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {SOLUTIONS.map((solution) => (
              <Link
                key={solution.slug}
                to="/solutions/$slug"
                params={{ slug: solution.slug }}
                className="group rounded-2xl border border-border bg-card p-5 hover:border-primary/40 hover:shadow-md"
              >
                <h2 className="font-display text-lg font-semibold">{solution.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {solution.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  See your use cases{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Revenue is already leaking
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              The opportunity is often in the follow-up.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Advertising creates demand. Recovery systems help your team act on it—without asking
              staff to remember every missed call, estimate, renewal, cancellation, or rebooking
              window.
            </p>
          </div>
          <CommercialTrust />
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Four focused systems
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Start with the revenue leak you can measure.
            </h2>
          </div>
          <div className="mt-10">
            <SystemsGrid />
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-9 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Interactive workflow preview
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              See the handoffs before we touch your software.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Choose a scenario and step through the customer, system, and team experience.
            </p>
          </div>
          <SystemDemo compact />
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <PilotOffer />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">How we work</p>
          <h2 className="mt-2 font-display text-3xl font-semibold">
            From qualification to optimization.
          </h2>
          <div className="mt-8">
            <EngagementProcess />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                The broader platform
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Tools and knowledge behind the work.
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Explore the existing agent marketplace, practical field guides, and digital products
                that make Melanated In Tech more than a services landing page.
              </p>
            </div>
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
            >
              Explore the knowledge hub <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[
              { Icon: Bot, label: `${agents.length} AI agents`, to: "/agents" as const },
              {
                Icon: BookOpen,
                label: `${articles.length} field guides`,
                to: "/knowledge" as const,
              },
              {
                Icon: PackageOpen,
                label: `${products.length} digital products`,
                to: "/products" as const,
              },
            ].map(({ Icon, label, to }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5 font-display text-lg font-semibold hover:border-primary/40"
              >
                <Icon className="h-5 w-5 text-primary" /> {label}
              </Link>
            ))}
          </div>
          {featuredAgents.length > 0 && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  {...agent}
                  tier={agent.tier}
                  capabilities={agent.capabilities}
                />
              ))}
            </div>
          )}
          {topProducts.length > 0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {topProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}
          {topArticles.length > 0 && (
            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {topArticles.map((article) => (
                <ArticleCard key={article.id} {...article} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-foreground p-7 text-background sm:p-12">
            <div className="bg-grid absolute inset-0 opacity-10" />
            <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-background/60">
                  One clear next step
                </p>
                <h2 className="mt-2 max-w-2xl font-display text-3xl font-semibold sm:text-4xl">
                  Show us where revenue gets stuck.
                </h2>
                <p className="mt-3 max-w-2xl text-background/70">
                  Complete the short qualification form and see the demonstration that matches your
                  service model.
                </p>
              </div>
              <Link
                to="/get-a-demo"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground"
              >
                Get a relevant demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
