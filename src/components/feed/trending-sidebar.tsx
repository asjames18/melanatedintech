import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Hash, Flame, Zap, Users, ArrowRight, Trophy } from "lucide-react";
import { listTrending } from "@/lib/community.functions";
import { listBuilderChallenges } from "@/lib/retention.functions";
import { Button } from "@/components/ui/button";

export function TrendingSidebar() {
  const listTags = useServerFn(listTrending);
  const listChallenges = useServerFn(listBuilderChallenges);

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

  const tags = tagsQ.data ?? [];
  const currentChallenge = (challengesQ.data ?? []).find((c) => {
    const now = Date.now();
    return now >= new Date(c.starts_at).getTime() && now <= new Date(c.ends_at).getTime();
  }) ?? challengesQ.data?.[0];

  return (
    <div className="sticky top-24 space-y-4">

      {/* Active Challenge Widget */}
      {currentChallenge && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 overflow-hidden relative">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Weekly Challenge
            </span>
          </div>
          <h3 className="font-display text-sm font-bold leading-snug text-foreground">
            {currentChallenge.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {currentChallenge.excerpt}
          </p>
          <Button asChild size="sm" className="mt-3 w-full rounded-xl" variant="outline">
            <Link to="/challenges/$slug" params={{ slug: currentChallenge.slug }}>
              <Zap className="mr-1.5 h-3.5 w-3.5" /> View Challenge
            </Link>
          </Button>
        </div>
      )}

      {/* Trending Topics */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Flame className="h-4 w-4 text-orange-500" />
          <h2 className="font-display text-sm font-bold">Trending Topics</h2>
        </div>

        <div className="space-y-0.5">
          {tagsQ.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-9 animate-pulse rounded-xl bg-muted" />
              ))
            : tags.length > 0
            ? tags.map((tag, i) => (
                <Link
                  key={tag.tag}
                  to="/community"
                  search={{ tag: tag.tag }}
                  className="flex items-center justify-between rounded-xl px-3 py-2 transition-colors hover:bg-muted group"
                >
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                      #{tag.tag}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{tag.usage_count} posts</p>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded-full px-2 py-0.5 group-hover:bg-background transition-colors">
                    #{i + 1}
                  </span>
                </Link>
              ))
            : (
              <p className="px-2 text-sm text-muted-foreground">No trending topics yet.</p>
            )}
        </div>

        {tags.length > 0 && (
          <Link
            to="/community"
            className="mt-2 flex items-center gap-1 px-2 text-xs font-medium text-primary hover:underline"
          >
            Show more <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {/* Community Quick Links */}
      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-display text-sm font-bold">Explore</h2>
        </div>
        <nav className="space-y-1">
          {[
            { label: "Learning Paths", to: "/paths" },
            { label: "AI Agents", to: "/agents" },
            { label: "Knowledge Hub", to: "/knowledge" },
            { label: "Builder Challenges", to: "/challenges" },
            { label: "Prompt Library", to: "/prompts" },
          ].map(({ label, to }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group"
            >
              {label}
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </nav>
      </div>

      <p className="px-2 text-[10px] text-muted-foreground">
        © {new Date().getFullYear()} Melanated in Tech ·{" "}
        <Link to="/privacy" className="hover:underline">Privacy</Link> ·{" "}
        <Link to="/terms" className="hover:underline">Terms</Link>
      </p>
    </div>
  );
}
