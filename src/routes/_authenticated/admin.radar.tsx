import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminListRadarQueue,
  adminReviewRadarItem,
  type RadarModerationRow,
} from "@/lib/radar-store.functions";
import { radarGroupLabel } from "@/lib/ai-radar.functions";

export const Route = createFileRoute("/_authenticated/admin/radar")({
  head: () => ({
    meta: [
      { title: "AI Radar review queue — Admin" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
    ],
  }),
  component: RadarAdminPage,
});

function RadarAdminPage() {
  const queryClient = useQueryClient();
  const listQueue = useServerFn(adminListRadarQueue);
  const reviewItem = useServerFn(adminReviewRadarItem);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const queueQuery = useQuery({
    queryKey: ["admin-radar-queue"],
    queryFn: () => listQueue(),
  });

  const review = useMutation({
    mutationFn: (input: { id: string; action: "approve" | "reject"; notes?: string }) =>
      reviewItem({ data: input }),
    onSuccess: (_row, input) => {
      toast.success(input.action === "approve" ? "Published to the Radar." : "Rejected.");
      setNotes((prev) => ({ ...prev, [input.id]: "" }));
      void queryClient.invalidateQueries({ queryKey: ["admin-radar-queue"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Review failed."),
  });

  const data = queueQuery.data;
  const lastRun = data?.lastRun ?? null;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="AI Radar review queue"
        description="Items the ingest held back because their text touches a subject our content policy sends to a human. Everything else publishes automatically."
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Admin
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link to="/radar">
                View the Radar <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void queueQuery.refetch()}
              disabled={queueQuery.isFetching}
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${queueQuery.isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        }
      />

      <section className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <h2 className="font-display text-sm font-semibold">Last ingest</h2>
          </div>
          {lastRun ? (
            <>
              <p className="mt-2 text-xs text-muted-foreground">
                Started {new Date(lastRun.started_at).toLocaleString()}
                {lastRun.duration_ms !== null && ` · ${(lastRun.duration_ms / 1000).toFixed(1)}s`} ·{" "}
                {lastRun.feeds_ok}/{lastRun.feeds_total} feeds · {lastRun.items_seen} seen ·{" "}
                {lastRun.items_new} new · {lastRun.items_held} held
              </p>
              {lastRun.failure_message && (
                <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                  {lastRun.failure_message}
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              No ingest has run yet. Until one does, /radar fetches its sources live on each cold
              request — correct, just slower and without an archive.
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <h2 className="font-display text-base font-semibold">
              Held for review {data ? `(${data.pending.length})` : ""}
            </h2>
          </div>

          {queueQuery.isPending ? (
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border bg-card" />
              ))}
            </div>
          ) : queueQuery.isError ? (
            <p className="mt-4 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
              {queueQuery.error instanceof Error ? queueQuery.error.message : "Could not load."}
            </p>
          ) : data && data.pending.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Nothing waiting. Held items appear here when an incoming headline touches legal,
              health, political, hiring, financial, or ministry subject matter.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {data?.pending.map((row) => (
                <ModerationCard
                  key={row.id}
                  row={row}
                  note={notes[row.id] ?? ""}
                  onNote={(value) => setNotes((prev) => ({ ...prev, [row.id]: value }))}
                  disabled={review.isPending}
                  onReview={(action) =>
                    review.mutate({ id: row.id, action, notes: notes[row.id]?.trim() || undefined })
                  }
                />
              ))}
            </div>
          )}
        </div>

        {data && data.recent.length > 0 && (
          <div>
            <h2 className="font-display text-base font-semibold">Recently reviewed</h2>
            <ul className="mt-4 space-y-2">
              {data.recent.map((row) => (
                <li
                  key={row.id}
                  className="flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs"
                >
                  {row.status === "published" ? (
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{row.title}</span>
                    <span className="text-muted-foreground">
                      {row.source} · {row.status}
                      {row.reviewed_at && ` · ${new Date(row.reviewed_at).toLocaleDateString()}`}
                      {row.review_notes && ` · ${row.review_notes}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function ModerationCard({
  row,
  note,
  onNote,
  onReview,
  disabled,
}: {
  row: RadarModerationRow;
  note: string;
  onNote: (value: string) => void;
  onReview: (action: "approve" | "reject") => void;
  disabled: boolean;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-700 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" />
          {row.hold_reason ?? "held"}
        </Badge>
        <span className="text-muted-foreground">{radarGroupLabel(row.source_group)}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{row.source}</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {new Date(row.published_at).toLocaleDateString()}
        </span>
      </div>

      <h3 className="mt-2 font-display text-base font-semibold leading-snug">
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-start gap-1.5 hover:text-primary"
        >
          {row.title}
          <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        </a>
      </h3>

      {row.summary && (
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {row.summary}
        </p>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={note}
          onChange={(e) => onNote(e.target.value)}
          placeholder="Optional note for the audit trail"
          className="h-9 text-xs"
        />
        <div className="flex shrink-0 gap-2">
          <Button size="sm" disabled={disabled} onClick={() => onReview("approve")}>
            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Publish
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onReview("reject")}
          >
            <XCircle className="mr-1.5 h-3.5 w-3.5" /> Reject
          </Button>
        </div>
      </div>
    </article>
  );
}
