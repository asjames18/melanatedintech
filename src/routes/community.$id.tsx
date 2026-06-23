import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Lock, Trash2, Unlock } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  getDiscussionThread,
  createDiscussionComment,
  deleteDiscussionItem,
  moderateDiscussionThread,
  adminDeleteDiscussionItem,
} from "@/lib/community.functions";
import { checkAdminStatus } from "@/lib/admin.functions";
import { useQuery } from "@tanstack/react-query";
import { buildSeoMeta } from "@/lib/seo";
import { timeAgo } from "@/lib/utils";
import { toast } from "sonner";

const threadQO = (id: string) =>
  queryOptions({ queryKey: ["discussion-thread", id], queryFn: () => getDiscussionThread({ data: { id } }) });

export const Route = createFileRoute("/community/$id")({
  loader: async ({ context, params }) => {
    const t = await context.queryClient.ensureQueryData(threadQO(params.id));
    if (!t) throw notFound();
    return { thread: t };
  },
  head: ({ loaderData }) => {
    const t = loaderData?.thread;
    if (!t) return { meta: [{ title: "Thread — Melanated In Tech" }] };
    return {
      meta: buildSeoMeta({
        title: `${t.post.title} — Community`,
        description: t.post.body.slice(0, 160),
        url: `/community/${t.post.id}`,
        type: "article",
      }),
    };
  },
  errorComponent: ({ error }) => <SiteLayout><div className="p-12 text-center text-sm text-muted-foreground">{error.message}</div></SiteLayout>,
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

  const create = useServerFn(createDiscussionComment);
  const del = useServerFn(deleteDiscussionItem);
  const adminDel = useServerFn(adminDeleteDiscussionItem);
  const moderate = useServerFn(moderateDiscussionThread);
  const checkAdmin = useServerFn(checkAdminStatus);

  const adminQ = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => checkAdmin(),
    enabled: !!me,
    staleTime: 60_000,
  });
  const isAdmin = !!adminQ.data?.isAdmin;

  const replyMut = useMutation({
    mutationFn: () => create({ data: { post_id: id, body: reply } }),
    onSuccess: () => {
      setReply("");
      qc.invalidateQueries({ queryKey: ["discussion-thread", id] });
      qc.invalidateQueries({ queryKey: ["discussion-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Owners delete their own content; admins can delete anyone's (via the
  // service-role fn, which isn't bound by RLS).
  const delMut = useMutation({
    mutationFn: (args: { id: string; kind: "post" | "comment"; asAdmin?: boolean }) =>
      (args.asAdmin ? adminDel : del)({ data: { id: args.id, kind: args.kind } }),
    onSuccess: (_r, args) => {
      toast.success(args.kind === "post" ? "Thread deleted." : "Comment deleted.");
      if (args.kind === "post") {
        qc.invalidateQueries({ queryKey: ["discussion-posts"] });
        navigate({ to: "/community" });
      } else {
        qc.invalidateQueries({ queryKey: ["discussion-thread", id] });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lockMut = useMutation({
    mutationFn: (locked: boolean) => moderate({ data: { id, locked } }),
    onSuccess: (_r, locked) => {
      toast.success(locked ? "Thread locked." : "Thread unlocked.");
      qc.invalidateQueries({ queryKey: ["discussion-thread", id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const { post, comments } = thread!;
  const ownsPost = me === post.user_id;
  const canRemovePost = ownsPost || isAdmin;

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <Link to="/community" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Community
        </Link>

        <header className="mt-6 border-b border-border pb-6">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs uppercase tracking-wider text-muted-foreground">
            {post.category}
          </span>
          <h1 className="mt-3 font-display text-3xl font-semibold">{post.title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            {post.author?.display_name ?? "Someone"} · {timeAgo(post.created_at)}
          </p>
          <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap text-foreground">
            {post.body}
          </div>
          {(canRemovePost || isAdmin) && (
            <div className="mt-4 flex flex-wrap gap-2">
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
              {canRemovePost && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={() => delMut.mutate({ id: post.id, kind: "post", asAdmin: !ownsPost })}
                >
                  <Trash2 className="h-4 w-4" /> Delete thread
                </Button>
              )}
            </div>
          )}
        </header>

        <section className="mt-8">
          <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            {comments.length} {comments.length === 1 ? "reply" : "replies"}
          </h2>
          <ul className="mt-4 space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {c.author?.display_name ?? "Someone"} · {timeAgo(c.created_at)}
                  </p>
                  {(me === c.user_id || isAdmin) && (
                    <button
                      onClick={() => delMut.mutate({ id: c.id, kind: "comment", asAdmin: me !== c.user_id })}
                      className="text-xs text-muted-foreground hover:text-foreground"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">Reply</h3>
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
                maxLength={2000}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Add to the discussion…"
                className="mt-3"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  onClick={() => replyMut.mutate()}
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
