import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listMySubmissions } from "@/lib/submissions.functions";
import { CheckCircle2, Clock, XCircle, Plus, ExternalLink, FileText } from "lucide-react";

export const Route = createFileRoute("/_authenticated/submissions")({
  head: () => ({ meta: [{ title: "My submissions — Melanated In Tech" }] }),
  component: SubmissionsList,
});

function SubmissionsList() {
  const listMine = useServerFn(listMySubmissions);
  const mine = useQuery({ queryKey: ["my-submissions"], queryFn: () => listMine() });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Builders"
        title="My submissions"
        description="Track review status, edit pending or rejected submissions, and jump to anything that's been approved."
      />
      <section className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-end">
          <Button asChild>
            <Link to="/submit-agent"><Plus className="mr-1 h-4 w-4" /> Submit another agent</Link>
          </Button>
        </div>

        {mine.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {mine.data && mine.data.length === 0 && (
          <div className="rounded-2xl border border-dashed bg-card p-10 text-center">
            <FileText className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 font-display text-lg font-semibold">No submissions yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Share your first agent to get it reviewed.</p>
            <Button asChild className="mt-4">
              <Link to="/submit-agent">Submit an agent</Link>
            </Button>
          </div>
        )}

        <ul className="space-y-4">
          {mine.data?.map((s) => (
            <li key={s.id} className="rounded-2xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to="/submissions/$id" params={{ id: s.id }} className="font-display text-lg font-semibold hover:text-primary">
                    {s.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {s.category} · submitted {new Date(s.created_at).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={s.status} />
              </div>

              <Timeline
                status={s.status}
                createdAt={s.created_at}
                updatedAt={s.updated_at}
                reviewedAt={s.reviewed_at}
                note={s.review_notes}
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {s.status === "approved" && s.published_agent_id ? (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/submissions/$id" params={{ id: s.id }}>
                      <ExternalLink className="mr-1 h-3 w-3" /> View details
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <Link to="/submissions/$id" params={{ id: s.id }}>
                      {s.status === "rejected" ? "Edit & resubmit" : "Edit"}
                    </Link>
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </SiteLayout>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  if (status === "approved") return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
  if (status === "rejected") return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
  return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
}

function Timeline({
  status, createdAt, updatedAt, reviewedAt, note,
}: {
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  note: string | null;
}) {
  const reviewed = !!reviewedAt;
  const fmt = (s: string | null | undefined) => s ? new Date(s).toLocaleString() : "—";
  return (
    <ol className="mt-4 grid gap-3 sm:grid-cols-3">
      <Step
        active
        label="Submitted"
        time={fmt(createdAt)}
        tone="active"
      />
      <Step
        active={status !== "pending" || updatedAt !== createdAt}
        label={status === "pending" ? "Under review" : "Reviewed"}
        time={status === "pending" ? "Awaiting reviewer" : fmt(reviewedAt ?? updatedAt)}
        tone={status === "pending" ? "muted" : "active"}
      />
      <Step
        active={reviewed && status !== "pending"}
        label={status === "approved" ? "Approved & published" : status === "rejected" ? "Rejected" : "Decision"}
        time={reviewed ? fmt(reviewedAt) : "Pending"}
        tone={status === "approved" ? "good" : status === "rejected" ? "bad" : "muted"}
        note={note ?? undefined}
      />
    </ol>
  );
}

function Step({
  label, time, active, tone, note,
}: {
  label: string;
  time: string;
  active: boolean;
  tone: "active" | "muted" | "good" | "bad";
  note?: string;
}) {
  const dot =
    tone === "good" ? "bg-emerald-500" :
    tone === "bad" ? "bg-destructive" :
    active ? "bg-primary" : "bg-muted-foreground/30";
  return (
    <li className="relative rounded-xl border bg-background p-3">
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dot}`} aria-hidden />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-sm">{time}</p>
      {note && <p className="mt-1 text-xs text-muted-foreground">"{note}"</p>}
    </li>
  );
}
