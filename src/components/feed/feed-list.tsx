import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PostCard } from "./post-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { listFeed } from "@/lib/community.functions";
import type { FeedTab, ReactionKind } from "@/lib/community";
import type { PostType } from "./feed-composer";

type Props = {
  viewerId: string | null | undefined;
  isAdmin?: boolean;
  tab?: FeedTab;
  tag?: string;
  onToggleReaction?: (postId: string, kind: ReactionKind) => void | Promise<void>;
  onDelete?: (postId: string, asAdmin: boolean) => void;
  onToggleSave?: (postId: string, currentlySaved: boolean) => void;
  onReport?: (postId: string) => void;
  onShare?: (postId: string, channel?: string) => void;
  newPostsBanner?: number;
  onClearBanner?: () => void;
  onStartPost?: (postType: PostType) => void;
  onBrowseLatest?: () => void;
};

const PAGE_SIZE = 20;

export function FeedList({
  viewerId,
  isAdmin = false,
  tab = "for-you",
  tag,
  onToggleReaction,
  onDelete,
  onToggleSave,
  onReport,
  onShare,
  newPostsBanner = 0,
  onClearBanner,
  onStartPost,
  onBrowseLatest,
}: Props) {
  const list = useServerFn(listFeed);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [banner, setBanner] = useState(0);

  const q = useInfiniteQuery({
    queryKey: ["feed", tab, tag ?? null],
    queryFn: ({ pageParam }) => list({ data: { cursor: pageParam, limit: PAGE_SIZE, tab, tag } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.next_cursor ?? undefined,
  });

  useEffect(() => {
    if (tab !== "for-you") return;
    const channel = supabase
      .channel("feed-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "discussion_posts" }, () => setBanner((n) => n + 1))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [tab]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [q.hasNextPage, q.isFetchingNextPage]);

  const pages = q.data?.pages ?? [];
  const posts = pages.flatMap((p) => p.posts);
  const bannerCount = newPostsBanner || banner;

  return (
    <div>
      {bannerCount > 0 && (
        <button
          type="button"
          onClick={() => {
            q.refetch();
            setBanner(0);
            onClearBanner?.();
          }}
          className="sticky top-2 z-10 mb-3 w-full rounded-full bg-primary px-4 py-2 text-center text-xs font-medium text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          {bannerCount} new {bannerCount === 1 ? "post" : "posts"} - View
        </button>
      )}

      {pages.length === 0 && q.isPending ? (
        <FeedSkeleton />
      ) : posts.length === 0 ? (
        <EmptyFeedState
          tab={tab}
          viewerId={viewerId}
          onStartPost={onStartPost}
          onBrowseLatest={onBrowseLatest}
        />
      ) : (
        <ul className="space-y-3">
          {posts.map((p) => (
            <li key={p.id}>
              <PostCard
                post={p}
                viewerId={viewerId ?? null}
                isAdmin={isAdmin}
                onToggleReaction={onToggleReaction}
                onDelete={onDelete}
                onToggleSave={onToggleSave}
                onReport={onReport}
                onShare={onShare}
              />
            </li>
          ))}
        </ul>
      )}

      <div ref={sentinelRef} className="h-px w-full" />

      {q.isFetchingNextPage && (
        <div className="mt-3">
          <FeedSkeleton count={2} />
        </div>
      )}
    </div>
  );
}

function EmptyFeedState({
  tab,
  viewerId,
  onStartPost,
  onBrowseLatest,
}: {
  tab: FeedTab;
  viewerId: string | null | undefined;
  onStartPost?: (postType: PostType) => void;
  onBrowseLatest?: () => void;
}) {
  const intentByTab: Partial<Record<FeedTab, PostType>> = {
    questions: "question",
    "ai-agents": "agent",
    showcase: "agent",
  };
  const postType = intentByTab[tab] ?? "build";
  const actionLabel = postType === "question" ? "Ask a question" : postType === "agent" ? "Showcase an agent" : "Share an update";
  const description = tab === "following"
    ? "Follow builders to see their posts here."
    : postType === "question"
      ? "Be the first to ask the Community a question."
      : "Be the first to share an AI build, question, or resource.";

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center sm:p-12">
      <p className="font-display text-lg font-semibold">No posts yet</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {viewerId === undefined ? (
        <p className="mt-4 text-xs font-medium text-muted-foreground" role="status">Loading participation options...</p>
      ) : viewerId === null ? (
        <Button asChild size="sm" className="mt-4 rounded-xl">
          <Link to="/auth">Sign in to participate</Link>
        </Button>
      ) : tab === "following" && onBrowseLatest ? (
        <Button type="button" size="sm" className="mt-4 rounded-xl" onClick={onBrowseLatest}>
          Browse latest updates
        </Button>
      ) : onStartPost ? (
        <Button type="button" size="sm" className="mt-4 rounded-xl" onClick={() => onStartPost(postType)}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ul className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="mt-3 h-3 w-full" />
          <Skeleton className="mt-1.5 h-3 w-5/6" />
          <Skeleton className="mt-1.5 h-3 w-2/3" />
        </li>
      ))}
    </ul>
  );
}
