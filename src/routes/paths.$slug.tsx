import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, MessageSquare, PlayCircle } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { AgentCard, ArticleCard, ProductCard } from "@/components/cards";
import { supabase } from "@/integrations/supabase/client";
import {
  getLearningPath,
  listMyLearningProgress,
  updateLearningPathProgress,
  type ResolvedLearningPathItem,
} from "@/lib/retention.functions";
import { buildSeoMeta } from "@/lib/seo";

const qo = (slug: string) =>
  queryOptions({
    queryKey: ["learning-path", slug],
    queryFn: () => getLearningPath({ data: { slug } }),
  });

export const Route = createFileRoute("/paths/$slug")({
  head: ({ params }) => ({
    ...buildSeoMeta({
      title: "Learning Path - Melanated In Tech",
      description: "A guided AI agent builder learning path.",
      url: `/paths/${params.slug}`,
    }),
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(qo(params.slug)),
  component: PathDetail,
});

function PathDetail() {
  const { slug } = Route.useParams();
  const { data: path } = useSuspenseQuery(qo(slug));
  const getProgress = useServerFn(listMyLearningProgress);
  const updateProgress = useServerFn(updateLearningPathProgress);
  const qc = useQueryClient();
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  const progress = useQuery({
    queryKey: ["learning-progress"],
    queryFn: () => getProgress(),
    enabled: signedIn,
  });

  const progressRow = useMemo(() => {
    return (progress.data ?? []).find((row) => {
      const rowPath = Array.isArray(row.learning_paths)
        ? row.learning_paths[0]
        : row.learning_paths;
      return rowPath?.slug === slug;
    });
  }, [progress.data, slug]);

  const completed = new Set(progressRow?.completed_item_ids ?? []);
  const completeCount = completed.size;
  const total = path?.items.length ?? 0;

  const progressMut = useMutation({
    mutationFn: (args: { itemId?: string; completed?: boolean }) =>
      updateProgress({ data: { pathSlug: slug, itemId: args.itemId, completed: args.completed } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["learning-progress"] }),
  });

  if (!path) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-display text-3xl font-semibold">Path not found</h1>
          <Button asChild className="mt-6">
            <Link to="/paths">View learning paths</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow={`${path.audience} / ${path.difficulty}`}
        title={path.title}
        description={path.excerpt}
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">
                {completeCount} of {total} steps complete
              </p>
              <div className="mt-2 h-2 w-full max-w-md overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary"
                  style={{ width: total ? `${Math.round((completeCount / total) * 100)}%` : "0%" }}
                />
              </div>
            </div>
            {signedIn ? (
              <Button
                onClick={() => progressMut.mutate({})}
                disabled={progressMut.isPending}
                variant={completeCount > 0 ? "outline" : "default"}
              >
                <PlayCircle className="h-4 w-4" />
                {completeCount > 0 ? "Resume path" : "Start path"}
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/auth">Sign in to track progress</Link>
              </Button>
            )}
          </div>
        </div>

        <ol className="space-y-5">
          {path.items.map((item, index) => (
            <li key={item.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    Step {index + 1} / {labelFor(item.item_type)}
                  </p>
                  {item.item_type === "community_prompt" && (
                    <h2 className="mt-1 font-display text-xl font-semibold">{item.title}</h2>
                  )}
                </div>
                {signedIn && (
                  <Button
                    size="sm"
                    variant={completed.has(item.id) ? "default" : "outline"}
                    onClick={() =>
                      progressMut.mutate({ itemId: item.id, completed: !completed.has(item.id) })
                    }
                    disabled={progressMut.isPending}
                  >
                    <Check className="h-4 w-4" />
                    {completed.has(item.id) ? "Done" : "Mark done"}
                  </Button>
                )}
              </div>
              <PathItem item={item} pathSlug={path.slug} />
            </li>
          ))}
        </ol>
      </section>
    </SiteLayout>
  );
}

function labelFor(type: ResolvedLearningPathItem["item_type"]) {
  if (type === "article") return "Article";
  if (type === "agent") return "Agent";
  if (type === "product") return "Product";
  return "Community prompt";
}

function PathItem({ item, pathSlug }: { item: ResolvedLearningPathItem; pathSlug: string }) {
  if (item.item_type === "article" && item.resource && "title" in item.resource) {
    return <ArticleCard {...item.resource} />;
  }
  if (item.item_type === "agent" && item.resource && "name" in item.resource) {
    return <AgentCard {...item.resource} />;
  }
  if (item.item_type === "product" && item.resource && "name" in item.resource) {
    return <ProductCard {...item.resource} />;
  }
  if (item.item_type === "community_prompt") {
    return (
      <div className="rounded-xl bg-muted/50 p-5">
        <p className="text-sm text-muted-foreground">{item.excerpt}</p>
        <Button asChild className="mt-5">
          <Link to="/community" search={{ tag: pathSlug }}>
            <MessageSquare className="h-4 w-4" />
            Post your result
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border p-5">
      <p className="text-sm text-muted-foreground">This resource is being prepared.</p>
      <Link
        to="/knowledge"
        className="inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        Browse Knowledge Hub <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
