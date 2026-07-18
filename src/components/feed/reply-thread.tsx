import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AuthorChip } from "./author-chip";
import { ReactionBar } from "./reaction-bar";
import { REPLY_BODY_MAX, type FeedReply, type ReactionKind } from "@/lib/community";
import { timeAgo } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Props = {
  replies: FeedReply[];
  postId: string;
  viewerId: string | null;
  isAdmin?: boolean;
  locked?: boolean;
  onToggleReplyReaction?: (replyId: string, kind: ReactionKind) => void | Promise<void>;
  onReply?: (args: {
    post_id: string;
    body: string;
    parent_reply_id: string | null;
  }) => void | Promise<void>;
  onDeleteReply?: (replyId: string, asAdmin: boolean) => void;
  pendingReply?: boolean;
};

type TreeNode = FeedReply & { children: TreeNode[] };

function buildTree(replies: FeedReply[]): TreeNode[] {
  const byParent = new Map<string | null, TreeNode[]>();
  for (const r of replies) {
    const key = r.parent_reply_id ?? null;
    const list = byParent.get(key) ?? [];
    list.push({ ...r, children: [] });
    byParent.set(key, list);
  }
  const attach = (nodes: TreeNode[]): TreeNode[] =>
    nodes.map((n) => {
      n.children = attach(byParent.get(n.id) ?? []);
      return n;
    });
  return attach(byParent.get(null) ?? []);
}

export function ReplyThread({
  replies,
  postId,
  viewerId,
  isAdmin = false,
  locked = false,
  onToggleReplyReaction,
  onReply,
  onDeleteReply,
  pendingReply,
}: Props) {
  const tree = buildTree(replies);

  return (
    <ul className="min-w-0 space-y-4">
      {tree.map((node) => (
        <ReplyNode
          key={node.id}
          node={node}
          postId={postId}
          viewerId={viewerId}
          isAdmin={isAdmin}
          locked={locked}
          onToggleReplyReaction={onToggleReplyReaction}
          onReply={onReply}
          onDeleteReply={onDeleteReply}
          pendingReply={pendingReply}
        />
      ))}
    </ul>
  );
}

function ReplyNode({
  node,
  postId,
  viewerId,
  isAdmin,
  locked,
  onToggleReplyReaction,
  onReply,
  onDeleteReply,
  pendingReply,
  depth = 0,
}: {
  node: TreeNode;
  postId: string;
  viewerId: string | null;
  isAdmin?: boolean;
  locked?: boolean;
  onToggleReplyReaction?: (replyId: string, kind: ReactionKind) => void | Promise<void>;
  onReply?: (args: {
    post_id: string;
    body: string;
    parent_reply_id: string | null;
  }) => void | Promise<void>;
  onDeleteReply?: (replyId: string, asAdmin: boolean) => void;
  pendingReply?: boolean;
  depth?: number;
}) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [body, setBody] = useState("");
  const owns = viewerId === node.user_id;
  const canDelete = owns || isAdmin;
  const canReact = !!viewerId;
  const [collapsed, setCollapsed] = useState(false);

  return (
    <li className="min-w-0">
      <div className="group/comment flex min-w-0 items-start gap-2.5">
        <AuthorChip author={node.author} userId={node.user_id} className="mt-1" avatarOnly />

        <div className="min-w-0 flex-1">
          <div className="relative max-w-2xl rounded-2xl bg-muted/55 px-3.5 py-3 text-sm ring-1 ring-border/40 sm:px-4">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 pr-7 text-xs text-muted-foreground">
              <Link to="/u/$userId" params={{ userId: node.user_id }} className="font-semibold text-foreground hover:underline">
                {node.author?.display_name ?? "Someone"}
              </Link>
              <span suppressHydrationWarning>{timeAgo(node.created_at)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap break-words leading-relaxed text-foreground/90">{node.body}</p>

            {canDelete && onDeleteReply && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-7 w-7 rounded-full text-muted-foreground opacity-100 hover:bg-background hover:text-destructive sm:opacity-0 sm:group-hover/comment:opacity-100"
                title="Delete reply"
                onClick={() => onDeleteReply(node.id, !owns)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <div className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1 pl-1">
            <ReactionBar
              counts={node.reaction_count}
              mine={node.reactions_by_me}
              onToggle={(k) => {
                if (canReact) onToggleReplyReaction?.(node.id, k);
              }}
              disabled={!canReact}
              compact
            />
            {viewerId && !locked && onReply && (
              <button
                type="button"
                onClick={() => setShowReplyBox((s) => !s)}
                className="rounded-full px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyBox && viewerId && !locked && onReply && (
        <div className="ml-10 mt-2 min-w-0 max-w-2xl rounded-2xl border border-border bg-background p-3 shadow-sm sm:ml-12">
          <Textarea
            rows={2}
            maxLength={REPLY_BODY_MAX}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Reply to ${node.author?.display_name ?? "this thread"}...`}
            className="resize-none rounded-xl"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => setShowReplyBox(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              className="rounded-xl"
              disabled={pendingReply || body.trim().length === 0}
              onClick={async () => {
                await onReply({ post_id: postId, body, parent_reply_id: node.id });
                setBody("");
                setShowReplyBox(false);
              }}
            >
              {pendingReply ? "Posting..." : "Reply"}
            </Button>
          </div>
        </div>
      )}

      {node.children.length > 0 && (
        <div className={cn("ml-5 mt-3 min-w-0 space-y-3 border-l border-border/70 pl-4 sm:ml-6", depth > 2 && "ml-3 pl-3")}>
          {depth >= 3 && !collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Hide {node.children.length} {node.children.length === 1 ? "reply" : "replies"}
            </button>
          ) : null}
          {!collapsed &&
            node.children.map((child) => (
              <ReplyNode
                key={child.id}
                node={child}
                postId={postId}
                viewerId={viewerId}
                isAdmin={isAdmin}
                locked={locked}
                onToggleReplyReaction={onToggleReplyReaction}
                onReply={onReply}
                onDeleteReply={onDeleteReply}
                pendingReply={pendingReply}
                depth={depth + 1}
              />
            ))}
          {collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Show {node.children.length} {node.children.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

