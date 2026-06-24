import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { ArticleCard } from "@/components/cards";
import { getAuthor } from "@/lib/authors.functions";
import { buildSeoMeta } from "@/lib/seo";
import { ArrowLeft, Link as LinkIcon, BookOpen } from "lucide-react";

const qo = (slug: string) =>
  queryOptions({ queryKey: ["author", slug], queryFn: () => getAuthor({ data: { slug } }) });

export const Route = createFileRoute("/authors/$slug")({
  loader: async ({ context, params }) => {
    const r = await context.queryClient.ensureQueryData(qo(params.slug));
    if (!r) throw notFound();
    return r;
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Author — Melanated In Tech" }] };
    const { author } = loaderData;
    return {
      meta: buildSeoMeta({
        title: `${author.name} — Melanated In Tech`,
        description: author.bio ?? `Articles by ${author.name}.`,
        url: `/authors/${params.slug}`,
        type: "website",
        image: author.avatar_url ?? null,
      }),
      links: [{ rel: "canonical", href: `/authors/${params.slug}` }],
    };
  },
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-12 text-sm text-destructive">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Author not found</h1>
        <Link
          to="/knowledge"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to knowledge hub
        </Link>
      </div>
    </SiteLayout>
  ),
  component: AuthorPage,
});

function AuthorPage() {
  const { slug } = Route.useParams();
  const data = useSuspenseQuery(qo(slug)).data!;
  const { author, articles } = data;
  const links = (author.links ?? {}) as Record<string, string>;

  return (
    <SiteLayout>
      <PageHeader eyebrow="Author" title={author.name} description={author.bio ?? undefined} />
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          {author.avatar_url ? (
            <img
              src={author.avatar_url}
              alt=""
              className="h-16 w-16 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-lg font-semibold">
              {author.name.slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            {Object.keys(links).length > 0 && (
              <div className="flex flex-wrap gap-3">
                {Object.entries(links).map(([label, url]) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <LinkIcon className="h-3 w-3" /> {label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="font-display text-lg font-semibold">
          <BookOpen className="mr-2 inline h-4 w-4" />
          {articles.length === 0
            ? "No articles yet"
            : `${articles.length} article${articles.length === 1 ? "" : "s"}`}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((a) => (
            <ArticleCard
              key={a.id}
              slug={a.slug}
              title={a.title}
              excerpt={a.excerpt}
              category={a.category}
              read_minutes={a.read_minutes}
            />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
