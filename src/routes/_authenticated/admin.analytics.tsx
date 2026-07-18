import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminAnalyticsSummary } from "@/lib/analytics.functions";
import {
  BarChart3,
  Download,
  Eye,
  MousePointer,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from "lucide-react";

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

  const maxImpressions = Math.max(
    1,
    ...(data?.bySurface ?? []).map((s) => s.impressions),
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Executive Telemetry"
        title="Recommendation & Tool Analytics"
        description="Real-time conversion tracking across recommendation surfaces, interactive tools, and user interaction funnels."
      />

      <section className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            {q.isLoading
              ? "Gathering telemetry…"
              : `Last ${data?.days} days · ${data?.totals.events ?? 0} total telemetry events recorded`}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Time Window:
            </span>
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-36 rounded-xl bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 Hours</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-1.5"
              disabled={!data}
              onClick={() => {
                if (!data) return;
                downloadAnalyticsCsv(data, days);
              }}
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>
        </div>

        {/* 5 GLOW STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label="Impressions"
            value={data?.totals.impressions ?? 0}
            subtext="Surface recommendations"
            Icon={Eye}
            color="text-sky-500"
            glow="hover:border-sky-500/30"
          />
          <StatCard
            label="Clicks"
            value={data?.totals.clicks ?? 0}
            subtext="Item engagements"
            Icon={MousePointer}
            color="text-emerald-500"
            glow="hover:border-emerald-500/30"
          />
          <StatCard
            label="Overall CTR"
            value={pct(data?.totals.ctr ?? 0)}
            subtext="Click-through ratio"
            Icon={TrendingUp}
            color="text-indigo-500"
            glow="hover:border-indigo-500/30"
          />
          <StatCard
            label="Tool Runs"
            value={data?.totals.toolRuns ?? 0}
            subtext="Interactive studio tools"
            Icon={Wrench}
            color="text-purple-500"
            glow="hover:border-purple-500/30"
          />
          <StatCard
            label="Telemetry Events"
            value={data?.totals.events ?? 0}
            subtext="Raw interaction logs"
            Icon={Zap}
            color="text-amber-500"
            glow="hover:border-amber-500/30"
          />
        </div>

        {/* VISUAL CHART: SURFACE DISTRIBUTION SVG BARS */}
        {data?.bySurface && data.bySurface.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-lg font-bold flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" /> Surface Volume & CTR Distribution
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visual impression volume and engagement rate across recommendation locations.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {data.bySurface.length} Active Surfaces
              </span>
            </div>

            <div className="space-y-4">
              {data.bySurface.map((s) => {
                const barWidth = Math.min(100, Math.max(8, (s.impressions / maxImpressions) * 100));
                return (
                  <div key={s.surface} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold capitalize text-foreground flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        {s.surface.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span>{s.impressions} views</span>
                        <span>{s.clicks} clicks</span>
                        <span className="font-bold text-foreground">{pct(s.ctr)} CTR</span>
                      </div>
                    </div>

                    <div className="relative h-4 w-full rounded-full bg-muted/40 overflow-hidden border border-border/50">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* INTERACTIVE TOOLS USAGE PANEL */}
        {data?.topTools && data.topTools.length > 0 && (
          <Panel title="Interactive Tools Usage Breakdown">
            <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.topTools.map((t) => (
                <div key={t.tool} className="rounded-xl border border-border bg-muted/20 p-4 hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="capitalize text-foreground flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      {t.tool}
                    </span>
                    <span className="text-primary font-bold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      {t.count} runs
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(10, (t.count / (data.totals.toolRuns || 1)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}

        {/* TOP RECOMMENDED ITEMS TABLE */}
        <Panel title="Top Recommended Items & Conversions">
          <Table
            headers={["Type", "Item Slug", "Category", "Impressions", "Clicks", "CTR Performance"]}
            rows={(data?.topItems ?? []).map((r) => [
              <span key={r.itemType} className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                {r.itemType}
              </span>,
              <span key={r.itemSlug} className="font-semibold text-foreground">{r.itemSlug}</span>,
              r.itemCategory,
              r.impressions,
              r.clicks,
              <div key={r.itemSlug} className="flex items-center gap-2">
                <span className="w-12 text-xs font-bold text-foreground">{pct(r.ctr)}</span>
                <div className="h-2 w-28 rounded-full bg-muted overflow-hidden border border-border/50">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(100, r.ctr * 100 * 2)}%` }}
                  />
                </div>
              </div>,
            ])}
          />
        </Panel>

        {/* TOP REASONS TABLE */}
        <Panel title="Top Recommendation Value Chips">
          <Table
            headers={["Reason Chip", "Impressions", "Clicks", "CTR Performance"]}
            rows={(data?.topReasons ?? []).map((r) => [
              <span key={r.reason} className="font-medium text-foreground capitalize">
                {r.reason.replace(/_/g, " ")}
              </span>,
              r.impressions,
              r.clicks,
              <div key={r.reason} className="flex items-center gap-2">
                <span className="w-12 text-xs font-bold text-foreground">{pct(r.ctr)}</span>
                <div className="h-2 w-28 rounded-full bg-muted overflow-hidden border border-border/50">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${Math.min(100, r.ctr * 100 * 2)}%` }}
                  />
                </div>
              </div>,
            ])}
          />
        </Panel>
      </section>
    </SiteLayout>
  );
}

function StatCard({
  label,
  value,
  subtext,
  Icon,
  color,
  glow,
}: {
  label: string;
  value: number | string;
  subtext: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  glow: string;
}) {
  return (
    <div className={`rounded-2xl border border-border bg-card p-5 shadow-sm transition-all ${glow}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-foreground">{value}</div>
      <p className="mt-1 text-[10px] text-muted-foreground">{subtext}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/20 px-5 py-3.5 text-sm font-bold text-foreground">
        {title}
      </div>
      <div className="overflow-x-auto p-2">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (React.ReactNode)[][] }) {
  if (rows.length === 0) {
    return <div className="px-5 py-8 text-center text-sm text-muted-foreground">No telemetry recorded yet.</div>;
  }
  return (
    <table className="w-full min-w-[520px] text-sm">
      <thead>
        <tr className="border-b border-border/60 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
          {headers.map((h) => (
            <th key={h} className="px-4 py-2.5 font-bold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
            {r.map((c, j) => (
              <td key={j} className="px-4 py-3 text-muted-foreground">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type Summary = NonNullable<Awaited<ReturnType<typeof adminAnalyticsSummary>>>;

function downloadAnalyticsCsv(data: Summary, days: number) {
  const lines: string[] = [];
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const row = (cells: (string | number)[]) =>
    cells.map(esc).join(",");

  lines.push(`Melanated In Tech — Analytics Export (${days} Days)`);
  lines.push("");
  lines.push("Summary Totals");
  lines.push(row(["Impressions", data.totals.impressions]));
  lines.push(row(["Clicks", data.totals.clicks]));
  lines.push(row(["CTR", `${(data.totals.ctr * 100).toFixed(2)}%`]));
  lines.push(row(["Interactive Tool Runs", data.totals.toolRuns ?? 0]));
  lines.push(row(["Telemetry Events", data.totals.events]));
  lines.push("");

  lines.push("By Surface");
  lines.push(row(["Surface", "Impressions", "Clicks", "CTR"]));
  for (const s of data.bySurface) {
    lines.push(row([s.surface, s.impressions, s.clicks, `${(s.ctr * 100).toFixed(2)}%`]));
  }
  lines.push("");

  lines.push("Top Items");
  lines.push(row(["Type", "Slug", "Category", "Impressions", "Clicks", "CTR"]));
  for (const item of data.topItems) {
    lines.push(
      row([
        item.itemType,
        item.itemSlug,
        item.itemCategory,
        item.impressions,
        item.clicks,
        `${(item.ctr * 100).toFixed(2)}%`,
      ]),
    );
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `analytics-report-${days}d.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
