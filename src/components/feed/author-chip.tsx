import { Link } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { AuthorCard } from "./author-card";
import { cn } from "@/lib/utils";
import type { Author } from "@/lib/community";

function initials(name: string | null): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "??";
}

/**
 * Inline author chip used on posts + replies: avatar + display name linking to
 * the author's public profile. Hovering reveals a richer profile card.
 */
export function AuthorChip({
  author,
  userId,
  className,
  size = "sm",
}: {
  author: Author | null;
  userId: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const avatarUrl = useAvatarUrl(author?.avatar_url ?? null);
  const dim = size === "md" ? "h-9 w-9" : "h-7 w-7";

  const chip = (
    <Link
      to="/u/$userId"
      params={{ userId }}
      className={cn("group inline-flex items-center gap-2", className)}
    >
      <Avatar className={dim}>
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback className="text-[10px] font-medium">
          {initials(author?.display_name ?? null)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-medium group-hover:underline">
        {author?.display_name ?? "Someone"}
      </span>
    </Link>
  );

  return <AuthorCard userId={userId}>{chip}</AuthorCard>;
}
