import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { getPublicProfile, toggleFollow } from "@/lib/community.functions";
import type { PublicProfile } from "@/lib/community";

/** Hover card showing a public profile summary + follow button.
 *  Wraps a trigger (usually an AuthorChip) and loads the profile on hover. */
export function AuthorCard({ userId, children }: { userId: string; children: React.ReactNode }) {
  const qc = useQueryClient();
  const getProfile = useServerFn(getPublicProfile);
  const follow = useServerFn(toggleFollow);

  const [open, setOpen] = useState(false);
  const q = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: () => getProfile({ data: { user_id: userId } }),
    enabled: open,
    staleTime: 30_000,
  });

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
    },
  });

  const profile = q.data;
  const avatarUrl = useAvatarUrl(profile?.avatar_url ?? null);

  return (
    <HoverCard openDelay={250} closeDelay={150} open={open} onOpenChange={setOpen}>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent align="start" className="w-72">
        {q.isPending || !profile ? (
          <div className="space-y-2">
            <div className="h-12 w-12 rounded-full bg-muted" />
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-2 w-32 rounded bg-muted" />
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                <AvatarFallback>
                  {(profile.display_name ?? "?").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link
                  to="/u/$userId"
                  params={{ userId }}
                  className="block truncate font-medium hover:underline"
                >
                  {profile.display_name ?? "Someone"}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {profile.post_count} {profile.post_count === 1 ? "post" : "posts"} ·{" "}
                  {profile.followers_count} followers
                </p>
              </div>
            </div>
            {profile.bio && <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>}
            <div className="mt-3 flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to="/u/$userId" params={{ userId }}>
                  View profile
                </Link>
              </Button>
              {profile.id !== null && !profile.is_following && (
                <Button size="sm" disabled={followMut.isPending} onClick={() => followMut.mutate()}>
                  {followMut.isPending ? "…" : "Follow"}
                </Button>
              )}
              {profile.is_following && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={followMut.isPending}
                  onClick={() => followMut.mutate()}
                >
                  Following
                </Button>
              )}
            </div>
          </div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
