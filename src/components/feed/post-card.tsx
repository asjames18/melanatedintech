import { Link } from "@tanstack/react-router";
import { MessageSquare, Trash2 } from "lucide-react";
import { useState } from "react";
import { AuthorChip } from "./author-chip";
import { ReactionBar } from "./reaction-bar";
import { PostMediaGallery } from "./post-media-gallery";
import { usePostMediaUrls } from "@/hooks/use-post-media-urls";
import { Button } from "@/components/ui/button";
import { COMMUNITY_CATEGORY_LABELS, type FeedPost, type ReactionKind } from "@/lib/community";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  post: FeedPost;
  viewerId: string | null;
  isAdmin?: boolean;
  onToggleReaction?: (postId: string, kind: ReactionKind) => void | Promise<void>;
  onDelete?: (postId: string, asAdmin: boolean) => void;
  canReact?: boolean;
  /** Hide the reply count link (used on the thread-detail page where replies are below). */
  hideReplyLink?: boolean;
  className?: string;
};

export function PostCard({
  post,
  viewerId,
  isAdmin = false,
  onToggleReaction,
  onDelete,
  canReact = true,
  hideReplyLink = false,
  className,
}: Props) {
  const mediaUrls = usePostMediaUrls(post.media_urls);
  const owns = viewerId === post.user_id;
  const canDelete = owns || isAdmin;

  return (
    <article
      className={cn(
        "rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/15 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <AuthorChip author={post.author} userId={post.user_id} className="shrink-0" size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {post.author?.display_name ?? "Someone"}
            </span>
            <span>· {timeAgo(post.created_at)}</span>
            {post.category !== "general" && (
              <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider">
                {COMMUNITY_CATEGORY_LABELS[
                  post.category as keyof typeof COMMUNITY_CATEGORY_LABELS
                ] ?? post.category}
              </span>
            )}
            {post.locked && <span className="text-amber-500">· locked</span>}
          </div>
        </div>
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-destructive"
            title="Delete post"
            onClick={() => onDelete(post.id, !owns)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {post.title && (
        <h3 className="mt-3 font-display text-base font-semibold sm:text-lg">{post.title}</h3>
      )}

      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{post.body}</p>

      {post.media_urls.length > 0 && (
        <div className="mt-3">
          <PostMediaGallery urls={mediaUrls} />
        </div>
      )}

      <div className="mt-3 flex items-center gap-1 border-t border-border pt-2 text-xs text-muted-foreground">
        <ReactionBar
          counts={post.reaction_count}
          mine={post.reactions_by_me}
          onToggle={(k) => canReact && onToggleReaction?.(post.id, k)}
          disabled={!canReact}
        />
        {!hideReplyLink && (
          <Link
            to="/community/$id"
            params={{ id: post.id }}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-1 hover:bg-muted hover:text-foreground"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {post.reply_count} {post.reply_count === 1 ? "reply" : "replies"}
          </Link>
        )}
      </div>
    </article>
  );
}
