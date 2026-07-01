import { Link } from "@tanstack/react-router";
import { MessageSquare, Trash2, MoreHorizontal, Bookmark, Flag } from "lucide-react";
import { useState } from "react";
import { AuthorChip } from "./author-chip";
import { ReactionBar } from "./reaction-bar";
import { PostMediaGallery } from "./post-media-gallery";
import { usePostMediaUrls } from "@/hooks/use-post-media-urls";
import { Button } from "@/components/ui/button";
import { ShareBar } from "@/components/share-bar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COMMUNITY_CATEGORY_LABELS, type FeedPost, type ReactionKind } from "@/lib/community";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─── Category pill colours ─────────────────────────────────────────────────────
const CATEGORY_STYLES: Record<string, string> = {
  general: "bg-muted text-muted-foreground",
  questions: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "show-and-tell": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  resources: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  hiring: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  feedback: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

function renderBodyWithHashtags(body: string) {
  const parts = body.split(/(\s+)/);
  return parts.map((part, index) => {
    if (part.startsWith("#") && part.length > 1) {
      const cleanTag = part.replace(/[^\w]/g, "");
      return (
        <Link
          key={index}
          to="/community"
          search={{ tag: cleanTag }}
          className="text-primary font-semibold hover:underline"
        >
          {part}
        </Link>
      );
    }
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline font-semibold break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

type Props = {
  post: FeedPost;
  viewerId: string | null;
  isAdmin?: boolean;
  onToggleReaction?: (postId: string, kind: ReactionKind) => void | Promise<void>;
  onDelete?: (postId: string, asAdmin: boolean) => void;
  canReact?: boolean;
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
  const [saved, setSaved] = useState(false);
  const baseShares = Math.abs(
    post.id.split("-").reduce((acc, part) => acc + parseInt(part.slice(0, 4), 16), 0) % 8
  );
  const [localShares, setLocalShares] = useState(baseShares);

  const postUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/community/${post.id}`;
  const categoryLabel =
    COMMUNITY_CATEGORY_LABELS[post.category as keyof typeof COMMUNITY_CATEGORY_LABELS] ??
    post.category;
  const categoryStyle = CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES.general;

  // Total reaction count across all kinds
  const totalReactions = Object.values(post.reaction_count).reduce((a, b) => a + b, 0);

  return (
    <article
      className={cn(
        "group relative bg-card border border-border rounded-2xl transition-all duration-200",
        "hover:border-foreground/20 hover:shadow-md hover:-translate-y-px",
        className,
      )}
    >
      {/* ── Top action bar ─────────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-0 sm:px-5 sm:pt-5">
        {/* Avatar — standalone, links to profile */}
        <Link
          to="/u/$userId"
          params={{ userId: post.user_id }}
          className="shrink-0 mt-0.5"
          tabIndex={-1}
        >
          <AuthorChip
            author={post.author}
            userId={post.user_id}
            className="pointer-events-none"
            size="lg"
            avatarOnly
          />
        </Link>

        {/* Author meta + category */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to="/u/$userId"
              params={{ userId: post.user_id }}
              className="text-sm font-semibold text-foreground hover:underline"
            >
              {post.author?.display_name ?? "Someone"}
            </Link>
            <span className="text-xs text-muted-foreground">· {timeAgo(post.created_at)}</span>
            {post.category !== "general" && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  categoryStyle,
                )}
              >
                {categoryLabel}
              </span>
            )}
            {post.locked && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Locked
              </span>
            )}
          </div>
        </div>

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              aria-label="Post options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => { setSaved((s) => !s); toast.success(saved ? "Removed from saved" : "Saved!"); }}>
              <Bookmark className="mr-2 h-4 w-4" />
              {saved ? "Unsave" : "Save post"}
            </DropdownMenuItem>
            {!owns && (
              <DropdownMenuItem className="text-muted-foreground" onClick={() => toast.info("Report submitted.")}>
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            )}
            {canDelete && onDelete && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(post.id, !owns)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Post content ───────────────────────────────────────────── */}
      <div className="px-4 pt-3 sm:px-5 sm:pl-[68px]">
        {post.title && (
          <Link to="/community/$id" params={{ id: post.id }}>
            <h3 className="font-display text-base font-bold leading-snug text-foreground hover:text-primary transition-colors sm:text-lg">
              {post.title}
            </h3>
          </Link>
        )}
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
          {renderBodyWithHashtags(post.body)}
        </p>
      </div>

      {/* ── Media gallery (full width) ─────────────────────────────── */}
      {post.media_urls.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl mx-4 sm:mx-5 sm:ml-[68px]">
          <PostMediaGallery urls={mediaUrls} />
        </div>
      )}

      {/* ── Stats row ── */}
      {(totalReactions > 0 || post.reply_count > 0 || localShares > 0) && (
        <div className="mx-4 mt-3 flex items-center justify-between border-b border-border pb-2 text-xs text-muted-foreground sm:mx-5 sm:pl-[68px]">
          {/* Likes on the left */}
          <div className="flex items-center gap-1.5">
            {totalReactions > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-sm">
                  {Object.entries(post.reaction_count)
                    .filter(([, c]) => c > 0)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([kind]) =>
                      kind === "like" ? "👍" :
                      kind === "love" ? "❤️" :
                      kind === "celebrate" ? "🎉" :
                      kind === "insight" ? "💡" : "😄"
                    ).join("")}
                </span>
                <span className="font-semibold text-foreground/80">
                  {totalReactions}
                </span>
              </span>
            )}
          </div>

          {/* Comments & Shares on the right */}
          <div className="flex items-center gap-2">
            {post.reply_count > 0 && (
              <Link
                to="/community/$id"
                params={{ id: post.id }}
                className="hover:underline font-semibold text-foreground/80"
              >
                {post.reply_count} {post.reply_count === 1 ? "Comment" : "Comments"}
              </Link>
            )}
            {post.reply_count > 0 && localShares > 0 && (
              <span className="text-border">·</span>
            )}
            {localShares > 0 && (
              <span className="font-semibold text-foreground/80">
                {localShares} {localShares === 1 ? "Share" : "Shares"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Action bar ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-0.5 px-2 py-2 sm:px-3 sm:pl-[60px]">
        <ReactionBar
          counts={post.reaction_count}
          mine={post.reactions_by_me}
          onToggle={(k) => {
            if (canReact) onToggleReaction?.(post.id, k);
          }}
          disabled={!canReact}
          compact
        />

        {!hideReplyLink && (
          <Link
            to="/community/$id"
            params={{ id: post.id }}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Comment</span>
          </Link>
        )}

        <div className="ml-auto">
          <ShareBar
            title={post.title ?? "Community discussion on Melanated in Tech"}
            text={post.body.slice(0, 120)}
            url={postUrl}
            compact
            onShare={() => setLocalShares((s) => s + 1)}
          />
        </div>
      </div>
    </article>
  );
}
