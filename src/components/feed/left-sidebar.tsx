import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getPublicProfile } from "@/lib/community.functions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Compass, BookOpen, Trophy, Sparkles, MessageSquare } from "lucide-react";

export function LeftSidebar() {
  const [me, setMe] = useState<string | null>(null);
  const getProfileFn = useServerFn(getPublicProfile);

  const profileQ = useQuery({
    queryKey: ["my-profile", me],
    queryFn: () => getProfileFn({ data: { user_id: me! } }),
    enabled: !!me,
  });
  const myProfile = profileQ.data;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  return (
    <div className="hidden md:block space-y-4 sticky top-24 h-fit">
      {me && myProfile ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm transition-all duration-300 hover:border-foreground/10">
          {/* Banner Backdrop */}
          <div className="h-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent2/10" />

          {/* User info */}
          <div className="px-4 pb-5 pt-0 text-center relative">
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <Avatar className="h-16 w-16 border-2 border-background ring-1 ring-border/20 shadow-md">
                {myProfile.avatar_url ? <AvatarImage src={myProfile.avatar_url} /> : null}
                <AvatarFallback className="text-base font-semibold">
                  {(myProfile.display_name ?? "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="mt-10">
              <Link
                to="/u/$userId"
                params={{ userId: me }}
                className="font-display font-bold text-foreground hover:text-primary hover:underline transition-colors block text-base"
              >
                {myProfile.display_name ?? "Operator"}
              </Link>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 px-1">
                {myProfile.bio ?? "Building custom AI agents"}
              </p>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-3 gap-1 border-t border-border/50 pt-4 text-center">
              <div>
                <span className="block text-sm font-bold text-foreground">
                  {myProfile.post_count ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Posts
                </span>
              </div>
              <div>
                <span className="block text-sm font-bold text-foreground">
                  {myProfile.followers_count ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Followers
                </span>
              </div>
              <div>
                <span className="block text-sm font-bold text-foreground">
                  {myProfile.following_count ?? 0}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Following
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
          <h3 className="font-display font-semibold text-sm">Join the Community</h3>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Share prompts, templates, and agent logs with builders.
          </p>
          <Button asChild size="sm" className="mt-4 w-full rounded-xl">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      )}

      {/* Quick Explore Navigation */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="font-display text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 px-2">
          Explore
        </h3>
        <nav className="space-y-1">
          {[
            { label: "Community Feed", to: "/community", Icon: MessageSquare },
            { label: "AI Agent Market", to: "/agents", Icon: Sparkles },
            { label: "Learning Paths", to: "/paths", Icon: Compass },
            { label: "Knowledge Hub", to: "/knowledge", Icon: BookOpen },
            { label: "Weekly Challenge", to: "/challenges", Icon: Trophy },
          ].map(({ label, to, Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors data-[state=active]:bg-primary/5 data-[state=active]:text-primary"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
