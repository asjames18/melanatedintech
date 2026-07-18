import { useMemo, useState } from "react";
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
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader, SiteLayout } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminGenerateContentReviewPacket,
  adminListContentReviewPackets,
  adminReviewContentPacket,
  contentPacketSchema,
  type ContentReviewRow,
} from "@/lib/content-agent.functions";

export const Route = createFileRoute("/_authenticated/admin/content-agent")({
  head: () => ({
    meta: [
      { title: "Daily content review agent — Admin" },
      {
        name: "robots",
        content: "noindex,nofollow,noarchive",
      },
    ],
  }),
  component: ContentAgentAdminPage,
});

function ContentAgentAdminPage() {
  const queryClient = useQueryClient();
  const listPackets = useServerFn(adminListContentReviewPackets);
  const generatePacket = useServerFn(adminGenerateContentReviewPacket);
  const reviewPacket = useServerFn(adminReviewContentPacket);
  const [topicHint, setTopicHint] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  const packets = useQuery({
    queryKey: ["admin-content-review-packets"],
    queryFn: () => listPackets(),
    retry: false,
  });

  const generate = useMutation({
    mutationFn: () => generatePacket({ data: { topic_hint: topicHint.trim() || undefined } }),
    onSuccess: () => {
      setTopicHint("");
      toast.success("Review packet generated. Nothing was published.");
      queryClient.invalidateQueries({ queryKey: ["admin-content-review-packets"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const review = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "review" | "approved" | "rejected" }) =>
      reviewPacket({ data: { id, status, notes: notes[id]?.trim() || undefined } }),
    onSuccess: (row) => {
      toast.success(
        row.status === "approved"
          ? "Brief approved for editorial work. It was not published."
          : row.status === "rejected"
            ? "Brief rejected."
            : "Brief returned to review.",
      );
      queryClient.invalidateQueries({ queryKey: ["admin-content-review-packets"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const rows = packets.data ?? [];
  const summary = useMemo(
    () => ({
      review: rows.filter((row) => row.status === "review").length,
      approved: rows.filter((row) => row.status === "approved").length,
      failed: rows.filter((row) => row.status === "failed").length,
    }),
    [rows],
  );

  if (packets.error) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">{(packets.error as Error).message}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/admin">Open admin</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin · Editorial operations"
        title="Daily content review agent"
        description="Create one evidence-backed SEO brief, inspect its claims and sources, then approve or reject it. Approval never publishes automatically."
      />
      <section className="mx-auto max-w-7xl space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to admin
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="outline">{summary.review} awaiting review</Badge>
            <Badge variant="outline">{summary.approved} approved</Badge>
            <Badge variant="outline">{summary.failed} failed</Badge>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="font-display font-semibold">Human approval boundary</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This agent can research and draft a review packet. It cannot create an article,
                change a ranking URL, schedule a post, send a newsletter, or publish to social
                media. “Approve” only marks the brief ready for editorial work.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold">Generate a review packet</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Leave the hint empty to let the agent choose the strongest refresh or content gap from
            the live inventory. Runs are capped at three per day by default.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              value={topicHint}
              onChange={(event) => setTopicHint(event.target.value)}
              maxLength={500}
              placeholder="Optional topic hint, e.g. AI agent prompt injection for small teams"
              disabled={generate.isPending}
            />
            <Button
              onClick={() => generate.mutate()}
              disabled={generate.isPending || topicHint.length > 500}
              className="shrink-0"
            >
              {generate.isPending ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {generate.isPending ? "Researching…" : "Generate packet"}
            </Button>
          </div>
        </div>

        <div className="space-y-5">
          {packets.isLoading && (
            <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
              Loading review queue…
            </div>
          )}
          {!packets.isLoading && rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-10 text-center">
              <p className="font-medium">No review packets yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Generate the first controlled pilot above.
              </p>
            </div>
          )}
          {rows.map((row) => (
            <PacketCard
              key={row.id}
              row={row}
              note={notes[row.id] ?? row.review_notes ?? ""}
              onNote={(value) => setNotes((current) => ({ ...current, [row.id]: value }))}
              onReview={(status) => review.mutate({ id: row.id, status })}
              reviewing={review.isPending}
            />
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function PacketCard({
  row,
  note,
  onNote,
  onReview,
  reviewing,
}: {
  row: ContentReviewRow;
  note: string;
  onNote: (value: string) => void;
  onReview: (status: "review" | "approved" | "rejected") => void;
  reviewing: boolean;
}) {
  const parsed = contentPacketSchema.safeParse(row.packet);
  const packet = parsed.success ? parsed.data : null;
  const isReviewable = ["review", "approved", "rejected"].includes(row.status);

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={row.status} />
            {row.cluster && <Badge variant="outline">{row.cluster}</Badge>}
            {row.decision && <Badge variant="outline">{row.decision}</Badge>}
          </div>
          <h2 className="mt-3 font-display text-xl font-semibold">
            {packet?.seo.title ?? row.topic_hint ?? row.primary_query ?? "Content-agent run"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {row.primary_query ?? "No query produced"} · {formatDate(row.created_at)}
          </p>
        </div>
        <div className="text-xs text-muted-foreground sm:text-right">
          <div>{row.model_used ?? row.model_requested ?? "Model pending"}</div>
          {row.duration_ms != null && <div>{(row.duration_ms / 1_000).toFixed(1)} seconds</div>}
          <div>Prompt {row.prompt_version}</div>
        </div>
      </div>

      {row.status === "failed" && (
        <div className="border-b border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-medium">{row.failure_code ?? "Generation failed"}</div>
              <p className="mt-1 break-words">{row.failure_message}</p>
            </div>
          </div>
        </div>
      )}

      {row.validation_errors.length > 0 && (
        <div className="border-b border-amber-500/25 bg-amber-500/5 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" /> Validation flags
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {row.validation_errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {packet && (
        <div className="space-y-6 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <InfoBlock title="Reader outcome" body={packet.reader_outcome} />
            <InfoBlock title="Direct answer" body={packet.direct_answer} />
            <InfoBlock title="Editorial decision" body={packet.decision_reason} />
            <InfoBlock
              title="SEO ownership"
              body={`${packet.seo.author_name} · review every ${packet.seo.review_interval_days} days · next review ${packet.seo.review_by}`}
            />
          </div>

          <InfoBlock
            title="Product or lead-magnet opportunity"
            body={`${packet.product_opportunity.action}: ${packet.product_opportunity.name || "No offer proposed"}. ${packet.product_opportunity.rationale}`}
          />

          <div>
            <h3 className="text-sm font-semibold">Primary sources</h3>
            <ul className="mt-2 grid gap-2 md:grid-cols-2">
              {packet.sources.map((source) => (
                <li key={source.url} className="rounded-xl border border-border p-3 text-sm">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {source.title} <ExternalLink className="inline h-3 w-3" />
                  </a>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {source.publisher} · checked {source.checked_at} ·{" "}
                    {source.primary ? "primary" : "secondary"}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <details className="rounded-xl border border-border p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Outline, claims, and distribution
            </summary>
            <div className="mt-4 space-y-5 text-sm">
              <div>
                <h4 className="font-medium">Outline</h4>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
                  {packet.outline.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ol>
              </div>
              <InfoBlock title="Worked example" body={packet.worked_example} />
              <div>
                <h4 className="font-medium">Internal links and CTA</h4>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {packet.internal_links.map((link) => (
                    <li key={link.url}>
                      {link.anchor} → {link.url}
                    </li>
                  ))}
                  <li>
                    CTA: {packet.cta.label} → {packet.cta.url}
                  </li>
                </ul>
              </div>
              {packet.safety_flags.length > 0 && (
                <div>
                  <h4 className="font-medium">Safety and human-review flags</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                    {packet.safety_flags.map((flag) => (
                      <li key={flag}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h4 className="font-medium">Claims audit</h4>
                <ul className="mt-2 space-y-2">
                  {packet.claims.map((claim, index) => (
                    <li key={`${claim.claim}-${index}`} className="rounded-lg bg-muted/40 p-3">
                      <p>{claim.claim}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {claim.kind} · {claim.confidence} confidence ·{" "}
                        {claim.human_review ? "human review" : "routine review"}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium">Distribution drafts</h4>
                <div className="mt-2 grid gap-3 md:grid-cols-2">
                  <InfoBlock title="Newsletter" body={packet.distribution.newsletter} />
                  <InfoBlock title="LinkedIn" body={packet.distribution.linkedin} />
                  <InfoBlock title="X" body={packet.distribution.x} />
                  <InfoBlock title="Facebook" body={packet.distribution.facebook} />
                </div>
              </div>
            </div>
          </details>
        </div>
      )}

      {isReviewable && (
        <div className="border-t border-border bg-muted/20 p-5">
          <label className="text-sm font-medium" htmlFor={`notes-${row.id}`}>
            Editorial review notes
          </label>
          <Textarea
            id={`notes-${row.id}`}
            value={note}
            onChange={(event) => onNote(event.target.value)}
            maxLength={4_000}
            placeholder="What should change before this becomes an article or refresh?"
            className="mt-2 min-h-24"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => onReview("approved")}
              disabled={reviewing || row.status === "approved" || row.validation_errors.length > 0}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" /> Approve brief
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReview("rejected")}
              disabled={reviewing || row.status === "rejected"}
            >
              <XCircle className="mr-1 h-4 w-4" /> Reject
            </Button>
            {row.status !== "review" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onReview("review")}
                disabled={reviewing}
              >
                <RefreshCw className="mr-1 h-4 w-4" /> Return to review
              </Button>
            )}
          </div>
          {row.validation_errors.length > 0 && (
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
              Resolve the validation flags before approval.
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{body}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ContentReviewRow["status"] }) {
  const config = {
    requested: { label: "Requested", icon: Clock3, tone: "bg-muted text-muted-foreground" },
    running: { label: "Running", icon: RefreshCw, tone: "bg-blue-500/10 text-blue-600" },
    review: {
      label: "Needs review",
      icon: Clock3,
      tone: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    approved: {
      label: "Brief approved",
      icon: CheckCircle2,
      tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    rejected: { label: "Rejected", icon: XCircle, tone: "bg-destructive/10 text-destructive" },
    failed: { label: "Failed", icon: AlertTriangle, tone: "bg-destructive/10 text-destructive" },
  }[status];
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.tone}`}
    >
      <Icon className={`h-3.5 w-3.5 ${status === "running" ? "animate-spin" : ""}`} />
      {config.label}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
