import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useEffect } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { adminAnalyticsSummary } from "@/lib/analytics.functions";
import { trackEvent } from "@/lib/analytics";
import { toast } from "sonner";
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
  Building2,
  Mail,
  Activity,
  Layers,
  ArrowRight,
  Filter,
  Users,
  UserPlus,
  UserCheck,
  Globe,
  MessageSquare,
  FileText,
  ShoppingBag,
  Clock,
  ChevronRight,
  ExternalLink,
  Radio,
  Copy,
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings,
  LayoutDashboard,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Info,
  PlusCircle,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Executive Telemetry & Live GA4 Console — Admin" }] }),
  component: AdminAnalytics,
});

type AnalyticsTab = "overview" | "users" | "leads" | "ga4" | "tools";

const DEFAULT_CUSTOM_EMBED_KEY = "mit:ga4:custom_embed_url";

function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("overview");
  const [testingGa, setTestingGa] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [customEmbedUrl, setCustomEmbedUrl] = useState("");
  const [showEmbedSettings, setShowEmbedSettings] = useState(false);
  const [livePings, setLivePings] = useState<Array<{ name: string; time: string; props: string }>>([
    { name: "page_view", time: "Just now", props: "path: /admin/analytics" },
    { name: "ga4_stream_active", time: "1m ago", props: "property: G-5YKK7V75YL" },
  ]);

  const summary = useServerFn(adminAnalyticsSummary);
  const q = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => summary({ data: { days } }),
    retry: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEFAULT_CUSTOM_EMBED_KEY);
      if (saved) setCustomEmbedUrl(saved);
    } catch {
      /* ignore */
    }
  }, []);

function normalizeLookerEmbedUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  const trimmed = rawUrl.trim();
  const shortMatch = trimmed.match(/(?:datastudio|lookerstudio)\.google\.com\/s\/([a-zA-Z0-9_-]+)/i);
  if (shortMatch && shortMatch[1]) {
    return `https://lookerstudio.google.com/embed/reporting/${shortMatch[1]}`;
  }
  const reportMatch = trimmed.match(/(?:datastudio|lookerstudio)\.google\.com\/reporting\/([a-zA-Z0-9_-]+)/i);
  if (reportMatch && reportMatch[1] && !trimmed.includes("/embed/")) {
    return `https://lookerstudio.google.com/embed/reporting/${reportMatch[1]}`;
  }
  return trimmed;
}

  const handleSaveCustomEmbedUrl = (raw: string) => {
    const normalized = normalizeLookerEmbedUrl(raw);
    setCustomEmbedUrl(normalized);
    try {
      localStorage.setItem(DEFAULT_CUSTOM_EMBED_KEY, normalized);
      toast.success("Custom GA4 Report URL formatted & saved!");
    } catch {
      /* ignore */
    }
  };

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

  const handleTestGa4Stream = () => {
    setTestingGa(true);
    const nowStr = new Date().toLocaleTimeString();
    try {
      trackEvent("admin_analytics_ga4_test_ping", {
        timestamp: new Date().toISOString(),
        test_source: "admin_analytics_dashboard",
      });
      setLivePings((prev) => [
        { name: "admin_analytics_ga4_test_ping", time: nowStr, props: "gtag.js dispatched" },
        ...prev.slice(0, 7),
      ]);
      toast.success("Diagnostic event dispatched to GA4 stream & server buffer!", {
        description: "Event 'admin_analytics_ga4_test_ping' sent via gtag.js.",
      });
      setIframeKey((prev) => prev + 1);
    } catch {
      toast.error("Failed to dispatch GA4 event.");
    } finally {
      setTimeout(() => setTestingGa(false), 800);
    }
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Executive Telemetry & Platform Intelligence"
        title="Live Traffic, User Accounts & GA4 Analytics"
        description="Real-time conversion tracking across user registrations, recommendation surfaces, embedded Google Analytics 4 reports, and lead qualification funnels."
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
                Time Window:
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

        {/* Executive Stat Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <StatCard
            label="Total Telemetry"
            value={data?.totals.events ?? 0}
            subtext="Raw activity records"
            Icon={Zap}
            color="text-amber-400"
            borderColor="border-amber-500/30"
          />
          <StatCard
            label="User Accounts"
            value={data?.userData.totalUsers ?? 0}
            subtext={`+${data?.userData.newUsersPeriod ?? 0} in selected window`}
            Icon={Users}
            color="text-emerald-400"
            borderColor="border-emerald-500/30"
          />
          <StatCard
            label="Tool Executions"
            value={data?.totals.toolRuns ?? 0}
            subtext="Interactive studio tools"
            Icon={Wrench}
            color="text-violet-400"
            borderColor="border-violet-500/30"
          />
          <StatCard
            label="Lead Prechecks"
            value={data?.totals.leadChecks ?? 0}
            subtext="Validated lead submissions"
            Icon={ShieldCheck}
            color="text-sky-400"
            borderColor="border-sky-500/30"
          />
          <StatCard
            label="Impressions"
            value={data?.totals.impressions ?? 0}
            subtext="Recommendation views"
            Icon={Eye}
            color="text-indigo-400"
            borderColor="border-indigo-500/30"
          />
          <StatCard
            label="Overall CTR"
            value={pct(data?.totals.ctr ?? 0)}
            subtext="Engagement ratio"
            Icon={TrendingUp}
            color="text-pink-400"
            borderColor="border-pink-500/30"
          />
        </div>

        {/* Tab Segment Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <TabButton
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={Activity}
            label="Overview & Timeline"
          />
          <TabButton
            active={activeTab === "ga4"}
            onClick={() => setActiveTab("ga4")}
            icon={Radio}
            label="Google Analytics 4 (GA4)"
            badge="G-5YKK7V75YL"
          />
          <TabButton
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
            icon={Users}
            label="User Accounts & Community"
            badge={data?.userData.newUsersPeriod ? `+${data.userData.newUsersPeriod}` : undefined}
          />
          <TabButton
            active={activeTab === "leads"}
            onClick={() => setActiveTab("leads")}
            icon={ShieldCheck}
            label="Lead Quality & Geo Telemetry"
          />
          <TabButton
            active={activeTab === "tools"}
            onClick={() => setActiveTab("tools")}
            icon={Wrench}
            label="Tools & Recommendation CTR"
          />
        </div>

        {/* TAB 1: OVERVIEW & TIMELINE */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Daily Activity Timeline Graph */}
            {data?.dailyTrends && data.dailyTrends.length > 0 && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      <Activity className="h-5 w-5 text-violet-400" /> Daily Telemetry & Activity Timeline
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

                <div className="space-y-3">
                  <div className="grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-30 gap-1.5 items-end h-44 pt-4 pb-2 px-2 rounded-xl border border-slate-800/80 bg-slate-950/60">
                    {data.dailyTrends.map((d) => {
                      const barHeight = Math.min(100, Math.max(8, (d.totalEvents / maxDailyEvents) * 100));
                      return (
                        <div
                          key={d.date}
                          className="group relative flex flex-col items-center justify-end h-full w-full"
                        >
                          <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                            <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] text-white shadow-2xl space-y-0.5 whitespace-nowrap">
                              <div className="font-bold text-violet-300">{d.date}</div>
                              <div>Events: <span className="font-bold text-white">{d.totalEvents}</span></div>
                              <div>Tool Runs: <span className="font-bold text-emerald-400">{d.toolRuns}</span></div>
                              <div>Lead Checks: <span className="font-bold text-amber-400">{d.leadsChecked}</span></div>
                            </div>
                            <div className="w-2 h-2 -mt-1 rotate-45 bg-slate-900 border-r border-b border-slate-700" />
                          </div>

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

            {/* Platform Conversion Funnel */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
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

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FunnelStep
                  stepNumber={1}
                  title="Diagnostic Visitors"
                  subtext="Visited /diagnostic page"
                  count={data?.funnel.diagnosticViews ?? 0}
                  color="sky"
                />
                <FunnelStep
                  stepNumber={2}
                  title="Prechecked Leads"
                  subtext="Ran lead score & DNS check"
                  count={data?.funnel.leadsQualified ?? 0}
                  color="emerald"
                />
                <FunnelStep
                  stepNumber={3}
                  title="Sprint & Demos"
                  subtext="Submitted build request"
                  count={data?.funnel.demosRequested ?? 0}
                  color="violet"
                />
                <FunnelStep
                  stepNumber={4}
                  title="Paid Deployments"
                  subtext="Completed checkout"
                  count={data?.funnel.purchasesCompleted ?? 0}
                  color="emerald"
                  highlight
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE ANALYTICS 4 (GA4) INTEGRATION & ON-SITE TELEMETRY CONSOLE */}
        {activeTab === "ga4" && (
          <div className="space-y-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                    <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      <Radio className="h-5 w-5 text-emerald-400" /> Google Analytics 4 (GA4) Dual-Stream Console
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Live client-side events are automatically forwarded to Google Analytics 4 property <code className="font-mono text-violet-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">G-5YKK7V75YL</code>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleTestGa4Stream}
                    disabled={testingGa}
                    className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold gap-2 shadow-lg shadow-violet-600/30 text-xs"
                  >
                    <Zap className="h-4 w-4" />
                    {testingGa ? "Dispatching..." : "Send GA4 Test Ping"}
                  </Button>

                  <Button
                    onClick={() => setShowEmbedSettings(!showEmbedSettings)}
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 gap-1.5 text-xs"
                  >
                    <Settings className="h-3.5 w-3.5" /> Custom Looker Embed
                  </Button>
                </div>
              </div>

              {/* Custom Embed URL Settings Accordion */}
              {showEmbedSettings && (
                <div className="p-4 rounded-xl border border-violet-500/30 bg-slate-950/90 space-y-3 animate-in fade-in duration-200">
                  <div className="text-xs font-bold text-white flex items-center justify-between">
                    <span>Embed Your Custom Google Looker Studio Report URL</span>
                    <span className="text-[11px] text-slate-400 font-mono">Saved in Browser</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={customEmbedUrl}
                      onChange={(e) => setCustomEmbedUrl(e.target.value)}
                      placeholder="Paste your Looker embed URL: https://lookerstudio.google.com/embed/reporting/..."
                      className="rounded-xl border-slate-700 bg-slate-900 text-xs text-white"
                    />
                    <Button
                      onClick={() => handleSaveCustomEmbedUrl(customEmbedUrl)}
                      size="sm"
                      className="rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs"
                    >
                      Save URL
                    </Button>
                    {customEmbedUrl && (
                      <Button
                        onClick={() => handleSaveCustomEmbedUrl("")}
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs"
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    To embed your report: Open your report in Looker Studio ➔ Share ➔ Embed Report ➔ Enable Embed ➔ Set access to 'Anyone with link can view' ➔ Copy URL.
                  </p>
                </div>
              )}

              {/* GA4 Property Status Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">GA4 Measurement ID</div>
                  <div className="mt-1.5 text-base font-mono font-bold text-emerald-400 flex items-center gap-2">
                    G-5YKK7V75YL
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText("G-5YKK7V75YL");
                        toast.success("Measurement ID copied!");
                      }}
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Active & Synchronized
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Client Script Engine</div>
                  <div className="mt-1.5 text-base font-mono font-bold text-violet-300">
                    gtag.js (v4)
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">Loaded in root layout</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Dual Telemetry Stream</div>
                  <div className="mt-1.5 text-base font-mono font-bold text-sky-400">
                    Supabase DB + GA4
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">Real-time dual dispatch</div>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/80">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Direct GA Web Console</div>
                  <a
                    href="https://analytics.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 text-sm font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1.5"
                  >
                    analytics.google.com <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <div className="mt-1 text-[11px] text-slate-400">Account: asjames18@gmail.com</div>
                </div>
              </div>

              {/* Custom Embed iFrame OR Native Live Stream Console */}
              {customEmbedUrl ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl h-[650px]">
                  <iframe
                    key={iframeKey}
                    src={normalizeLookerEmbedUrl(customEmbedUrl)}
                    title="Custom Google Looker Studio GA4 Report"
                    className="w-full h-full border-0 bg-slate-950"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Live Stream Telemetry Table */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Activity className="h-4 w-4 text-emerald-400" /> Live GA4 Event Stream Console
                      </h4>
                      <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        {livePings.length} Events Dispatched
                      </span>
                    </div>

                    <div className="space-y-2">
                      {livePings.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 rounded-lg border border-slate-800/80 bg-slate-900/60 text-xs font-mono"
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            <span className="font-bold text-violet-300">{p.name}</span>
                            <span className="text-slate-500">|</span>
                            <span className="text-slate-400">{p.props}</span>
                          </div>
                          <span className="text-slate-500 text-[11px]">{p.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Direct Launch Buttons to GA4 Dashboard Sections */}
                  <div className="border-t border-slate-800 pt-6">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-violet-400" /> Direct GA4 Dashboard Launchers (asjames18@gmail.com)
                    </h4>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <a
                        href="https://analytics.google.com/analytics/web/#/p/realtime"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-slate-900 transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-emerald-400">
                          <span>Realtime Visitors</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">Live active visitors & current pages</div>
                      </a>

                      <a
                        href="https://analytics.google.com/analytics/web/#/reports/acquisition"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-sky-500/50 hover:bg-slate-900 transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-sky-400">
                          <span>Traffic Sources</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">Organic, referral, & direct channels</div>
                      </a>

                      <a
                        href="https://analytics.google.com/analytics/web/#/reports/events"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-violet-500/50 hover:bg-slate-900 transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-violet-400">
                          <span>Event Explorer</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">Tool runs, clicks & custom triggers</div>
                      </a>

                      <a
                        href="https://analytics.google.com/analytics/web/#/reports/tech"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl border border-slate-800 bg-slate-950 hover:border-indigo-500/50 hover:bg-slate-900 transition-all group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-indigo-400">
                          <span>Audience Devices</span>
                          <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">Browsers, devices, & resolutions</div>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: USER ACCOUNTS & COMMUNITY */}
        {activeTab === "users" && (
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <UserSummaryCard
                label="Registered Profiles"
                value={data?.userData.totalUsers ?? 0}
                subtext="Total platform accounts"
                Icon={Users}
                badge={`+${data?.userData.newUsersPeriod ?? 0} recent`}
              />
              <UserSummaryCard
                label="Waitlist Subscriptions"
                value={data?.userData.totalWaitlist ?? 0}
                subtext="Early product signups"
                Icon={UserPlus}
              />
              <UserSummaryCard
                label="Purchased Licenses"
                value={data?.userData.totalPurchases ?? 0}
                subtext="Active software entitlements"
                Icon={ShoppingBag}
              />
              <UserSummaryCard
                label="Community Discussions"
                value={(data?.userData.totalPosts ?? 0) + (data?.userData.totalComments ?? 0)}
                subtext={`${data?.userData.totalPosts ?? 0} posts · ${data?.userData.totalComments ?? 0} comments`}
                Icon={MessageSquare}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-emerald-400" /> Recent User Registrations
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {data?.userData.recentUsers.length ?? 0} Latest Members
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Latest members who created an account on the platform.
                </p>

                <div className="space-y-3">
                  {(data?.userData.recentUsers ?? []).length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">No recent user registrations recorded.</div>
                  ) : (
                    (data?.userData.recentUsers ?? []).map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover border border-slate-700" />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 grid place-items-center text-xs font-bold text-violet-300">
                              {user.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-bold text-white">{user.displayName}</div>
                            <div className="text-[11px] font-mono text-slate-500">{user.id.slice(0, 16)}...</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                          <Clock className="h-3.5 w-3.5 text-slate-500" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                      <Globe className="h-5 w-5 text-sky-400" /> Top Visitor Origins
                    </h3>
                    <span className="text-xs font-mono text-sky-400 font-bold">Geo Telemetry</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Geographic origin data captured from verified lead submissions.
                  </p>

                  <div className="space-y-3.5">
                    {(data?.userData.topCountries ?? []).length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-500">United States (Primary traffic)</div>
                    ) : (
                      (data?.userData.topCountries ?? []).map((c) => (
                        <div key={c.country} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-200">{c.country}</span>
                            <span className="font-mono text-emerald-400 font-bold">{c.count} leads</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                            <div
                              className="h-full rounded-full bg-sky-400"
                              style={{ width: `${Math.min(100, (c.count / (data?.userData.topCountries[0]?.count || 1)) * 100)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                  Real-time geo resolution powered by LeadFlow DNS
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LEAD QUALITY & GEO TELEMETRY */}
        {activeTab === "leads" && (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" /> Lead Quality & Domain Breakdown
                  </h3>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                    {data?.leadQuality.totalChecks ?? 0} Total Prechecks
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-6">
                  Validation breakdown across lead email domains submitted to LeadFlow & Diagnostic audits.
                </p>

                <div className="space-y-4">
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
                      <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.max(2, corporatePct)}%` }} />
                    </div>
                  </div>

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
                      <div className="h-full rounded-full bg-sky-500 transition-all duration-500" style={{ width: `${Math.max(2, personalPct)}%` }} />
                    </div>
                  </div>

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
                      <div className="h-full rounded-full bg-amber-500 transition-all duration-500" style={{ width: `${Math.max(2, inactivePct)}%` }} />
                    </div>
                  </div>

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
                      <div className="h-full rounded-full bg-rose-500 transition-all duration-500" style={{ width: `${Math.max(2, invalidPct)}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>MX Lookup & DNS verification active</span>
                <Button asChild variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 font-bold p-0 h-auto gap-1">
                  <Link to="/admin/leads">Manage Leads <ChevronRight className="h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <Zap className="h-5 w-5 text-amber-400" /> Revenue Recovery Quick Actions
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Administrative tools to manage customer leads, check invoices, and update catalog items.
                </p>

                <div className="space-y-3">
                  <Link to="/admin/leads" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-violet-500/40 transition-all">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5 text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Lead Management Console</div>
                        <div className="text-[11px] text-slate-400">Review qualified leads & email records</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </Link>

                  <Link to="/admin/invoices" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-violet-500/40 transition-all">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-violet-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Client Invoices & Billings</div>
                        <div className="text-[11px] text-slate-400">Generate Stripe invoices for custom builds</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </Link>

                  <Link to="/admin/catalog" className="flex items-center justify-between p-3.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-violet-500/40 transition-all">
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-sky-400" />
                      <div>
                        <div className="text-xs font-bold text-white">Catalog & Marketplace Admin</div>
                        <div className="text-[11px] text-slate-400">Manage products, pricing & agents</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </Link>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                Admin Role Verified · Melanated In Tech
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TOOLS & RECOMMENDATIONS */}
        {activeTab === "tools" && (
          <div className="space-y-8">
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
          </div>
        )}
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
  borderColor,
}: {
  label: string;
  value: number | string;
  subtext: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
}) {
  return (
    <div className={`rounded-2xl border ${borderColor} bg-slate-900/90 p-5 shadow-xl transition-all hover:border-slate-700`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-white">{value}</div>
      <p className="mt-1 text-[10px] text-slate-400">{subtext}</p>
    </div>
  );
}

function UserSummaryCard({
  label,
  value,
  subtext,
  Icon,
  badge,
}: {
  label: string;
  value: number | string;
  subtext: string;
  Icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Icon className="h-4 w-4 text-violet-400" />
          {label}
        </span>
        {badge && (
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400 font-mono">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-white">{value}</div>
      <p className="mt-1 text-[10px] text-slate-400">{subtext}</p>
    </div>
  );
}

function FunnelStep({
  stepNumber,
  title,
  subtext,
  count,
  color,
  highlight,
}: {
  stepNumber: number;
  title: string;
  subtext: string;
  count: number;
  color: "sky" | "emerald" | "violet";
  highlight?: boolean;
}) {
  const colorMap = {
    sky: "bg-sky-500/10 border-sky-500/30 text-sky-400",
    emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    violet: "bg-violet-500/10 border-violet-500/30 text-violet-400",
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        highlight
          ? "border-emerald-500/40 bg-emerald-500/5 shadow-lg shadow-emerald-500/5"
          : "border-slate-800 bg-slate-950/80"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`h-7 w-7 rounded-lg border grid place-items-center font-bold text-xs ${colorMap[color]}`}>
          {stepNumber}
        </div>
        <span className="font-mono text-lg font-bold text-white">{count}</span>
      </div>
      <div className="text-xs font-bold text-white">{title}</div>
      <div className="text-[11px] text-slate-400 mt-0.5">{subtext}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
        active
          ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
          : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
      }`}
    >
      <Icon className={`h-4 w-4 ${active ? "text-white" : "text-slate-400"}`} />
      {label}
      {badge && (
        <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${active ? "bg-white/20 text-white" : "bg-emerald-500/20 text-emerald-400"}`}>
          {badge}
        </span>
      )}
    </button>
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

  lines.push(`Melanated In Tech — Executive Analytics & User Intelligence Export (${days} Days)`);
  lines.push("");
  lines.push("Platform Totals");
  lines.push(row(["Telemetry Events", data.totals.events]));
  lines.push(row(["Total Registered Accounts", data.userData.totalUsers]));
  lines.push(row(["New Users in Period", data.userData.newUsersPeriod]));
  lines.push(row(["Waitlist Signups", data.userData.totalWaitlist]));
  lines.push(row(["Purchased Entitlements", data.userData.totalPurchases]));
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

  lines.push("Recent Member Registrations");
  lines.push(row(["User ID", "Display Name", "Registration Date"]));
  for (const user of data.userData.recentUsers) {
    lines.push(row([user.id, user.displayName, user.createdAt]));
  }
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
