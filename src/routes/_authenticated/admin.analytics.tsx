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
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Mail,
  HelpCircle,
  Activity,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Executive Telemetry & Analytics — Admin" }] }),
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
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin Access Required</h1>
          <p className="mt-2 text-sm text-muted-foreground">{(q.error as Error).message}</p>
          <Button asChild variant="outline" className="mt-6 rounded-xl">
            <Link to="/admin">Open Admin Console</Link>
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

  const maxDailyEvents = Math.max(
    1,
    ...(data?.dailyTrends ?? []).map((d) => d.totalEvents),
  );

  const leadTotals = data?.leadQuality.totalChecks || 1;
  const corporatePct = ((data?.leadQuality.corporate ?? 0) / leadTotals) * 100;
  const personalPct = ((data?.leadQuality.personal ?? 0) / leadTotals) * 100;
  const inactivePct = ((data?.leadQuality.inactive ?? 0) / leadTotals) * 100;
  const invalidPct = ((data?.leadQuality.invalid ?? 0) / leadTotals) * 100;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Executive Telemetry & Platform Insights"
        title="Live Traffic, Lead Quality & Tool Analytics"
        description="Monitor real-time telemetry events, interactive studio usage, lead qualification domain breakdown, and conversion funnels."
      />

      <section className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-medium text-slate-200">
              {q.isLoading
                ? "Streaming platform telemetry..."
                : `Last ${data?.days} Days · ${data?.totals.events ?? 0} Telemetry Events Logged`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Window:
              </span>
            </div>
            <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
              <SelectTrigger className="w-36 rounded-xl border-slate-700 bg-slate-950 text-slate-200 focus:ring-violet-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-slate-900 text-slate-200">
                <SelectItem value="1">Last 24 Hours</SelectItem>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white gap-1.5"
              disabled={!data}
              onClick={() => {
                if (!data) return;
                downloadAnalyticsCsv(data, days);
              }}
            >
              <Download className="h-3.5 w-3.5" /> Export Report (CSV)
            </Button>
          </div>
        </div>

        {/* 6 EXECUTIVE STAT GLOW CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            label="Total Telemetry"
            value={data?.totals.events ?? 0}
            subtext="Raw activity records"
            Icon={Zap}
            color="text-amber-400"
            bgColor="bg-amber-500/10 border-amber-500/30"
          />
          <StatCard
            label="Tool Executions"
            value={data?.totals.toolRuns ?? 0}
            subtext="Interactive studio tools"
            Icon={Wrench}
            color="text-violet-400"
            bgColor="bg-violet-500/10 border-violet-500/30"
          />
          <StatCard
            label="Lead Prechecks"
            value={data?.totals.leadChecks ?? 0}
            subtext="Validated lead submissions"
            Icon={ShieldCheck}
            color="text-emerald-400"
            bgColor="bg-emerald-500/10 border-emerald-500/30"
          />
          <StatCard
            label="Impressions"
            value={data?.totals.impressions ?? 0}
            subtext="Recommendation views"
            Icon={Eye}
            color="text-sky-400"
            bgColor="bg-sky-500/10 border-sky-500/30"
          />
          <StatCard
            label="Clicks"
            value={data?.totals.clicks ?? 0}
            subtext="Direct recommendation clicks"
            Icon={MousePointer}
            color="text-indigo-400"
            bgColor="bg-indigo-500/10 border-indigo-500/30"
          />
          <StatCard
            label="Overall CTR"
            value={pct(data?.totals.ctr ?? 0)}
            subtext="Engagement conversion"
            Icon={TrendingUp}
            color="text-pink-400"
            bgColor="bg-pink-500/10 border-pink-500/30"
          />
        </div>

        {/* DAILY TELEMETRY TREND TIMELINE CHART */}
        {data?.dailyTrends && data.dailyTrends.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-violet-400" /> Daily Telemetry & Tool Execution Timeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Daily event volume, interactive tool usage, and lead precheck activity over time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm bg-violet-500" /> Total Events
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400" /> Tool Runs
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Lead Checks
                </span>
              </div>
            </div>

            {/* Visual SVG Timeline Bar Chart */}
            <div className="space-y-3">
              <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-30 gap-1.5 items-end h-40 pt-4 pb-2 px-2 rounded-xl border border-slate-800/80 bg-slate-950/60">
                {data.dailyTrends.map((d) => {
                  const barHeight = Math.min(100, Math.max(8, (d.totalEvents / maxDailyEvents) * 100));
                  return (
                    <div
                      key={d.date}
                      className="group relative flex flex-col items-center justify-end h-full w-full"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                        <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] text-white shadow-2xl space-y-0.5 whitespace-nowrap">
                          <div className="font-bold text-violet-300">{d.date}</div>
                          <div>Events: <span className="font-bold text-white">{d.totalEvents}</span></div>
                          <div>Tool Runs: <span className="font-bold text-emerald-400">{d.toolRuns}</span></div>
                          <div>Lead Checks: <span className="font-bold text-amber-400">{d.leadsChecked}</span></div>
                        </div>
                        <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900 border-r border-b border-slate-700" />
                      </div>

                      {/* Bar segment */}
                      <div
                        className="w-full rounded-t-sm bg-gradient-to-t from-violet-600 via-violet-500 to-emerald-400 transition-all duration-300 hover:brightness-125"
                        style={{ height: `${barHeight}%` }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 font-mono">
                <span>{data.dailyTrends[0]?.date}</span>
                <span>{data.dailyTrends[Math.floor(data.dailyTrends.length / 2)]?.date}</span>
                <span>{data.dailyTrends[data.dailyTrends.length - 1]?.date}</span>
              </div>
            </div>
          </div>
        )}

        {/* LEAD QUALITY & REVENUE CONVERSION SECTION */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* LEAD QUALITY BREAKDOWN */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" /> Lead Quality & Domain Telemetry
                </h3>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  {data?.leadQuality.totalChecks ?? 0} Total Prechecks
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Real-time validation metrics from LeadFlow & Revenue Leak audit submissions.
              </p>

              <div className="space-y-4">
                {/* Corporate */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 flex items-center gap-2">
                      <Building2 className="h-4 w-4" /> Corporate / High-Growth Lead (@acme.com)
                    </span>
                    <span className="font-mono font-bold text-white">
                      {data?.leadQuality.corporate ?? 0} ({corporatePct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.max(2, corporatePct)}%` }}
                    />
                  </div>
                </div>

                {/* Personal */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-400 flex items-center gap-2">
                      <Mail className="h-4 w-4" /> Personal Account (@gmail.com / @yahoo.com)
                    </span>
                    <span className="font-mono font-bold text-white">
                      {data?.leadQuality.personal ?? 0} ({personalPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-sky-500 transition-all duration-500"
                      style={{ width: `${Math.max(2, personalPct)}%` }}
                    />
                  </div>
                </div>

                {/* Inactive */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> Inactive / Unregistered Domain (No MX Records)
                    </span>
                    <span className="font-mono font-bold text-white">
                      {data?.leadQuality.inactive ?? 0} ({inactivePct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-amber-500 transition-all duration-500"
                      style={{ width: `${Math.max(2, inactivePct)}%` }}
                    />
                  </div>
                </div>

                {/* Invalid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-400 flex items-center gap-2">
                      <XCircle className="h-4 w-4" /> Invalid Format / Malformed
                    </span>
                    <span className="font-mono font-bold text-white">
                      {data?.leadQuality.invalid ?? 0} ({invalidPct.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${Math.max(2, invalidPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Automatic DNS MX lookup & PII protection enabled</span>
              <Link to="/admin/leads" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                View Lead Records <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* REVENUE & CONVERSION FUNNEL */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-400" /> Platform Conversion Funnel
                </h3>
                <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-400">
                  Telemetry Funnel
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Step-by-step conversion progression from audit landing views to paid pilot conversions.
              </p>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-sky-500/10 border border-sky-500/30 grid place-items-center text-sky-400 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Diagnostic & Audit Visitors</div>
                      <div className="text-[11px] text-slate-400">Visited /diagnostic page</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-sky-300">
                    {data?.funnel.diagnosticViews ?? 0}
                  </span>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 grid place-items-center text-emerald-400 font-bold text-xs">
                      2
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Prechecked Qualified Leads</div>
                      <div className="text-[11px] text-slate-400">Ran email verification & score</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-300">
                    {data?.funnel.leadsQualified ?? 0}
                  </span>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 border border-violet-500/30 grid place-items-center text-violet-400 font-bold text-xs">
                      3
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Strategy Sprint & Demo Applications</div>
                      <div className="text-[11px] text-slate-400">Submitted custom build request</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-violet-300">
                    {data?.funnel.demosRequested ?? 0}
                  </span>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 grid place-items-center text-emerald-300 font-bold text-xs">
                      4
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Paid Deposits & Conversions</div>
                      <div className="text-[11px] text-emerald-300/80">Completed Stripe checkout</div>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-emerald-300">
                    {data?.funnel.purchasesCompleted ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Conversion tracking via privacy-first analytics.ts</span>
              <span className="text-violet-400 font-bold">100% Client Consent Compliant</span>
            </div>
          </div>
        </div>

        {/* INTERACTIVE TOOLS USAGE HEATMAP & BREAKDOWN */}
        {data?.topTools && data.topTools.length > 0 && (
          <Panel title="Interactive AI Tools Usage Breakdown">
            <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.topTools.map((t) => {
                const totalRuns = data.totals.toolRuns || 1;
                const toolPct = (t.count / totalRuns) * 100;
                return (
                  <div
                    key={t.tool}
                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 hover:border-violet-500/40 transition-all shadow-md"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="capitalize text-slate-200 font-bold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-violet-400" />
                        {t.tool}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                        {t.count} runs
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(8, toolPct))}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 font-bold w-12 text-right">
                        {toolPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        )}

        {/* VISUAL CHART: SURFACE DISTRIBUTION BARS */}
        {data?.bySurface && data.bySurface.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-400" /> Recommendation Surface CTR Distribution
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual impression volume and click-through rates across site surfaces.
                </p>
              </div>
              <span className="rounded-full bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-400">
                {data.bySurface.length} Active Surfaces
              </span>
            </div>

            <div className="space-y-4">
              {data.bySurface.map((s) => {
                const barWidth = Math.min(100, Math.max(8, (s.impressions / maxImpressions) * 100));
                return (
                  <div key={s.surface} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold capitalize text-slate-200 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-violet-400" />
                        {s.surface.replace(/_/g, " ")}
                      </span>
                      <div className="flex items-center gap-4 text-slate-400 font-mono">
                        <span>{s.impressions} Views</span>
                        <span>{s.clicks} Clicks</span>
                        <span className="font-bold text-emerald-400">{pct(s.ctr)} CTR</span>
                      </div>
                    </div>

                    <div className="relative h-3.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TOP RECOMMENDED ITEMS TABLE */}
        <Panel title="Top Content Items & Engagement Performance">
          <Table
            headers={["Type", "Item Slug", "Category", "Impressions", "Clicks", "CTR Performance"]}
            rows={(data?.topItems ?? []).map((r) => [
              <span key={r.itemType} className="rounded-full bg-violet-500/10 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase text-violet-300">
                {r.itemType}
              </span>,
              <span key={r.itemSlug} className="font-semibold text-slate-200">{r.itemSlug}</span>,
              <span key="cat" className="text-slate-400">{r.itemCategory}</span>,
              <span key="imp" className="font-mono text-slate-300">{r.impressions}</span>,
              <span key="clk" className="font-mono text-slate-300">{r.clicks}</span>,
              <div key={r.itemSlug} className="flex items-center gap-3">
                <span className="w-12 text-xs font-mono font-bold text-emerald-400">{pct(r.ctr)}</span>
                <div className="h-2 w-28 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400"
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
  bgColor,
}: {
  label: string;
  value: number | string;
  subtext: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl transition-all hover:border-slate-700 ${bgColor}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-white">{value}</div>
      <p className="mt-1 text-[10px] text-slate-400">{subtext}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl overflow-hidden">
      <div className="border-b border-slate-800 bg-slate-950/80 px-6 py-4 text-sm font-bold text-white flex items-center gap-2">
        <Layers className="h-4 w-4 text-violet-400" />
        {title}
      </div>
      <div className="overflow-x-auto p-2">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (React.ReactNode)[][] }) {
  if (rows.length === 0) {
    return <div className="px-6 py-10 text-center text-sm text-slate-400">No telemetry recorded for this time window.</div>;
  }
  return (
    <table className="w-full min-w-[600px] text-sm">
      <thead>
        <tr className="border-b border-slate-800 text-left text-[10px] uppercase tracking-wider text-slate-400">
          {headers.map((h) => (
            <th key={h} className="px-5 py-3 font-bold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
            {r.map((c, j) => (
              <td key={j} className="px-5 py-3.5 text-slate-300">
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
  const row = (cells: (string | number)[]) => cells.map(esc).join(",");

  lines.push(`Melanated In Tech — Executive Analytics & Telemetry Export (${days} Days)`);
  lines.push("");
  lines.push("Platform Totals");
  lines.push(row(["Telemetry Events", data.totals.events]));
  lines.push(row(["Interactive Tool Runs", data.totals.toolRuns ?? 0]));
  lines.push(row(["Lead Prechecks", data.totals.leadChecks ?? 0]));
  lines.push(row(["Impressions", data.totals.impressions]));
  lines.push(row(["Clicks", data.totals.clicks]));
  lines.push(row(["CTR", `${(data.totals.ctr * 100).toFixed(2)}%`]));
  lines.push("");

  lines.push("Lead Quality Breakdown");
  lines.push(row(["Tier", "Count"]));
  lines.push(row(["Corporate Domain (@acme.com)", data.leadQuality.corporate]));
  lines.push(row(["Personal Account (@gmail.com)", data.leadQuality.personal]));
  lines.push(row(["Inactive / Unregistered", data.leadQuality.inactive]));
  lines.push(row(["Invalid Syntax", data.leadQuality.invalid]));
  lines.push("");

  lines.push("Interactive Tools Usage");
  lines.push(row(["Tool Name", "Execution Count"]));
  for (const t of data.topTools) {
    lines.push(row([t.tool, t.count]));
  }
  lines.push("");

  lines.push("Recommendation Surfaces");
  lines.push(row(["Surface", "Impressions", "Clicks", "CTR"]));
  for (const s of data.bySurface) {
    lines.push(row([s.surface, s.impressions, s.clicks, `${(s.ctr * 100).toFixed(2)}%`]));
  }

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `melanatedintech-telemetry-${days}d.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
