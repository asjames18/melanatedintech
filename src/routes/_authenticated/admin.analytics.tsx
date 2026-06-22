import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { adminAnalyticsSummary } from "@/lib/analytics.functions";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Admin" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const summary = useServerFn(adminAnalyticsSummary);
  const q = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => summary({ data: { days } }),
    retry: false,
  });

  if (q.error) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-foreground text-background">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">{(q.error as Error).message}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/admin">Open admin</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const data = q.data;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="Recommendation analytics."
        description="Impressions, clicks, and CTR for personalized recommendation surfaces."
      />
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            {q.isLoading
              ? "Loading…"
              : `Last ${data?.days} days · ${data?.totals.events ?? 0} events`}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Window</span>
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last day</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Impressions" value={data?.totals.impressions ?? 0} />
          <Stat label="Clicks" value={data?.totals.clicks ?? 0} />
          <Stat label="CTR" value={pct(data?.totals.ctr ?? 0)} />
          <Stat label="Events" value={data?.totals.events ?? 0} />
        </div>

        <Panel title="By surface">
          <Table
            headers={["Surface", "Impressions", "Clicks", "CTR"]}
            rows={(data?.bySurface ?? []).map((r) => [
              r.surface,
              r.impressions,
              r.clicks,
              pct(r.ctr),
            ])}
          />
        </Panel>

        <Panel title="Top recommended items">
          <Table
            headers={["Type", "Slug", "Category", "Impressions", "Clicks", "CTR"]}
            rows={(data?.topItems ?? []).map((r) => [
              r.itemType,
              r.itemSlug,
              r.itemCategory,
              r.impressions,
              r.clicks,
              pct(r.ctr),
            ])}
          />
        </Panel>

        <Panel title="Top reasons">
          <Table
            headers={["Reason", "Impressions", "Clicks", "CTR"]}
            rows={(data?.topReasons ?? []).map((r) => [
              r.reason,
              r.impressions,
              r.clicks,
              pct(r.ctr),
            ])}
          />
        </Panel>
      </section>
    </SiteLayout>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="border-b border-border px-5 py-3 text-sm font-medium">{title}</div>
      <div className="overflow-x-auto p-2">{children}</div>
    </div>
  );
}

function Table({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number)[][];
}) {
  if (rows.length === 0) {
    return <div className="px-3 py-6 text-sm text-muted-foreground">No data yet.</div>;
  }
  return (
    <table className="w-full min-w-[480px] text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
          {headers.map((h) => (
            <th key={h} className="px-3 py-2 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border">
            {r.map((c, j) => (
              <td key={j} className="px-3 py-2">{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
