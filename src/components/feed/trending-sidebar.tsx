import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Flame, Zap, Users, ArrowRight, Trophy } from "lucide-react";
import { listTrending, listSuggestedBuilders } from "@/lib/community.functions";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { listBuilderChallenges } from "@/lib/retention.functions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TrendingSidebar() {
  const listTags = useServerFn(listTrending);
  const listChallenges = useServerFn(listBuilderChallenges);
  const listBuilders = useServerFn(listSuggestedBuilders);

  const tagsQ = useQuery({
    queryKey: ["trending-tags"],
    queryFn: () => listTags({ data: { limit: 8 } }),
    staleTime: 60_000,
  });

  const challengesQ = useQuery({
    queryKey: ["builder-challenges"],
    queryFn: () => listChallenges(),
    staleTime: 60_000,
  });

  const buildersQ = useQuery({
    queryKey: ["suggested-builders"],
    queryFn: () => listBuilders({ data: { limit: 4 } }),
    staleTime: 60_000,
  });

  const tags = tagsQ.data ?? [];
  const currentChallenge = (challengesQ.data ?? []).find((c) => {
    const now = Date.now();
    return now >= new Date(c.starts_at).getTime() && now <= new Date(c.ends_at).getTime();
  }) ?? challengesQ.data?.[0];

  return (
    <div className="sticky top-24 space-y-4">
      {currentChallenge && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Weekly Challenge</span>
          </div>
          <h3 className="font-display text-sm font-semibold leading-snug text-foreground">{currentChallenge.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{currentChallenge.excerpt}</p>
          <Button asChild size="sm" className="mt-3 w-full rounded-xl" variant="outline">
            <Link to="/challenges/$slug" params={{ slug: currentChallenge.slug }}>
              <Zap className="mr-1.5 h-3.5 w-3.5" /> View Challenge
            </Link>
          </Button>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold">Builders to Follow</h2>
        </div>
        <div className="space-y-2">
          {(buildersQ.data ?? []).map((builder: NonNullable<typeof buildersQ.data>[number]) => (
            <BuilderSuggestionItem key={builder.id} builder={builder} />
          ))}
          {!buildersQ.isLoading && (buildersQ.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No builder suggestions yet.</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Flame className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-semibold">Trending Topics</h2>
        </div>

        <div className="space-y-0.5">
          {tagsQ.isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-9 animate-pulse rounded-xl bg-muted" />)
          ) : tags.length > 0 ? (
            tags.map((tag, i) => (
              <Link key={tag.tag} to="/community" search={{ tag: tag.tag }} className="group flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-muted">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground transition-colors group-hover:text-foreground">#{tag.tag}</p>
                  <p className="text-[10px] text-muted-foreground">{tag.usage_count} posts</p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors group-hover:bg-background">#{i + 1}</span>
              </Link>
            ))
          ) : (
            <p className="px-2 text-sm text-muted-foreground">No trending topics yet.</p>
          )}
        </div>

        {tags.length > 0 && (
          <Link to="/community" className="mt-2 flex items-center gap-1 px-2 text-xs font-medium text-primary hover:underline">
            Show more <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-sm font-semibold">Explore AI</h2>
        </div>
        <nav className="space-y-1">
          {[
            { label: "AI Agent Market", to: "/agents" },
            { label: "Builder Challenges", to: "/challenges" },
            { label: "Prompt Library", to: "/prompts" },
            { label: "Learning Paths", to: "/paths" },
            { label: "Knowledge Hub", to: "/knowledge" },
          ].map(({ label, to }) => (
            <Link key={to} to={to} className="group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              {label}
              <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          ))}
        </nav>
      </div>

      <p className="px-2 text-[10px] text-muted-foreground">
        (c) {new Date().getFullYear()} Melanated in Tech - <Link to="/privacy" className="hover:underline">Privacy</Link> - <Link to="/terms" className="hover:underline">Terms</Link>
      </p>
    </div>
  );
}
type SuggestedBuilder = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  post_count: number;
  followers_count: number;
};

function BuilderSuggestionItem({ builder }: { builder: SuggestedBuilder }) {
  const avatarUrl = useAvatarUrl(builder.avatar_url);

  return (
    <Link to="/u/$userId" params={{ userId: builder.id }} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted">
      <Avatar className="h-9 w-9">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback className="text-xs font-semibold">{(builder.display_name ?? "AI").slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-foreground">{builder.display_name ?? "AI Builder"}</p>
        <p className="truncate text-[10px] text-muted-foreground">{builder.post_count} posts - {builder.followers_count} followers</p>
      </div>
    </Link>
  );
}

