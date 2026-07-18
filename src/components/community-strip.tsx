import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageSquare, Users } from "lucide-react";
import { listFeed } from "@/lib/community.functions";
import { timeAgo } from "@/lib/utils";

/**
 * Compact "live from the community" band for marketing pages. Loads client-side
 * (non-blocking) and renders nothing until real posts exist, so an empty feed
 * never makes the homepage look dead.
 */
export function CommunityStrip() {
  const { data } = useQuery({
    queryKey: ["home-community-strip"],
    queryFn: () => listFeed({ data: { limit: 3, tab: "latest" } }),
    staleTime: 60_000,
  });
  const posts = data?.posts ?? [];
  if (posts.length === 0) return null;

  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Community</p>
            <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">
              Live from the builder community.
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Real builders sharing prompts, launches, and lessons — jump into the conversation.
            </p>
          </div>
          <Link
            to="/community"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Join the conversation <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((post) => {
            const name = post.author?.display_name ?? "A builder";
            const totalReactions = Object.values(post.reaction_count).reduce((a, b) => a + b, 0);
            return (
              <Link
                key={post.id}
                to="/community/$id"
                params={{ id: post.id }}
                className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{name}</p>
                    <p suppressHydrationWarning className="text-xs text-muted-foreground">
                      {timeAgo(post.created_at)}
                    </p>
                  </div>
                </div>
                {post.title && (
                  <h3 className="mt-4 font-display text-base font-semibold leading-snug">
                    {post.title}
                  </h3>
                )}
                <p className="mt-2 line-clamp-3 break-words text-sm text-muted-foreground">
                  {post.body}
                </p>
                <div className="mt-auto flex items-center gap-4 pt-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" /> {totalReactions}{" "}
                    {totalReactions === 1 ? "reaction" : "reactions"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <MessageSquare className="h-3.5 w-3.5" /> {post.reply_count}{" "}
                    {post.reply_count === 1 ? "comment" : "comments"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
