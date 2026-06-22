import { useEffect, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { ArticleCard, AgentCard } from "@/components/cards";
import { ShareBar } from "@/components/share-bar";
import { SaveArticleButton } from "@/components/save-article-button";
import { RecommendationItem } from "@/components/recommendation-item";
import { getArticle, listArticles, listAgents } from "@/lib/public.functions";
import { useInterests } from "@/hooks/use-interests";
import { interestScore, topCategories, reasonFor } from "@/lib/recommendations";
import { buildSeoMeta } from "@/lib/seo";
import { ArrowLeft, Sparkles } from "lucide-react";

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
    return {
      meta: [
        ...buildSeoMeta({
          title: `${a.title} — Melanated In Tech`,
          description: a.excerpt,
          url: path,
          type: "article",
        }),
        { property: "article:section", content: a.category },
        ...(a.published_at
          ? [{ property: "article:published_time", content: new Date(a.published_at).toISOString() }]
          : []),
        { name: "twitter:label1", content: "Reading time" },
        { name: "twitter:data1", content: `${a.read_minutes ?? 5} min read` },
        { name: "twitter:label2", content: "Topic" },
        { name: "twitter:data2", content: a.category },
      ],
      links: [{ rel: "canonical", href: path }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: a.title,
          description: a.excerpt,
          articleSection: a.category,
          datePublished: a.published_at ?? undefined,
          author: { "@type": "Organization", name: "Melanated In Tech" },
          publisher: { "@type": "Organization", name: "Melanated In Tech" },
        }),
      }],
    };
  },
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Article not found</h1>
        <Link to="/knowledge" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to knowledge hub
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ArticleView,
});

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: string[] | null = null;
  const flush = () => {
    if (listBuf) {
      out.push(
        <ul key={`l-${out.length}`} className="my-4 list-disc space-y-1 pl-5 text-muted-foreground">
          {listBuf.map((it, i) => <li key={i}>{it}</li>)}
        </ul>,
      );
      listBuf = null;
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) { flush(); continue; }
    if (line.startsWith("# ")) { flush(); out.push(<h1 key={out.length} className="mt-8 font-display text-3xl font-semibold">{line.slice(2)}</h1>); continue; }
    if (line.startsWith("## ")) { flush(); out.push(<h2 key={out.length} className="mt-8 font-display text-2xl font-semibold">{line.slice(3)}</h2>); continue; }
    if (line.startsWith("### ")) { flush(); out.push(<h3 key={out.length} className="mt-6 font-display text-xl font-semibold">{line.slice(4)}</h3>); continue; }
    if (line.startsWith("- ")) { (listBuf ??= []).push(line.slice(2)); continue; }
    flush();
    out.push(<p key={out.length} className="mt-4 text-muted-foreground">{line}</p>);
  }
  flush();
  return out;
}

function ArticleView() {
  const { slug } = Route.useParams();
  const { data: article } = useSuspenseQuery(qo(slug));
  const { data: allArticles } = useSuspenseQuery(allArticlesQO);
  const { data: allAgents } = useSuspenseQuery(allAgentsQO);
  const { interests, recordVisit } = useInterests("article");

  useEffect(() => {
    if (article) recordVisit(article.slug, article.category);
  }, [article, recordVisit]);

  const { related, featuredAgents, personalized, topInterests } = useMemo(() => {
    if (!article) return { related: [], featuredAgents: [], personalized: false, topInterests: [] as string[] };
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

  if (!article) return null;

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/knowledge" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
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
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ShareBar title={article.title} text={article.excerpt} />
          <SaveArticleButton articleId={article.id} />
        </div>
        <div className="mt-10">{renderMarkdown(article.body)}</div>
        <div className="mt-12 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-medium">Found this useful? Share it.</p>
          <ShareBar title={article.title} text={article.excerpt} className="mt-3" />
        </div>
      </article>

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
              <Link to="/knowledge" className="text-sm font-medium text-primary hover:underline">All articles →</Link>
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
              <Link to="/agents" className="text-sm font-medium text-primary hover:underline">Browse agents →</Link>
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
