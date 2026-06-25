import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Hash } from "lucide-react";
import { listTrending } from "@/lib/community.functions";

export function TrendingSidebar() {
  const list = useServerFn(listTrending);
  const q = useQuery({
    queryKey: ["trending-tags"],
    queryFn: () => list({ data: { limit: 8 } }),
    staleTime: 60_000,
  });

  const tags = q.data ?? [];

  return (
    <div className="sticky top-24 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Hash className="h-4 w-4 text-primary" />
        <h2 className="font-display text-sm font-semibold">Trending</h2>
      </div>

      <div className="mt-4 space-y-1">
        {q.isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse rounded-md bg-muted" />
          ))
        ) : tags.length > 0 ? (
          tags.map((tag) => (
            <Link
              key={tag.tag}
              to="/community"
              search={{ tag: tag.tag }}
              className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-muted"
            >
              <span className="font-medium">#{tag.tag}</span>
              <span className="text-xs text-muted-foreground">{tag.usage_count}</span>
            </Link>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No tags yet.</p>
        )}
      </div>
    </div>
  );
}
