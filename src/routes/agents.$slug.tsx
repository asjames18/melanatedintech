import { useEffect, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { AgentCard, ArticleCard, TierBadge } from "@/components/cards";
import { WaitlistForm } from "@/components/waitlist-form";
import { SaveAgentButton } from "@/components/save-agent-button";
import { UnlockButton } from "@/components/unlock-button";
import { Button } from "@/components/ui/button";
import { getPremiumEntry } from "@/lib/premium-catalog";
import { categoryVisual } from "@/lib/category-style";
import { Markdown } from "@/components/markdown";
import { AgentDelivery } from "@/components/product-delivery";
import { useHasEntitlement } from "@/hooks/use-entitlement";
import { ShareBar } from "@/components/share-bar";
import { RecommendationItem } from "@/components/recommendation-item";
import { getAgent, listAgents, listArticles } from "@/lib/public.functions";
import { useInterests } from "@/hooks/use-interests";
import { interestScore, topCategories, reasonFor } from "@/lib/recommendations";
import { buildSeoMeta, ldScript, productLd, breadcrumbLd } from "@/lib/seo";
import { ArrowLeft, Bot, CheckCircle2, Layers, Sparkles, Tag } from "lucide-react";
import { Chat } from "@/components/agents/Chat";

const agentQO = (slug: string) =>
  queryOptions({ queryKey: ["agent", slug], queryFn: () => getAgent({ data: { slug } }) });
const allAgentsQO = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });
const allArticlesQO = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });

export const Route = createFileRoute("/agents/$slug")({
  loader: async ({ context, params }) => {
    const [agent] = await Promise.all([
      context.queryClient.ensureQueryData(agentQO(params.slug)),
      context.queryClient.ensureQueryData(allAgentsQO),
      context.queryClient.ensureQueryData(allArticlesQO),
    ]);
    if (!agent) throw notFound();
    return { agent };
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.agent;
    const path = `/agents/${params.slug}`;
    if (!a) return { meta: [{ title: "Agent — Melanated In Tech" }] };
    const seo = buildSeoMeta({
      title: `${a.name} — AI Agent | Melanated In Tech`,
      description: a.tagline,
      url: path,
      type: "product",
      image: a.image_url ?? null,
    });
    return {
      meta: [
        ...seo.meta,
        { name: "twitter:label1", content: "Category" },
        { name: "twitter:data1", content: a.category },
        { name: "twitter:label2", content: "Tier" },
        { name: "twitter:data2", content: a.tier },
      ],
      links: seo.links,
      scripts: [
        ldScript(
          productLd({
            name: a.name,
            tagline: a.tagline,
            category: a.category,
            image: a.image_url,
            url: path,
          }),
        ),
        ldScript(
          breadcrumbLd([
            { name: "Marketplace", path: "/agents" },
            { name: a.name, path },
          ]),
        ),
      ],
    };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Agent not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been retired or renamed.</p>
        <Link
          to="/agents"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to marketplace
        </Link>
      </div>
    </SiteLayout>
  ),
  component: AgentDetail,
});

function AgentDetail() {
  const { slug } = Route.useParams();
  const { data: agent } = useSuspenseQuery(agentQO(slug));
  const { data: allAgents } = useSuspenseQuery(allAgentsQO);
  const { data: allArticles } = useSuspenseQuery(allArticlesQO);
  const { interests, recordVisit } = useInterests("agent");
  const { interests: readingInterests } = useInterests("article");
  const owned = useHasEntitlement("agent", slug);
  const canChat = owned || agent?.tier === "free";

  useEffect(() => {
    if (agent) recordVisit(agent.slug, agent.category);
  }, [agent, recordVisit]);

  const { related, recommendedReading, personalized, topInterests } = useMemo(() => {
    if (!agent)
      return {
        related: [],
        recommendedReading: [],
        personalized: false,
        topInterests: [] as string[],
      };
    const cats = interests.categories;
    const readingCats = readingInterests.categories;
    const hasHistory = Object.keys(cats).length + Object.keys(readingCats).length > 0;

    const related = allAgents
      .filter((a) => a.slug !== agent.slug && !interests.recent.includes(a.slug))
      .map((a) => ({
        a,
        score:
          (a.category === agent.category ? 5 : 0) +
          interestScore(cats, a.category) * 2 +
          interestScore(readingCats, a.category) +
          (a.featured ? 1 : 0),
        reason: reasonFor({
          categories: { ...readingCats, ...cats },
          sourceCategory: agent.category,
          itemCategory: a.category,
          activeVerb: "exploring",
          fallback: a.featured ? "Featured pick from the team" : `More ${a.category} agents`,
        }),
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 3);

    const recommendedReading = allArticles
      .map((art) => ({
        a: art,
        score:
          (art.category === agent.category ? 4 : 0) +
          interestScore(readingCats, art.category) +
          interestScore(cats, art.category),
        reason: reasonFor({
          categories: { ...readingCats, ...cats },
          sourceCategory: agent.category,
          itemCategory: art.category,
          activeVerb: "exploring",
          fallback: `Background on ${art.category}`,
        }),
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 3);

    return {
      related,
      recommendedReading,
      personalized: hasHistory,
      topInterests: topCategories({ ...readingCats, ...cats }, 3),
    };
  }, [agent, allAgents, allArticles, interests, readingInterests]);

  if (!agent) return null;
  const { Icon: CatIcon, className: catClass } = categoryVisual(agent.category, Bot);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-muted/30">
        <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_70%)]" />
        <div className="relative mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            to="/agents"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> All agents
          </Link>
          <div className="mt-6 flex items-start gap-4">
            <div
              className={`grid h-14 w-14 place-items-center rounded-2xl shadow-lg shadow-foreground/5 ${catClass}`}
            >
              <CatIcon className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs uppercase tracking-wider text-primary">{agent.category}</p>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(agent as any).seller_profiles && (
                  <Link
                    to="/sellers/$slug"
                    params={{ slug: (agent as any).seller_profiles.slug }}
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                  >
                    <span>By</span>
                    <span className="font-semibold text-foreground hover:text-primary">
                      {(agent as any).seller_profiles.display_name}
                    </span>
                  </Link>
                )}
              </div>
              <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{agent.name}</h1>
              <p className="mt-2 text-lg text-muted-foreground">{agent.tagline}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <TierBadge tier={agent.tier} />
                {agent.featured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent2/15 px-2 py-0.5 text-xs font-medium text-accent2">
                    <Sparkles className="h-3 w-3" /> Featured
                  </span>
                )}
                <div className="ml-auto">
                  <SaveAgentButton agentId={agent.id} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={Tag} label="Category" value={agent.category} />
            <Stat
              icon={Layers}
              label="Capabilities"
              value={String((agent.capabilities ?? []).length)}
            />
            <Stat icon={Sparkles} label="Tier" value={agent.tier} capitalize />
            <Stat icon={CheckCircle2} label="Status" value="Onboarding" />
          </div>

          <ShareBar title={agent.name} text={agent.tagline} className="mt-6" />
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="font-display text-xl font-semibold">About this agent</h2>
            <div className="mt-3">
              <Markdown md={agent.description} />
            </div>

            {agent.capabilities && agent.capabilities.length > 0 && (
              <>
                <h2 className="mt-10 font-display text-xl font-semibold">Capabilities</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {agent.capabilities.map((c: string) => (
                    <li
                      key={c}
                      className="flex items-start gap-2 rounded-lg border border-border bg-card p-3 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent2" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {owned && <AgentDelivery slug={agent.slug} />}

            {canChat && (
              <div className="mt-8">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                  <Bot className="h-5 w-5" /> Chat with {agent.name}
                </h2>
                <Chat
                  agentId={agent.id}
                  agentSlug={agent.slug}
                  agentName={agent.name}
                  defaultModel={agent.model ?? "openrouter/openrouter/free"}
                />
              </div>
            )}
          </div>

          <aside className="md:col-span-1">
            <div className="sticky top-24 space-y-4">
              {agent.tier === "free" && (
                <div className="rounded-2xl border border-border bg-card p-6 bg-gradient-to-br from-emerald-500/5 to-transparent">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Free AI Agent
                  </div>
                  <p className="mt-2 text-sm font-semibold">Instantly Available</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    This agent is unlocked and ready to help. Scroll down to start chatting!
                  </p>
                </div>
              )}

              {agent.tier === "custom" && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm font-medium">Custom Solution</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tailored AI agent designed to integrate with your custom workflows.
                  </p>
                  <div className="mt-4">
                    <Button asChild className="w-full">
                      <Link to="/contact" search={{ topic: `Custom Agent: ${agent.name}` }}>
                        Contact for Custom Build
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {agent.tier === "premium" &&
                (getPremiumEntry("agent", agent.slug) && !agent.has_fulfillment && !owned ? (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-sm font-medium">Coming soon</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      This agent isn't available to unlock just yet — join the list below and we'll
                      let you know the moment it's ready.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <p className="text-sm font-medium">
                      {owned ? "You own this agent" : "Premium agent"}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {owned
                        ? "Your pack is unlocked below — read it here or download it any time."
                        : getPremiumEntry("agent", agent.slug)
                          ? `One-time unlock. Lifetime access to ${agent.name} on your account.`
                          : "Available through a quick conversation — tell us your use case and we'll get you set up."}
                    </p>
                    <div className="mt-4">
                      <UnlockButton
                        kind="agent"
                        slug={agent.slug}
                        itemName={agent.name}
                        priceCents={agent.price_cents}
                        tier={agent.tier}
                      />
                    </div>
                  </div>
                ))}

              {!canChat && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <p className="text-sm font-medium">Get early access</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    We're onboarding builders for {agent.name}. Join the list to get a deployment
                    invite.
                  </p>
                  <div className="mt-4">
                    <WaitlistForm source={`agent:${agent.slug}`} interest={agent.name} />
                  </div>
                </div>
              )}

              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(agent as any).seller_profiles && (
                <div className="rounded-2xl border border-border bg-card p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Creator
                  </h3>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 font-display font-bold text-primary">
                      {(agent as any).seller_profiles.display_name.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        to="/sellers/$slug"
                        params={{ slug: (agent as any).seller_profiles.slug }}
                        className="font-display font-semibold text-foreground hover:text-primary transition-colors hover:underline"
                      >
                        {(agent as any).seller_profiles.display_name}
                      </Link>
                      <p className="text-xs text-muted-foreground">Marketplace Seller</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {personalized ? "Picked for you" : "Related"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {personalized && topInterests.length > 0
                    ? `More agents for ${topInterests.slice(0, 2).join(" & ")}`
                    : `More ${agent.category} agents`}
                </h2>
              </div>
              <Link to="/agents" className="text-sm font-medium text-primary hover:underline">
                All agents →
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(({ a, reason }, i) => (
                <RecommendationItem
                  key={a.id}
                  meta={{
                    surface: "agent:related_agents",
                    itemType: "agent",
                    itemSlug: a.slug,
                    itemCategory: a.category,
                    reason,
                    position: i,
                    personalized,
                    sourceType: "agent",
                    sourceSlug: agent.slug,
                    sourceCategory: agent.category,
                  }}
                >
                  <AgentCard {...a} capabilities={a.capabilities} />
                </RecommendationItem>
              ))}
            </div>
          </div>
        </section>
      )}

      {recommendedReading.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-accent2">
                  <Sparkles className="h-3 w-3" /> Recommended reading
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">Sharpen your context</h2>
              </div>
              <Link to="/knowledge" className="text-sm font-medium text-primary hover:underline">
                Knowledge hub →
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {recommendedReading.map(({ a, reason }, i) => (
                <RecommendationItem
                  key={a.id}
                  meta={{
                    surface: "agent:recommended_reading",
                    itemType: "article",
                    itemSlug: a.slug,
                    itemCategory: a.category,
                    reason,
                    position: i,
                    personalized,
                    sourceType: "agent",
                    sourceSlug: agent.slug,
                    sourceCategory: agent.category,
                  }}
                >
                  <ArticleCard {...a} />
                </RecommendationItem>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className={`mt-1 text-sm font-medium ${capitalize ? "capitalize" : ""}`}>{value}</p>
    </div>
  );
}
