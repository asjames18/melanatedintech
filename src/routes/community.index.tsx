import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FeedComposer } from "@/components/feed/feed-composer";
import { FeedList } from "@/components/feed/feed-list";
import { StoriesBar } from "@/components/feed/stories-bar";
import { TrendingSidebar } from "@/components/feed/trending-sidebar";
import { LeftSidebar } from "@/components/feed/left-sidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  reactPost,
  unreactPost,
  deleteItem,
  adminDeleteItem,
} from "@/lib/community.functions";
import { checkAdminStatus } from "@/lib/admin.functions";
import { FEED_TABS, type FeedPage, type FeedTab, type ReactionKind } from "@/lib/community";
import { toast } from "sonner";
import { buildSeoMeta } from "@/lib/seo";
import { Button } from "@/components/ui/button";

import { z } from "zod";
import { zodValidator } from "@tanstack/zod-adapter";

const searchSchema = z.object({
  tag: z.string().optional(),
});

export const Route = createFileRoute("/community/")({
  validateSearch: zodValidator(searchSchema),
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
  const { tag } = Route.useSearch();
  const [me, setMe] = useState<string | null>(null);
  const [tab, setTab] = useState<FeedTab>("for-you");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr_280px]">
          <LeftSidebar />

          {/* Center Column: Feed */}
          <div className="space-y-4 min-w-0">
            {/* Horizontal Topics scroll list */}
            <StoriesBar />

            {/* Active filter banner if tag is set */}
            {tag && (
              <div className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">Active Filter:</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    #{tag}
                  </span>
                </div>
                <Button asChild size="sm" variant="ghost" className="h-7 rounded-lg text-xs hover:bg-primary/10 hover:text-primary">
                  <Link to="/community">Clear</Link>
                </Button>
              </div>
            )}

            {/* Post Composer */}
            <FeedComposer viewerId={me ?? null} initialTag={tag} />

            {/* Tabs List Switcher */}
            <Tabs value={tab} onValueChange={(v) => setTab(v as FeedTab)} className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0 h-auto">
                {FEED_TABS.map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    disabled={t === "following" && !me}
                    className="rounded-none border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-foreground data-[state=active]:bg-transparent hover:text-foreground transition-all cursor-pointer"
                  >
                    {t === "following" ? "Following" : "For you"}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            {/* Posts Feed list */}
            <FeedController viewerId={me ?? null} tab={tab} tag={tag} />
          </div>

          {/* Right Column: Sticky Trending rails */}
          <aside className="hidden lg:block">
            <TrendingSidebar />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function FeedController({ viewerId, tab, tag }: { viewerId: string | null; tab: FeedTab; tag?: string }) {
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
              let mine = post.reactions_by_me;
              const counts = { ...post.reaction_count };
              if (on) {
                for (const prev of mine) {
                  counts[prev] = Math.max((counts[prev] ?? 0) - 1, 0);
                }
                mine = [kind];
                counts[kind] = (counts[kind] ?? 0) + 1;
              } else {
                mine = mine.filter((k: string) => k !== kind);
                counts[kind] = Math.max((counts[kind] ?? 0) - 1, 0);
              }
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
      tag={tag}
      onToggleReaction={toggleReaction}
      onDelete={(postId, asAdmin) => delMut.mutate({ postId, asAdmin })}
    />
  );
}
