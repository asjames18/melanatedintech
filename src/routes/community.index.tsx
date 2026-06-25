import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedComposer } from "@/components/feed/feed-composer";
import { FeedList } from "@/components/feed/feed-list";
import { TrendingSidebar } from "@/components/feed/trending-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { reactPost, unreactPost, deleteItem, adminDeleteItem } from "@/lib/community.functions";
import { listBuilderChallenges } from "@/lib/retention.functions";
import { checkAdminStatus } from "@/lib/admin.functions";
import { FEED_TABS, type FeedPage, type FeedTab, type ReactionKind } from "@/lib/community";
import { toast } from "sonner";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/community/")({
  head: () => ({
    ...buildSeoMeta({
      title: "Community — Melanated In Tech",
      description: "Discussions, questions, and field notes from people building AI agents.",
      url: "/community",
    }),
  }),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div>
    </SiteLayout>
  ),
  notFoundComponent: () => (
    <SiteLayout>
      <div className="p-12">Not found.</div>
    </SiteLayout>
  ),
  component: Community,
});

function Community() {
  const [me, setMe] = useState<string | null>(undefined);
  const [tab, setTab] = useState<FeedTab>("for-you");
  const listChallenges = useServerFn(listBuilderChallenges);
  const challenges = useQuery({
    queryKey: ["builder-challenges"],
    queryFn: () => listChallenges(),
  });
  const currentChallenge =
    (challenges.data ?? []).find((challenge) => {
      const now = Date.now();
      return (
        now >= new Date(challenge.starts_at).getTime() &&
        now <= new Date(challenge.ends_at).getTime()
      );
    }) ?? challenges.data?.[0];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Community"
        title="The feed for agent builders."
        description="Share what you're shipping, ask questions, and learn from the field — in real time."
      />

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            {currentChallenge && (
              <Link
                to="/challenges/$slug"
                params={{ slug: currentChallenge.slug }}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Weekly builder challenge
                </p>
                <h2 className="mt-1 font-display text-xl font-semibold">
                  {currentChallenge.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{currentChallenge.excerpt}</p>
              </Link>
            )}

            <FeedComposer viewerId={me ?? null} />

            <Tabs value={tab} onValueChange={(v) => setTab(v as FeedTab)}>
              <TabsList>
                {FEED_TABS.map((t) => (
                  <TabsTrigger key={t} value={t} disabled={t === "following" && !me}>
                    {t === "following" ? "Following" : "For you"}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <FeedController viewerId={me ?? null} tab={tab} />
          </div>

          <aside className="hidden lg:block">
            <TrendingSidebar />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function FeedController({ viewerId, tab }: { viewerId: string | null; tab: FeedTab }) {
  const qc = useQueryClient();
  const react = useServerFn(reactPost);
  const unreact = useServerFn(unreactPost);
  const del = useServerFn(deleteItem);
  const adminDel = useServerFn(adminDeleteItem);
  const checkAdmin = useServerFn(checkAdminStatus);

  const adminQ = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => checkAdmin(),
    enabled: !!viewerId,
    staleTime: 60_000,
  });
  const isAdmin = !!adminQ.data?.isAdmin;

  const reactMut = useMutation({
    mutationFn: (args: { postId: string; kind: ReactionKind; on: boolean }) =>
      (args.on ? react : unreact)({ data: { post_id: args.postId, kind: args.kind } }),
    onMutate: async ({ postId, kind, on }) => {
      await qc.cancelQueries({ queryKey: ["feed"] });
      const cache = qc.getQueriesData<{ pages: FeedPage[] }>({ queryKey: ["feed"] });
      for (const [key, value] of cache) {
        if (!value) continue;
        const next = {
          ...value,
          pages: value.pages.map((p) => ({
            ...p,
            posts: p.posts.map((post) => {
              if (post.id !== postId) return post;
              const mine = on
                ? Array.from(new Set([...post.reactions_by_me, kind]))
                : post.reactions_by_me.filter((k: string) => k !== kind);
              const counts = { ...post.reaction_count };
              if (on) counts[kind] = (counts[kind] ?? 0) + 1;
              else counts[kind] = Math.max((counts[kind] ?? 0) - 1, 0);
              return { ...post, reactions_by_me: mine, reaction_count: counts };
            }),
          })),
        };
        qc.setQueryData(key, next);
      }
    },
    onError: () => qc.invalidateQueries({ queryKey: ["feed"] }),
  });

  function toggleReaction(postId: string, kind: ReactionKind) {
    // Inspect cache to decide whether this is an add or remove.
    const cache = qc.getQueriesData<{ pages: FeedPage[] }>({ queryKey: ["feed"] });
    let on = true;
    for (const [, value] of cache) {
      if (!value) continue;
      for (const p of value.pages) {
        const post = p.posts.find((x) => x.id === postId);
        if (post && post.reactions_by_me.includes(kind)) {
          on = false;
          break;
        }
      }
    }
    return reactMut.mutate({ postId, kind, on });
  }

  const delMut = useMutation({
    mutationFn: (args: { postId: string; asAdmin: boolean }) =>
      (args.asAdmin ? adminDel : del)({ data: { id: args.postId, kind: "post" } }),
    onSuccess: () => {
      toast.success("Post deleted.");
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <FeedList
      viewerId={viewerId}
      isAdmin={isAdmin}
      tab={tab}
      onToggleReaction={toggleReaction}
      onDelete={(postId, asAdmin) => delMut.mutate({ postId, asAdmin })}
    />
  );
}
