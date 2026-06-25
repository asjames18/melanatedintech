import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Hash } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { FeedList } from "@/components/feed/feed-list";
import { TrendingSidebar } from "@/components/feed/trending-sidebar";
import { supabase } from "@/integrations/supabase/client";
import { reactPost, unreactPost, deleteItem, adminDeleteItem } from "@/lib/community.functions";
import { checkAdminStatus } from "@/lib/admin.functions";
import { type FeedPage, type ReactionKind } from "@/lib/community";
import { buildSeoMeta, ldScript, collectionLd } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/t/$tag")({
  head: ({ params }) => ({
    ...buildSeoMeta({
      title: `#${params.tag} — Community`,
      description: `Posts tagged #${params.tag} on Melanated In Tech.`,
      url: `/t/${params.tag}`,
    }),
    scripts: [
      ldScript(
        collectionLd({
          name: `#${params.tag}`,
          url: `/t/${params.tag}`,
          description: `Posts tagged #${params.tag} on Melanated In Tech.`,
        }),
      ),
    ],
  }),
  component: TagPage,
});

function TagPage() {
  const { tag } = Route.useParams();
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/community"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Community
        </Link>

        <h1 className="mt-4 flex items-center gap-2 font-display text-2xl font-semibold">
          <Hash className="h-5 w-5 text-primary" />
          {tag}
        </h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
          <TagFeed tag={tag} viewerId={me} />
          <aside className="hidden lg:block">
            <TrendingSidebar />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function TagFeed({ tag, viewerId }: { tag: string; viewerId: string | null }) {
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
      await qc.cancelQueries({ queryKey: ["feed", "for-you", tag] });
      const cache = qc.getQueriesData<{ pages: FeedPage[] }>({
        queryKey: ["feed", "for-you", tag],
      });
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
              counts[kind] = on ? (counts[kind] ?? 0) + 1 : Math.max((counts[kind] ?? 0) - 1, 0);
              return { ...post, reactions_by_me: mine, reaction_count: counts };
            }),
          })),
        };
        qc.setQueryData(key, next);
      }
    },
    onError: () => qc.invalidateQueries({ queryKey: ["feed", "for-you", tag] }),
  });

  function toggleReaction(postId: string, kind: ReactionKind) {
    const cache = qc.getQueriesData<{ pages: FeedPage[] }>({
      queryKey: ["feed", "for-you", tag],
    });
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
      qc.invalidateQueries({ queryKey: ["feed", "for-you", tag] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <FeedList
      viewerId={viewerId}
      isAdmin={isAdmin}
      tag={tag}
      onToggleReaction={toggleReaction}
      onDelete={(postId, asAdmin) => delMut.mutate({ postId, asAdmin })}
    />
  );
}
