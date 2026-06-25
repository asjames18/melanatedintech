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
import { ArrowLeft, Lock, Unlock } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PostCard } from "@/components/feed/post-card";
import { ReplyThread } from "@/components/feed/reply-thread";
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
    if (!t) return { meta: [{ title: "Thread — Melanated In Tech" }] };
    const seo = buildSeoMeta({
      title: t.post.title ? `${t.post.title} — Community` : "Community thread",
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
        <Link
          to="/community"
          className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
        >
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

  // Realtime: live-merge new replies (and detect new reactions on the post).
  useEffect(() => {
    const channel = supabase
      .channel(`thread-${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "discussion_comments",
          filter: `post_id=eq.${id}`,
        },
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
  }, [id]);

  const replyFn = useServerFn(replyToPost);
  const reactPostFn = useServerFn(reactPost);
  const unreactPostFn = useServerFn(unreactPost);
  const reactReplyFn = useServerFn(reactReply);
  const unreactReplyFn = useServerFn(unreactReply);
  const del = useServerFn(deleteItem);
  const adminDel = useServerFn(adminDeleteItem);
  const moderate = useServerFn(moderateThread);
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
      replyFn({
        data: { post_id: id, body: args.body, parent_reply_id: args.parent_reply_id ?? null },
      }),
    onSuccess: () => {
      setReply("");
      invalidateThread();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // --- Post reactions (optimistic on the thread cache) ---
  const postReactMut = useMutation({
    mutationFn: (args: { kind: ReactionKind; on: boolean }) =>
      (args.on ? reactPostFn : unreactPostFn)({ data: { post_id: id, kind: args.kind } }),
    onMutate: async ({ kind, on }) => {
      await qc.cancelQueries({ queryKey: ["thread", id] });
      const prev = qc.getQueryData<FeedThread>(["thread", id]);
      if (!prev) return;
      const mine = on
        ? Array.from(new Set([...prev.post.reactions_by_me, kind]))
        : prev.post.reactions_by_me.filter((k: string) => k !== kind);
      const counts = { ...prev.post.reaction_count };
      counts[kind] = on ? (counts[kind] ?? 0) + 1 : Math.max((counts[kind] ?? 0) - 1, 0);
      qc.setQueryData(["thread", id], {
        ...prev,
        post: { ...prev.post, reactions_by_me: mine, reaction_count: counts },
      });
    },
    onError: () => invalidateThread(),
  });

  function togglePostReaction(kind: ReactionKind) {
    const prev = qc.getQueryData<FeedThread>(["thread", id]);
    const on = !prev?.post.reactions_by_me.includes(kind);
    return postReactMut.mutate({ kind, on });
  }

  // --- Reply reactions (optimistic on the thread cache) ---
  const replyReactMut = useMutation({
    mutationFn: (args: { replyId: string; kind: ReactionKind; on: boolean }) =>
      (args.on ? reactReplyFn : unreactReplyFn)({
        data: { reply_id: args.replyId, kind: args.kind },
      }),
    onMutate: async ({ replyId, kind, on }) => {
      await qc.cancelQueries({ queryKey: ["thread", id] });
      const prev = qc.getQueryData<FeedThread>(["thread", id]);
      if (!prev) return;
      const replies = prev.replies.map((r) => {
        if (r.id !== replyId) return r;
        const mine = on
          ? Array.from(new Set([...r.reactions_by_me, kind]))
          : r.reactions_by_me.filter((k: string) => k !== kind);
        const counts = { ...r.reaction_count };
        counts[kind] = on ? (counts[kind] ?? 0) + 1 : Math.max((counts[kind] ?? 0) - 1, 0);
        return { ...r, reactions_by_me: mine, reaction_count: counts };
      });
      qc.setQueryData(["thread", id], { ...prev, replies });
    },
    onError: () => invalidateThread(),
  });

  function toggleReplyReaction(replyId: string, kind: ReactionKind) {
    const prev = qc.getQueryData<FeedThread>(["thread", id]);
    const reply = prev?.replies.find((r) => r.id === replyId);
    const on = !reply?.reactions_by_me.includes(kind);
    return replyReactMut.mutate({ replyId, kind, on });
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
      <article className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/community"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Community
        </Link>

        <div className="mt-4">
          <PostCard
            post={post}
            viewerId={me}
            isAdmin={isAdmin}
            onToggleReaction={togglePostReaction}
            onDelete={(postId, asAdmin) => deletePostMut.mutate({ asAdmin })}
            canReact={!!me}
            hideReplyLink
          />
        </div>

        {(isAdmin || ownsPost) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={lockMut.isPending}
                onClick={() => lockMut.mutate(!post.locked)}
              >
                {post.locked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                {post.locked ? "Unlock thread" : "Lock thread"}
              </Button>
            )}
          </div>
        )}

        <section className="mt-8">
          <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
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
                onReply={(args) => replyMut.mutateAsync(args)}
                onDeleteReply={(replyId, asAdmin) => delMut.mutate({ replyId, asAdmin })}
                pendingReply={replyMut.isPending}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No replies yet — start the conversation.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Reply
          </h3>
          {post.locked ? (
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <Lock className="h-3.5 w-3.5" /> This thread is locked. New replies are turned off.
            </p>
          ) : me === null ? (
            <p className="mt-3 text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary">
                Sign in
              </Link>{" "}
              to join the conversation.
            </p>
          ) : (
            <>
              <Textarea
                rows={4}
                maxLength={REPLY_BODY_MAX}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Add to the discussion…"
                className="mt-3"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => replyMut.mutate({ body: reply })}
                  disabled={replyMut.isPending || reply.trim().length === 0}
                >
                  {replyMut.isPending ? "Posting…" : "Post reply"}
                </Button>
              </div>
            </>
          )}
        </section>
      </article>
    </SiteLayout>
  );
}
