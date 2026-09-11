import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  Bot,
  GraduationCap,
  HandHeart,
  MonitorSmartphone,
  PackageOpen,
  Presentation,
  ShieldCheck,
  Workflow,
} from "lucide-react";
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
import { WORKFLOW_OPPORTUNITY_SPRINT as SPRINT } from "@/lib/workflow-opportunity-sprint";
import { buildSeoMeta, organizationLd, websiteLd, ldScript } from "@/lib/seo";

const agentsQO = queryOptions({
  queryKey: ["agents"],
  queryFn: async () => {
    try {
      return await listAgents();
    } catch {
      return [];
    }
  },
});
const articlesQO = queryOptions({
  queryKey: ["articles"],
  queryFn: async () => {
    try {
      return await listArticles();
    } catch {
      return [];
    }
  },
});
const productsQO = queryOptions({
  queryKey: ["products"],
  queryFn: async () => {
    try {
      return await listProducts();
    } catch {
      return [];
    }
  },
});

export const Route = createFileRoute("/")({
  head: () => {
    const seo = buildSeoMeta({
      title: "One Costly Workflow. A Fixed-Scope Next Step. | Melanated In Tech",
      description:
        "Name one repeated workflow and choose a useful next step. The Workflow Opportunity Sprint is a 10-business-day discovery with a workflow map, feasibility and risk review, implementation-ready plan, and a pilot go/no-go/revise. Training, tools, and resources remain available.",
      url: "/",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [ldScript(organizationLd()), ldScript(websiteLd())],
    };
  },
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

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Work with us
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Choose the practical next step for your team.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Start with a clear outcome. We offer focused support for the work in front of you,
              then scope more complex projects before implementation begins.
            </p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                Icon: GraduationCap,
                title: "Learn AI",
                body: "Build confidence with practical, beginner-friendly AI training for owners and small teams.",
              },
              {
                Icon: Workflow,
                title: "Improve a workflow",
                body: "Identify one repeated task or customer journey and choose a safer, more useful next step.",
              },
              {
                Icon: MonitorSmartphone,
                title: "Launch a website",
                body: "Create a focused, mobile-first digital presence built to help the right people get in touch.",
              },
              {
                Icon: Presentation,
                title: "Make the case clearly",
                body: "Scope presentation support for training, sales, grant, or stakeholder conversations.",
              },
            ].map(({ Icon, title, body }) => (
              <Link
                key={title}
                to="/work-with-us"
                className="group rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:shadow-md"
              >
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  Find your starting point{" "}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Build practical economic power with AI
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Start with a useful next step—or help improve the shared tools behind it.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Melanated In Tech combines practical learning, accountable business systems, and open
              infrastructure. Choose the path that fits where you are today.
            </p>
          </div>
          <div className="mt-9 grid gap-5 lg:grid-cols-2">
            <Link
              to="/work-with-us"
              className="group rounded-3xl border border-border bg-card p-7 transition-colors hover:border-primary/45 hover:shadow-sm"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">Work with our team.</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Choose practical AI training, a workflow diagnostic, a focused website, or a more
                tailored project scope that fits where you are today.
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Explore services{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              to="/open-commons"
              className="group rounded-3xl border border-primary/25 bg-primary/5 p-7 transition-colors hover:border-primary/55 hover:shadow-sm"
            >
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
                <HandHeart className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-display text-2xl font-semibold">
                Build the open commons with us.
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Help shape public AI tools, policy patterns, examples, and test fixtures that make
                useful technology more understandable and accountable.
              </p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                Explore Open Commons{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Examples of workflow types
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold sm:text-4xl">
            Follow-up leaks are one kind of costly workflow—not the whole product story.
          </h2>
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
              Local credibility, nationwide work
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Based in Sebring. Built for operators who need a clear next step.
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              We serve Highlands County and Florida first, with qualified engagements across the
              U.S. Follow-up leaks are one workflow type we map. The product is still one costly
              process and a bounded decision—not a platform pitch.
            </p>
          </div>
          <CommercialTrust />
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              When follow-up is the leak
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Recovery systems remain available as bounded examples—not the homepage hero.
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
              These demos show workflow types we often map—missed follow-up, estimates, retention,
              and rebooking. They are examples, not the only offer.
            </p>
          </div>
          <SystemDemo compact />
        </div>
      </section>

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              A separate implementation SKU
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              If discovery points to one measurable leak, a Recovery Pilot is one bounded next
              build.
            </h2>
            <p className="mt-3 text-muted-foreground">
              The $1,500 30-Day Recovery Pilot is not the {SPRINT.name}, not the $297 AI Workflow
              Diagnostic, and not the $997 Website Launch Sprint. It is a later implementation
              option when the workflow is already defined.
            </p>
          </div>
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

      <PlatformOverview />

      <section className="border-b border-border bg-muted/25">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Resources behind the work
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
                Guides, tools, and agents—when you want to keep going.
              </h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Education and the marketplace are still here. They sit after the workflow
                conversation, not beside it on the first screen.
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
                  Tell us what you are trying to make better.
                </h2>
                <p className="mt-3 max-w-2xl text-background/70">
                  Start by naming one repeated workflow. Training, a $297 diagnostic, a website
                  launch, or a {SPRINT.name} are separate next steps—not aliases for each other.
                </p>
              </div>
              <Link
                to="/start-small"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-background px-6 text-sm font-semibold text-foreground"
              >
                Name your workflow <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
