import { useEffect, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site-layout";
import { ArticleCard, AgentCard } from "@/components/cards";
import { ShareBar } from "@/components/share-bar";
import { SaveArticleButton } from "@/components/save-article-button";
import { RecommendationItem } from "@/components/recommendation-item";
import { Markdown } from "@/components/markdown";
import { getArticle, listArticles, listAgents } from "@/lib/public.functions";
import { getArticleAuthor } from "@/lib/authors.functions";
import { useInterests } from "@/hooks/use-interests";
import { useTrackReadingProgress } from "@/hooks/use-reading-progress";
import { interestScore, topCategories, reasonFor } from "@/lib/recommendations";
import { buildSeoMeta, ldScript, articleLd, breadcrumbLd } from "@/lib/seo";
import { ArrowLeft, Sparkles, Link as LinkIcon, Timer, Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["article", slug], queryFn: () => getArticle({ data: { slug } }) });
const allArticlesQO = queryOptions({ queryKey: ["articles"], queryFn: () => listArticles() });
const allAgentsQO = queryOptions({ queryKey: ["agents"], queryFn: () => listAgents() });

export const Route = createFileRoute("/knowledge/$slug")({
  loader: async ({ context, params }) => {
    const [a] = await Promise.all([
      context.queryClient.ensureQueryData(qo(params.slug)),
      context.queryClient.ensureQueryData(allArticlesQO),
      context.queryClient.ensureQueryData(allAgentsQO),
    ]);
    if (!a) throw notFound();
    return { article: a };
  },
  head: ({ params, loaderData }) => {
    const a = loaderData?.article;
    const path = `/knowledge/${params.slug}`;
    if (!a) return { meta: [{ title: "Article — Melanated In Tech" }] };
    const seo = buildSeoMeta({
      title: `${a.title} — Melanated In Tech`,
      description: a.excerpt,
      url: path,
      type: "article",
    });
    return {
      meta: [
        ...seo.meta,
        { property: "article:section", content: a.category },
        ...(a.published_at
          ? [
              {
                property: "article:published_time",
                content: new Date(a.published_at).toISOString(),
              },
            ]
          : []),
        { name: "twitter:label1", content: "Reading time" },
        { name: "twitter:data1", content: `${a.read_minutes ?? 5} min read` },
        { name: "twitter:label2", content: "Topic" },
        { name: "twitter:data2", content: a.category },
      ],
      links: seo.links,
      scripts: [
        ldScript(
          articleLd({
            title: a.title,
            excerpt: a.excerpt,
            category: a.category,
            published_at: a.published_at,
            url: path,
            image: null,
          }),
        ),
        ldScript(
          breadcrumbLd([
            { name: "Knowledge Hub", path: "/knowledge" },
            { name: a.title, path },
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
        <h1 className="font-display text-3xl font-semibold">Article not found</h1>
        <Link
          to="/knowledge"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to knowledge hub
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ArticleView,
});

function ArticleView() {
  const { slug } = Route.useParams();
  const { data: article } = useSuspenseQuery(qo(slug));
  const { data: allArticles } = useSuspenseQuery(allArticlesQO);
  const { data: allAgents } = useSuspenseQuery(allAgentsQO);
  const { interests, recordVisit } = useInterests("article");
  const progressPct = useTrackReadingProgress(article?.slug, article?.title);
  const fetchAuthor = useServerFn(getArticleAuthor);
  const authorId = article?.author_id ?? null;
  const author = useQuery({
    queryKey: ["article-author", authorId],
    queryFn: () =>
      authorId ? fetchAuthor({ data: { author_id: authorId } }) : Promise.resolve(null),
    enabled: !!authorId,
  });

  useEffect(() => {
    if (article) recordVisit(article.slug, article.category);
  }, [article, recordVisit]);

  const { related, featuredAgents, personalized, topInterests } = useMemo(() => {
    if (!article)
      return { related: [], featuredAgents: [], personalized: false, topInterests: [] as string[] };
    const cats = interests.categories;
    const hasHistory = Object.keys(cats).length > 0;

    const related = allArticles
      .filter((a) => a.slug !== article.slug && !interests.recent.includes(a.slug))
      .map((a) => ({
        a,
        score:
          (a.category === article.category ? 5 : 0) +
          interestScore(cats, a.category) +
          (a.published_at ? new Date(a.published_at).getTime() / 1e13 : 0),
        reason: reasonFor({
          categories: cats,
          sourceCategory: article.category,
          itemCategory: a.category,
          activeVerb: "reading",
          fallback: `More in ${a.category}`,
        }),
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 3);

    const featuredAgents = allAgents
      .map((a) => ({
        a,
        score:
          (a.category === article.category ? 4 : 0) +
          interestScore(cats, a.category) * 2 +
          (a.featured ? 1 : 0),
        reason: reasonFor({
          categories: cats,
          sourceCategory: article.category,
          itemCategory: a.category,
          activeVerb: "reading",
          fallback: a.featured ? "Featured pick from the team" : `Pairs with ${a.category}`,
        }),
      }))
      .sort((x, y) => y.score - x.score)
      .slice(0, 3);

    return {
      related,
      featuredAgents,
      personalized: hasHistory,
      topInterests: topCategories(cats, 3),
    };
  }, [article, allArticles, allAgents, interests]);

  const recommendedTool = useMemo(() => {
    if (!article) return null;

    // Map by category or slug
    if (article.category === "Evaluation" || article.slug.includes("eval")) {
      return {
        title: "Model Playground",
        callout:
          "Compare prompt outputs, generation latency, and token efficiency side-by-side across Llama, Gemini, and Qwen in our parallel comparison sandbox.",
        href: "/tools/model-playground",
        Icon: Timer,
      };
    }

    if (
      article.category === "Agent Security" ||
      article.slug.includes("secure") ||
      article.slug.includes("injection")
    ) {
      return {
        title: "GPT Trainer",
        callout:
          "Design strict custom agent parameters, tone rules, and safety guardrails, then compile them into custom system instructions.",
        href: "/tools/gpt-trainer",
        Icon: Sparkles,
      };
    }

    if (
      article.category === "Getting Started" ||
      article.category === "Community" ||
      article.slug.includes("prompt")
    ) {
      return {
        title: "Prompt Pilot",
        callout:
          "Seed, build, and save your agent instructions using our visual template catalog and drag-and-drop prompt workspace.",
        href: "/tools/prompt-pilot",
        Icon: Wand2,
      };
    }

    return null;
  }, [article]);

  if (!article) return null;

  return (
    <SiteLayout>
      <div
        className="sticky top-0 z-30 h-1 bg-primary/80 transition-[width] duration-150"
        style={{ width: `${progressPct}%` }}
        aria-hidden
      />
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link
          to="/knowledge"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Knowledge hub
        </Link>
        <div className="mt-6 flex items-center gap-2 text-xs uppercase tracking-wider text-primary">
          <span>{article.category}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{article.read_minutes} min read</span>
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.excerpt}</p>

        {author.data && (
          <Link
            to="/authors/$slug"
            params={{ slug: author.data.slug }}
            className="mt-5 inline-flex items-center gap-3 rounded-full border bg-card px-3 py-1.5 transition-colors hover:border-foreground/30"
          >
            {author.data.avatar_url ? (
              <img
                src={author.data.avatar_url}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="grid h-7 w-7 place-items-center rounded-full bg-muted text-xs font-semibold">
                {author.data.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="text-sm font-medium">{author.data.name}</span>
            <LinkIcon className="h-3 w-3 text-muted-foreground" />
          </Link>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ShareBar title={article.title} text={article.excerpt} />
          <SaveArticleButton articleId={article.id} />
        </div>
        <div className="mt-10">
          <Markdown md={article.body} />
        </div>
        <div className="mt-12 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Found this useful?</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Share it, save it, or bring the idea into the community.
              </p>
            </div>
            <Link
              to="/community"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Discuss it
            </Link>
          </div>
          <ShareBar title={article.title} text={article.excerpt} className="mt-4" />
        </div>
      </article>

      {recommendedTool && (
        <section className="border-t border-border bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-card p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <recommendedTool.Icon className="h-4 w-4" />
                  Interactive AI Tool
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  Try it yourself: {recommendedTool.title}
                </h2>
                <p className="text-sm text-muted-foreground max-w-2xl">{recommendedTool.callout}</p>
              </div>
              <Button asChild size="lg" className="shrink-0">
                <Link to={recommendedTool.href as any}>
                  Launch Sandbox <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-primary">
                  {personalized ? "Picked for you" : "Related reading"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {personalized && topInterests.length > 0
                    ? `Because you've been reading ${topInterests.slice(0, 2).join(" & ")}`
                    : `More on ${article.category}`}
                </h2>
              </div>
              <Link to="/knowledge" className="text-sm font-medium text-primary hover:underline">
                All articles
              </Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {related.map(({ a, reason }, i) => (
                <RecommendationItem
                  key={a.id}
                  meta={{
                    surface: "knowledge:related_reading",
                    itemType: "article",
                    itemSlug: a.slug,
                    itemCategory: a.category,
                    reason,
                    position: i,
                    personalized,
                    sourceType: "article",
                    sourceSlug: article.slug,
                    sourceCategory: article.category,
                  }}
                >
                  <ArticleCard {...a} />
                </RecommendationItem>
              ))}
            </div>
          </div>
        </section>
      )}

      {featuredAgents.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-accent2">
                  <Sparkles className="h-3 w-3" />
                  {personalized ? "Matched to your interests" : "Featured agents"}
                </p>
                <h2 className="mt-1 font-display text-2xl font-semibold">
                  {personalized
                    ? `Agents for ${topInterests[0] ?? article.category} readers`
                    : "Put this knowledge into practice"}
                </h2>
              </div>
              <Link to="/agents" className="text-sm font-medium text-primary hover:underline">
                Browse agents
              </Link>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredAgents.map(({ a, reason }, i) => (
                <RecommendationItem
                  key={a.id}
                  meta={{
                    surface: "knowledge:featured_agents",
                    itemType: "agent",
                    itemSlug: a.slug,
                    itemCategory: a.category,
                    reason,
                    position: i,
                    personalized,
                    sourceType: "article",
                    sourceSlug: article.slug,
                    sourceCategory: article.category,
                  }}
                >
                  <AgentCard {...a} capabilities={a.capabilities} />
                </RecommendationItem>
              ))}
            </div>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
