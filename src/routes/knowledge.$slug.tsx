import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { getArticle } from "@/lib/public.functions";
import { ArrowLeft } from "lucide-react";

const qo = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: () => getArticle({ data: { slug } }),
  });

export const Route = createFileRoute("/knowledge/$slug")({
  loader: async ({ context, params }) => {
    const a = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!a) throw notFound();
    return { article: a };
  },
  head: ({ loaderData }) => ({
    meta: loaderData?.article
      ? [
          { title: `${loaderData.article.title} — Melanated In Tech` },
          { name: "description", content: loaderData.article.excerpt },
          { property: "og:title", content: loaderData.article.title },
          { property: "og:description", content: loaderData.article.excerpt },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Article — Melanated In Tech" }],
  }),
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
  // Tiny, safe-ish markdown: headings, paragraphs, lists, inline code.
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
        <div className="mt-10">{renderMarkdown(article.body)}</div>
      </article>
    </SiteLayout>
  );
}
