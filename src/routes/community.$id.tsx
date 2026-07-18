import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Lock, MessageSquare, Unlock } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "@/components/feed/post-card";
import { ReplyThread } from "@/components/feed/reply-thread";
import { LeftSidebar } from "@/components/feed/left-sidebar";
import { TrendingSidebar } from "@/components/feed/trending-sidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  getThread,
  replyToPost,
  reactPost,
  unreactPost,
  reactReply,
  unreactReply,
  deleteItem,
  adminDeleteItem,
  moderateThread,
  savePost,
  unsavePost,
  sharePost,
  reportPost,
} from "@/lib/community.functions";
import { checkAdminStatus } from "@/lib/admin.functions";
import { REPLY_BODY_MAX, type FeedThread, type ReactionKind } from "@/lib/community";
import { buildSeoMeta, ldScript, discussionLd, breadcrumbLd } from "@/lib/seo";
import { toast } from "sonner";

const threadQO = (id: string) =>
  queryOptions({
    queryKey: ["thread", id],
    queryFn: () => getThread({ data: { id } }),
  });

export const Route = createFileRoute("/community/$id")({
  loader: async ({ context, params }) => {
    const t = await context.queryClient.ensureQueryData(threadQO(params.id));
    if (!t) throw notFound();
    return { thread: t };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.thread;
    if (!t) return { meta: [{ title: "Thread - Melanated In Tech" }] };
    const seo = buildSeoMeta({
      title: t.post.title ? `${t.post.title} - Community` : "Community thread",
      description: t.post.body.slice(0, 160),
      url: `/community/${t.post.id}`,
      type: "article",
    });
    return {
      meta: seo.meta,
      links: seo.links,
      scripts: [
        ldScript(
          discussionLd({
            title: t.post.title,
            body: t.post.body,
            url: `/community/${t.post.id}`,
            authorName: t.post.author?.display_name ?? null,
            createdAt: t.post.created_at,
            replyCount: t.post.reply_count,
          }),
        ),
        ldScript(
          breadcrumbLd([
            { name: "Community", path: "/community" },
            { name: t.post.title ?? "Thread", path: `/community/${t.post.id}` },
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
        <h1 className="font-display text-3xl font-semibold">Thread not found</h1>
        <Link to="/community" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to community
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ThreadView,
});

function ThreadView() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: thread } = useSuspenseQuery(threadQO(id));
  const [reply, setReply] = useState("");
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`thread-${id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "discussion_comments", filter: `post_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["thread", id] }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "post_reactions", filter: `post_id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ["thread", id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, qc]);

  const replyFn = useServerFn(replyToPost);
  const reactPostFn = useServerFn(reactPost);
  const unreactPostFn = useServerFn(unreactPost);
  const reactReplyFn = useServerFn(reactReply);
  const unreactReplyFn = useServerFn(unreactReply);
  const del = useServerFn(deleteItem);
  const adminDel = useServerFn(adminDeleteItem);
  const moderate = useServerFn(moderateThread);
  const save = useServerFn(savePost);
  const unsave = useServerFn(unsavePost);
  const share = useServerFn(sharePost);
  const report = useServerFn(reportPost);
  const checkAdmin = useServerFn(checkAdminStatus);

  const adminQ = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => checkAdmin(),
    enabled: !!me,
    staleTime: 60_000,
  });
  const isAdmin = !!adminQ.data?.isAdmin;

  const invalidateThread = () => {
    qc.invalidateQueries({ queryKey: ["thread", id] });
    qc.invalidateQueries({ queryKey: ["feed"] });
  };

  const replyMut = useMutation({
    mutationFn: (args: { body: string; parent_reply_id?: string | null }) =>
      replyFn({ data: { post_id: id, body: args.body, parent_reply_id: args.parent_reply_id ?? null } }),
    onSuccess: () => {
      setReply("");
      invalidateThread();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const postReactMut = useMutation({
    mutationFn: (args: { kind: ReactionKind; on: boolean }) =>
      (args.on ? reactPostFn : unreactPostFn)({ data: { post_id: id, kind: args.kind } }),
    onMutate: async ({ kind, on }) => {
      await qc.cancelQueries({ queryKey: ["thread", id] });
      const prev = qc.getQueryData<FeedThread>(["thread", id]);
      if (!prev) return;
      let mine = prev.post.reactions_by_me;
      const counts = { ...prev.post.reaction_count };
      if (on) {
        for (const prevKind of mine) counts[prevKind] = Math.max((counts[prevKind] ?? 0) - 1, 0);
        mine = [kind];
        counts[kind] = (counts[kind] ?? 0) + 1;
      } else {
        mine = mine.filter((k: string) => k !== kind);
        counts[kind] = Math.max((counts[kind] ?? 0) - 1, 0);
      }
      qc.setQueryData(["thread", id], { ...prev, post: { ...prev.post, reactions_by_me: mine, reaction_count: counts } });
    },
    onError: () => invalidateThread(),
  });

  function togglePostReaction(kind: ReactionKind) {
    const prev = qc.getQueryData<FeedThread>(["thread", id]);
    const on = !prev?.post.reactions_by_me.includes(kind);
    postReactMut.mutate({ kind, on });
  }

  const replyReactMut = useMutation({
    mutationFn: (args: { replyId: string; kind: ReactionKind; on: boolean }) =>
      (args.on ? reactReplyFn : unreactReplyFn)({ data: { reply_id: args.replyId, kind: args.kind } }),
    onMutate: async ({ replyId, kind, on }) => {
      await qc.cancelQueries({ queryKey: ["thread", id] });
      const prev = qc.getQueryData<FeedThread>(["thread", id]);
      if (!prev) return;
      const replies = prev.replies.map((r) => {
        if (r.id !== replyId) return r;
        let mine = r.reactions_by_me;
        const counts = { ...r.reaction_count };
        if (on) {
          for (const prevKind of mine) counts[prevKind] = Math.max((counts[prevKind] ?? 0) - 1, 0);
          mine = [kind];
          counts[kind] = (counts[kind] ?? 0) + 1;
        } else {
          mine = mine.filter((k: string) => k !== kind);
          counts[kind] = Math.max((counts[kind] ?? 0) - 1, 0);
        }
        return { ...r, reactions_by_me: mine, reaction_count: counts };
      });
      qc.setQueryData(["thread", id], { ...prev, replies });
    },
    onError: () => invalidateThread(),
  });

  function toggleReplyReaction(replyId: string, kind: ReactionKind) {
    const prev = qc.getQueryData<FeedThread>(["thread", id]);
    const selectedReply = prev?.replies.find((r) => r.id === replyId);
    const on = !selectedReply?.reactions_by_me.includes(kind);
    replyReactMut.mutate({ replyId, kind, on });
  }

  const delMut = useMutation({
    mutationFn: (args: { replyId: string; asAdmin: boolean }) =>
      (args.asAdmin ? adminDel : del)({ data: { id: args.replyId, kind: "reply" } }),
    onSuccess: () => {
      toast.success("Reply deleted.");
      invalidateThread();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deletePostMut = useMutation({
    mutationFn: (args: { asAdmin: boolean }) =>
      (args.asAdmin ? adminDel : del)({ data: { id, kind: "post" } }),
    onSuccess: () => {
      toast.success("Post deleted.");
      qc.invalidateQueries({ queryKey: ["feed"] });
      navigate({ to: "/community" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMut = useMutation({
    mutationFn: (args: { currentlySaved: boolean }): Promise<{ ok: true; saved: boolean }> =>
      (args.currentlySaved ? unsave : save)({ data: { post_id: id } }),
    onMutate: ({ currentlySaved }) => {
      const prev = qc.getQueryData<FeedThread>(["thread", id]);
      if (prev) qc.setQueryData(["thread", id], { ...prev, post: { ...prev.post, is_saved: !currentlySaved } });
    },
    onSuccess: (r) => toast.success(r.saved ? "Saved post." : "Removed from saved."),
    onError: (e: Error) => {
      toast.error(e.message);
      invalidateThread();
    },
  });

  const shareMut = useMutation({
    mutationFn: () => share({ data: { post_id: id, channel: "share" } }),
    onMutate: () => {
      const prev = qc.getQueryData<FeedThread>(["thread", id]);
      if (prev) qc.setQueryData(["thread", id], { ...prev, post: { ...prev.post, share_count: prev.post.share_count + 1 } });
    },
    onError: () => invalidateThread(),
  });

  const reportMut = useMutation({
    mutationFn: () => report({ data: { post_id: id, reason: "community_report" } }),
    onSuccess: () => toast.success("Report submitted for review."),
    onError: (e: Error) => toast.error(e.message),
  });

  const lockMut = useMutation({
    mutationFn: (locked: boolean) => moderate({ data: { id, locked } }),
    onSuccess: (_r, locked) => {
      toast.success(locked ? "Thread locked." : "Thread unlocked.");
      invalidateThread();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { post, replies } = thread!;
  const ownsPost = me === post.user_id;

  return (
    <SiteLayout>
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-[200px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_280px]">
          <div className="hidden md:block">
            <LeftSidebar />
          </div>

          <div className="w-full min-w-0 space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-3 py-3 sm:px-4">
                <Link to="/community" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back to feed
                </Link>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border">
                  <MessageSquare className="h-3.5 w-3.5" /> Thread
                </div>
              </div>
              <PostCard
                post={post}
                viewerId={me}
                isAdmin={isAdmin}
                onToggleReaction={(_, kind) => togglePostReaction(kind)}
                onDelete={(_postId, asAdmin) => deletePostMut.mutate({ asAdmin })}
                onToggleSave={(_postId, currentlySaved) => saveMut.mutate({ currentlySaved })}
                onReport={() => reportMut.mutate()}
                onShare={() => shareMut.mutate()}
                canReact={!!me}
                hideReplyLink
                className="rounded-none border-0 shadow-none hover:border-transparent hover:shadow-none"
              />
            </div>

            {(isAdmin || ownsPost) && (
              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <Button variant="outline" size="sm" className="rounded-xl text-muted-foreground" disabled={lockMut.isPending} onClick={() => lockMut.mutate(!post.locked)}>
                    {post.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {post.locked ? "Unlock thread" : "Lock thread"}
                  </Button>
                )}
              </div>
            )}

            <section className="overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-5">
              <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </h2>

              {replies.length > 0 ? (
                <div className="mt-4">
                  <ReplyThread
                    replies={replies}
                    postId={id}
                    viewerId={me}
                    isAdmin={isAdmin}
                    locked={post.locked}
                    onToggleReplyReaction={toggleReplyReaction}
                    onReply={async (args) => {
                      await replyMut.mutateAsync(args);
                    }}
                    onDeleteReply={(replyId, asAdmin) => delMut.mutate({ replyId, asAdmin })}
                    pendingReply={replyMut.isPending}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No replies yet - start the conversation.</p>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground">Reply</h3>
              {post.locked ? (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Lock className="h-3.5 w-3.5" /> This thread is locked. New replies are turned off.
                </p>
              ) : me === null ? (
                <p className="mt-3 text-sm text-muted-foreground">
                  <Link to="/auth" className="text-primary">Sign in</Link> to join the conversation.
                </p>
              ) : (
                <>
                  <Textarea
                    rows={4}
                    maxLength={REPLY_BODY_MAX}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Add to the discussion..."
                    className="mt-3 resize-none rounded-xl"
                  />
                  <div className="mt-3 flex justify-end">
                    <Button className="rounded-xl" onClick={() => replyMut.mutate({ body: reply })} disabled={replyMut.isPending || reply.trim().length === 0}>
                      {replyMut.isPending ? "Posting..." : "Post reply"}
                    </Button>
                  </div>
                </>
              )}
            </section>
          </div>

          <aside className="hidden lg:block">
            <TrendingSidebar />
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}




