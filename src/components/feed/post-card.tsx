import { Link } from "@tanstack/react-router";
import { MessageSquare, Trash2, MoreHorizontal, Bookmark, Flag } from "lucide-react";
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

// Class format mirrors the PALETTE in src/lib/category-style.ts so community
// chips read as the same system as marketplace/knowledge category tiles.
const CATEGORY_STYLES: Record<string, string> = {
  general: "bg-muted text-muted-foreground",
  questions: "bg-amber-500/12 text-amber-600 dark:text-amber-300",
  "show-and-tell": "bg-emerald-500/12 text-emerald-600 dark:text-emerald-300",
  "agent-showcase": "bg-cyan-500/12 text-cyan-600 dark:text-cyan-300",
  resources: "bg-blue-500/12 text-blue-600 dark:text-blue-300",
  hiring: "bg-violet-500/12 text-violet-600 dark:text-violet-300",
  feedback: "bg-rose-500/12 text-rose-600 dark:text-rose-300",
};

const REACTION_TEXT: Record<string, string> = {
  like: "Like",
  love: "Love",
  celebrate: "Celebrate",
  insight: "Insight",
  funny: "Funny",
};

function renderBodyWithHashtags(body: string) {
  const parts = body.split(/(\s+)/);
  return parts.map((part, index) => {
    if (part.startsWith("#") && part.length > 1) {
      const cleanTag = part.replace(/[^\w]/g, "");
      return (
        <Link key={index} to="/community" search={{ tag: cleanTag }} className="font-semibold text-primary hover:underline">
          {part}
        </Link>
      );
    }
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-primary hover:underline">
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
  onToggleSave?: (postId: string, currentlySaved: boolean) => void;
  onReport?: (postId: string) => void;
  onShare?: (postId: string, channel?: string) => void;
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
  onToggleSave,
  onReport,
  onShare,
  canReact = true,
  hideReplyLink = false,
  className,
}: Props) {
  const mediaUrls = usePostMediaUrls(post.media_urls);
  const owns = viewerId === post.user_id;
  const canDelete = owns || isAdmin;
  const postUrl = `/community/${post.id}`;
  const categoryLabel = COMMUNITY_CATEGORY_LABELS[post.category as keyof typeof COMMUNITY_CATEGORY_LABELS] ?? post.category;
  const categoryStyle = CATEGORY_STYLES[post.category] ?? CATEGORY_STYLES.general;
  const totalReactions = Object.values(post.reaction_count).reduce((a, b) => a + b, 0);
  const canUseSocialActions = !!viewerId;

  return (
    <article className={cn("group relative w-full min-w-0 overflow-hidden rounded-2xl border border-border/80 bg-card transition-all duration-200 hover:border-foreground/20 hover:shadow-md", className)}>
      <div className="flex items-start gap-3 px-4 pb-0 pt-4 sm:px-5 sm:pt-5">
        <AuthorChip author={post.author} userId={post.user_id} className="mt-0.5" size="lg" avatarOnly />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link to="/u/$userId" params={{ userId: post.user_id }} className="text-sm font-semibold text-foreground hover:underline">
              {post.author?.display_name ?? "Someone"}
            </Link>
            <span suppressHydrationWarning className="text-xs text-muted-foreground">• {timeAgo(post.created_at)}</span>
            {post.viewer_follows_author && <span className="text-xs font-medium text-primary">Following</span>}
            {post.category !== "general" && (
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider", categoryStyle)}>
                {categoryLabel}
              </span>
            )}
            {post.rank_reason && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{post.rank_reason}</span>}
            {post.locked && <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-300">Locked</span>}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground opacity-100 transition-opacity hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100" aria-label="Post options">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem
              disabled={!canUseSocialActions}
              onClick={() => canUseSocialActions ? onToggleSave?.(post.id, post.is_saved) : toast.info("Sign in to save posts.")}
            >
              <Bookmark className={cn("mr-2 h-4 w-4", post.is_saved && "fill-current text-primary")} />
              {post.is_saved ? "Unsave" : "Save post"}
            </DropdownMenuItem>
            {!owns && (
              <DropdownMenuItem disabled={!canUseSocialActions} className="text-muted-foreground" onClick={() => canUseSocialActions ? onReport?.(post.id) : toast.info("Sign in to report posts.")}>
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
            )}
            {canDelete && onDelete && (
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(post.id, !owns)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-4 pt-2.5 sm:px-5 sm:pl-[68px]">
        {post.title && (
          <Link to="/community/$id" params={{ id: post.id }}>
            <h3 className="font-display text-base font-semibold leading-snug text-foreground transition-colors hover:text-primary sm:text-lg">{post.title}</h3>
          </Link>
        )}
        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-foreground/90">{renderBodyWithHashtags(post.body)}</p>
      </div>

      {post.media_urls.length > 0 && (
        <div className="mx-4 mt-3 overflow-hidden rounded-xl sm:mx-5 sm:ml-[68px]">
          <PostMediaGallery urls={mediaUrls} />
        </div>
      )}

      {post.comment_preview.length > 0 && (
        <div className="mx-4 mt-3 min-w-0 space-y-2 rounded-xl bg-muted/50 p-3 sm:mx-5 sm:ml-[68px]">
          {post.comment_preview.map((comment) => (
            <Link key={comment.id} to="/community/$id" params={{ id: post.id }} className="block min-w-0 break-words text-xs leading-relaxed text-muted-foreground hover:text-foreground">
              <span className="font-semibold text-foreground">{comment.author?.display_name ?? "Someone"}: </span>
              {comment.body.length > 140 ? `${comment.body.slice(0, 140)}...` : comment.body}
            </Link>
          ))}
        </div>
      )}

      {(totalReactions > 0 || post.reply_count > 0 || post.share_count > 0) && (
        <div className="mx-4 mt-3 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2 text-xs text-muted-foreground sm:mx-5 sm:pl-[68px]">
          <div className="flex items-center gap-1.5">
            {totalReactions > 0 && <span className="font-semibold text-foreground/80">{totalReactions} reactions</span>}
          </div>
          <div className="flex items-center gap-2">
            {post.reply_count > 0 && <Link to="/community/$id" params={{ id: post.id }} className="font-semibold text-foreground/80 hover:underline">{post.reply_count} {post.reply_count === 1 ? "Comment" : "Comments"}</Link>}
            {post.share_count > 0 && <span className="font-semibold text-foreground/80">{post.share_count} {post.share_count === 1 ? "Share" : "Shares"}</span>}
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-wrap items-center gap-1 px-3 py-2.5 sm:px-4 sm:pl-[60px]">
        <ReactionBar counts={post.reaction_count} mine={post.reactions_by_me} onToggle={(k) => { if (canReact) onToggleReaction?.(post.id, k); }} disabled={!canReact} compact />

        {!hideReplyLink && (
          <Link to="/community/$id" params={{ id: post.id }} className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <MessageSquare className="h-4 w-4" />
            <span className="text-xs">Comment</span>
          </Link>
        )}

        <button
          type="button"
          disabled={!canUseSocialActions}
          onClick={() => canUseSocialActions ? onToggleSave?.(post.id, post.is_saved) : toast.info("Sign in to save posts.")}
          className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <Bookmark className={cn("h-4 w-4", post.is_saved && "fill-current text-primary")} />
          <span className="hidden xs:inline text-xs">Save</span>
        </button>

        <div className="ml-auto shrink-0">
          <ShareBar title={post.title ?? "Community discussion on Melanated in Tech"} text={post.body.slice(0, 120)} url={postUrl} compact onShare={() => onShare?.(post.id, "share")} />
        </div>
      </div>
    </article>
  );
}




