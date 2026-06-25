import { useState } from "react";
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
    <ul className="space-y-3">
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

  // Collapse deeply nested threads past 4 levels to avoid horizontal scroll.
  const [collapsed, setCollapsed] = useState(false);

  return (
    <li>
      <div
        className={cn("rounded-xl border border-border bg-card p-3 sm:p-4", depth > 0 && "ml-0")}
      >
        <div className="flex items-start gap-2">
          <AuthorChip author={node.author} userId={node.user_id} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {node.author?.display_name ?? "Someone"}
              </span>
              <span>· {timeAgo(node.created_at)}</span>
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed">{node.body}</p>

            <div className="mt-2 flex items-center gap-1">
              <ReactionBar
                counts={node.reaction_count}
                mine={node.reactions_by_me}
                onToggle={(k) => canReact && onToggleReplyReaction?.(node.id, k)}
                disabled={!canReact}
              />
              {viewerId && !locked && onReply && (
                <button
                  type="button"
                  onClick={() => setShowReplyBox((s) => !s)}
                  className="rounded-full px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  Reply
                </button>
              )}
              {canDelete && onDeleteReply && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-6 w-6 text-muted-foreground hover:text-destructive"
                  title="Delete reply"
                  onClick={() => onDeleteReply(node.id, !owns)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplyBox && viewerId && !locked && onReply && (
        <div className="mt-2 ml-2 rounded-xl border border-border bg-muted/30 p-3 sm:ml-4">
          <Textarea
            rows={2}
            maxLength={REPLY_BODY_MAX}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={`Reply to ${node.author?.display_name ?? "this thread"}…`}
            className="resize-none"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowReplyBox(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={pendingReply || body.trim().length === 0}
              onClick={async () => {
                await onReply({ post_id: postId, body, parent_reply_id: node.id });
                setBody("");
                setShowReplyBox(false);
              }}
            >
              {pendingReply ? "Posting…" : "Reply"}
            </Button>
          </div>
        </div>
      )}

      {node.children.length > 0 && (
        <div className={cn("mt-2 space-y-3 border-l border-border pl-2 sm:pl-4")}>
          {depth >= 3 && !collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="text-xs text-muted-foreground hover:text-foreground"
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
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Show {node.children.length} {node.children.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      )}
    </li>
  );
}
