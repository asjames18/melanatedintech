import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPublicProfile } from "@/lib/community.functions";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Compass, BookOpen, Trophy, Sparkles, MessageSquare, Bot, UserPlus, UsersRound } from "lucide-react";

export function LeftSidebar({
  viewerId = null,
  authResolved = true,
}: {
  viewerId?: string | null;
  authResolved?: boolean;
}) {
  const getProfileFn = useServerFn(getPublicProfile);

  const profileQ = useQuery({
    queryKey: ["my-profile", viewerId],
    queryFn: () => getProfileFn({ data: { user_id: viewerId! } }),
    enabled: authResolved && !!viewerId,
  });
  const myProfile = profileQ.data;
  const avatarUrl = useAvatarUrl(myProfile?.avatar_url ?? null);

  return (
    <div className="hidden md:block space-y-4 sticky top-24 h-fit">
      {!authResolved || (viewerId !== null && !myProfile) ? (
        <ProfileSidebarSkeleton />
      ) : viewerId && myProfile ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-foreground/10">
          <div className="relative h-20 bg-muted bg-[radial-gradient(circle_at_20%_20%,color-mix(in_oklab,var(--color-accent2)_24%,transparent),transparent_34%),radial-gradient(circle_at_80%_10%,color-mix(in_oklab,var(--color-primary)_22%,transparent),transparent_32%)]">
            {myProfile.cover_url && <img src={myProfile.cover_url} alt="" className="h-full w-full object-cover" />}
          </div>

          <div className="px-4 pb-5 text-center">
            <Avatar className="mx-auto -mt-8 h-16 w-16 border-4 border-card shadow-md ring-1 ring-border/40">
              {avatarUrl ? <AvatarImage src={avatarUrl} /> : null}
              <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                {(myProfile.display_name ?? "AI").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <Link to="/u/$userId" params={{ userId: viewerId }} className="mt-3 block font-display text-base font-semibold text-foreground hover:text-primary hover:underline">
              {myProfile.display_name ?? "AI Builder"}
            </Link>
            <div className="mx-auto mt-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Bot className="h-3 w-3" /> Builder profile
            </div>
            <p className="mt-3 line-clamp-2 px-1 text-xs leading-relaxed text-muted-foreground">
              {myProfile.bio ?? "Building, testing, and sharing AI agents with the community."}
            </p>

            {myProfile.builder_focus_tags.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-1.5">
                {myProfile.builder_focus_tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}

            <div className="mt-5 grid grid-cols-3 gap-1 border-t border-border/50 pt-4 text-center">
              <div>
                <span className="block text-sm font-semibold text-foreground">{myProfile.post_count ?? 0}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Posts</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-foreground">{myProfile.followers_count ?? 0}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</span>
              </div>
              <div>
                <span className="block text-sm font-semibold text-foreground">{myProfile.following_count ?? 0}</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Following</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
            <UserPlus className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-sm font-semibold">Join the Builder Network</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Share prompts, templates, launches, and agent logs with builders.</p>
          <Button asChild size="sm" className="mt-4 w-full rounded-xl">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-3 px-2 font-display text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Explore</h3>
        <nav className="space-y-1">
          {[
            { label: "Community Feed", to: "/community", Icon: MessageSquare },
            { label: "Open Commons", to: "/open-commons", Icon: UsersRound },
            { label: "AI Agent Market", to: "/agents", Icon: Sparkles },
            { label: "Learning Paths", to: "/paths", Icon: Compass },
            { label: "Knowledge Hub", to: "/knowledge", Icon: BookOpen },
            { label: "Weekly Challenge", to: "/challenges", Icon: Trophy },
          ].map(({ label, to, Icon }) => (
            <Link key={to} to={to} activeOptions={{ exact: true }} className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[status=active]:bg-primary/5 data-[status=active]:text-primary">
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function ProfileSidebarSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm" aria-busy="true" aria-label="Loading account">
      <div className="h-20 animate-pulse bg-muted" />
      <div className="px-4 pb-5 text-center">
        <div className="mx-auto -mt-8 h-16 w-16 rounded-full border-4 border-card bg-muted" />
        <div className="mx-auto mt-3 h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="mx-auto mt-3 h-3 w-36 animate-pulse rounded bg-muted" />
        <div className="mt-5 grid grid-cols-3 gap-1 border-t border-border/50 pt-4">
          {Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-7 animate-pulse rounded bg-muted" />)}
        </div>
      </div>
    </div>
  );
}
