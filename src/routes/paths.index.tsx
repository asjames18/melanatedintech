import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, ClipboardList, PlayCircle } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { listLearningPaths, listMyLearningProgress } from "@/lib/retention.functions";
import { buildSeoMeta } from "@/lib/seo";

const pathsQo = queryOptions({
  queryKey: ["learning-paths"],
  queryFn: () => listLearningPaths(),
});

export const Route = createFileRoute("/paths/")({
  head: () => ({
    ...buildSeoMeta({
      title: "Learning Paths - Melanated In Tech",
      description:
        "Ordered learning paths for building, securing, evaluating, and launching AI agents.",
      url: "/paths",
    }),
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pathsQo),
  component: PathsIndex,
});

function PathsIndex() {
  const { data: paths = [] } = useQuery(pathsQo);
  const getProgress = useServerFn(listMyLearningProgress);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  const progress = useQuery({
    queryKey: ["learning-progress"],
    queryFn: () => getProgress(),
    enabled: signedIn,
  });
  const progressData = progress.data;

  const progressByPath = useMemo(() => {
    const map = new Map<string, NonNullable<typeof progressData>[number]>();
    for (const row of progressData ?? []) {
      const path = Array.isArray(row.learning_paths) ? row.learning_paths[0] : row.learning_paths;
      if (path?.slug) map.set(path.slug, row);
    }
    return map;
  }, [progressData]);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Learning paths"
        title="A weekly loop for agent builders."
        description="Pick a path, work through the right articles and resources, then bring your result back to the community."
      />

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          {paths.map((path) => {
            const row = progressByPath.get(path.slug);
            const count = row?.completed_item_ids?.length ?? 0;
            const status = row?.completed_at
              ? "Completed"
              : count > 0
                ? "In progress"
                : "Not started";
            return (
              <Link
                key={path.id}
                to="/paths/$slug"
                params={{ slug: path.slug }}
                className="group flex min-h-[260px] flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary">
                    {row?.completed_at ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : count > 0 ? (
                      <PlayCircle className="h-5 w-5" />
                    ) : (
                      <ClipboardList className="h-5 w-5" />
                    )}
                  </div>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
                    {status}
                  </span>
                </div>
                <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">
                  {path.audience} / {path.difficulty}
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">{path.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{path.excerpt}</p>
                {count > 0 && (
                  <div className="mt-5">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: row?.completed_at ? "100%" : `${Math.min(90, count * 14)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{count} steps completed</p>
                  </div>
                )}
                <div className="mt-auto flex items-center gap-1 pt-6 text-sm font-medium text-primary">
                  {count > 0 ? "Continue path" : "View path"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-semibold">Not sure where to start?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Answer five quick questions and get a practical agent/product fit recommendation.
            </p>
          </div>
          <Button asChild>
            <Link to="/fit-finder">Open fit finder</Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
