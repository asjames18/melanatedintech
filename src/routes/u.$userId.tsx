import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
  queryOptions,
} from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout } from "@/components/site-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/feed/post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { supabase } from "@/integrations/supabase/client";
import {
  getPublicProfile,
  listUserPosts,
  toggleFollow,
  reactPost,
  unreactPost,
  deleteItem,
  adminDeleteItem,
} from "@/lib/community.functions";
import { checkAdminStatus } from "@/lib/admin.functions";
import { type FeedPage, type PublicProfile, type ReactionKind } from "@/lib/community";
import { buildSeoMeta } from "@/lib/seo";
import { toast } from "sonner";

const profileQO = (userId: string) =>
  queryOptions({
    queryKey: ["public-profile", userId],
    queryFn: () => getPublicProfile({ data: { user_id: userId } }),
  });

export const Route = createFileRoute("/u/$userId")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(profileQO(params.userId));
    if (!p) throw notFound();
    return { profile: p };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.profile;
    return {
      meta: buildSeoMeta({
        title: p ? `${p.display_name ?? "Someone"} — Melanated In Tech` : "Profile",
        description: p?.bio ?? undefined,
        url: p ? `/u/${p.id}` : undefined,
      }),
    };
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Profile not found</h1>
        <Link to="/community" className="mt-6 inline-block text-sm font-medium text-primary">
          Back to community
        </Link>
      </div>
    </SiteLayout>
  ),
  component: ProfilePage,
});

function ProfilePage() {
  const { userId } = Route.useParams();
  const qc = useQueryClient();
  const { data: profile } = useSuspenseQuery(profileQO(userId));
  const [me, setMe] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  const follow = useServerFn(toggleFollow);
  const avatarUrl = useAvatarUrl(profile.avatar_url);

  const followMut = useMutation({
    mutationFn: () => follow({ data: { followee_id: userId } }),
    onSuccess: (r) => {
      qc.setQueryData<PublicProfile | null>(["public-profile", userId], (p) =>
        p
          ? {
              ...p,
              is_following: r.following,
              followers_count: p.followers_count + (r.following ? 1 : -1),
            }
          : p,
      );
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const isSelf = me === userId;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground">
          ← Community
        </Link>

        <header className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="text-xl">
              {(profile.display_name ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-display text-2xl font-semibold">
              {profile.display_name ?? "Someone"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.post_count} {profile.post_count === 1 ? "post" : "posts"} ·{" "}
              {profile.followers_count} followers · {profile.following_count} following
            </p>
            {profile.bio && <p className="mt-3 text-sm">{profile.bio}</p>}
          </div>
          {!isSelf && me && (
            <Button
              variant={profile.is_following ? "outline" : "default"}
              disabled={followMut.isPending}
              onClick={() => followMut.mutate()}
            >
              {followMut.isPending ? "…" : profile.is_following ? "Following" : "Follow"}
            </Button>
          )}
        </header>

        <div className="mt-8 border-t border-border pt-6">
          <h2 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
            Posts
          </h2>
          <UserPosts userId={userId} viewerId={me} />
        </div>
      </section>
    </SiteLayout>
  );
}

function UserPosts({ userId, viewerId }: { userId: string; viewerId: string | null }) {
  const list = useServerFn(listUserPosts);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const q = useInfiniteQuery({
    queryKey: ["user-posts", userId],
    queryFn: ({ pageParam }) => list({ data: { user_id: userId, cursor: pageParam, limit: 10 } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  });

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && q.hasNextPage && !q.isFetchingNextPage) {
          q.fetchNextPage();
        }
      },
      { rootMargin: "600px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [q.hasNextPage, q.isFetchingNextPage]);

  const posts = q.data?.pages.flatMap((p) => p.posts) ?? [];

  const checkAdmin = useServerFn(checkAdminStatus);
  const adminQ = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => checkAdmin(),
    enabled: !!viewerId,
    staleTime: 60_000,
  });
  const isAdmin = !!adminQ.data?.isAdmin;

  const qc = useQueryClient();
  const react = useServerFn(reactPost);
  const unreact = useServerFn(unreactPost);
  const del = useServerFn(deleteItem);
  const adminDel = useServerFn(adminDeleteItem);

  const reactMut = useMutation({
    mutationFn: (args: { postId: string; kind: ReactionKind; on: boolean }) =>
      (args.on ? react : unreact)({ data: { post_id: args.postId, kind: args.kind } }),
    onMutate: async ({ postId, kind, on }) => {
      await qc.cancelQueries({ queryKey: ["user-posts", userId] });
      const cache = qc.getQueriesData<{ pages: FeedPage[] }>({
        queryKey: ["user-posts", userId],
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
    onError: () => qc.invalidateQueries({ queryKey: ["user-posts", userId] }),
  });

  function toggleReaction(postId: string, kind: ReactionKind) {
    const cache = qc.getQueriesData<{ pages: FeedPage[] }>({
      queryKey: ["user-posts", userId],
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
      qc.invalidateQueries({ queryKey: ["user-posts", userId] });
      qc.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isPending) {
    return (
      <ul className="mt-3 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i} className="rounded-2xl border border-border bg-card p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-1 h-3 w-5/6" />
          </li>
        ))}
      </ul>
    );
  }

  if (posts.length === 0) {
    return <p className="mt-3 text-sm text-muted-foreground">No posts yet.</p>;
  }

  return (
    <div className="mt-3">
      <ul className="space-y-3">
        {posts.map((p) => (
          <li key={p.id}>
            <PostCard
              post={p}
              viewerId={viewerId}
              isAdmin={isAdmin}
              onToggleReaction={toggleReaction}
              onDelete={(postId, asAdmin) => delMut.mutate({ postId, asAdmin })}
              canReact={!!viewerId}
            />
          </li>
        ))}
      </ul>
      <div ref={sentinelRef} className="h-px w-full" />
    </div>
  );
}
