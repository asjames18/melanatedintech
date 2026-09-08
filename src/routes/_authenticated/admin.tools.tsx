import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Wrench,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  Briefcase,
  Star,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  Building,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AI_TOOLS, AI_CATEGORIES, type AiTool } from "@/lib/ai-tools-data";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/_authenticated/admin/tools")({
  head: () => ({
    ...buildSeoMeta({
      title: "Admin AI Tools & Lead Management | Melanated In Tech",
      description: "Manage AI tools directory, review stack recommendations, and qualify leads.",
      url: "/admin/tools",
    }),
  }),
  component: AdminToolsPage,
});

function AdminToolsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");

  const filteredTools = useMemo(() => {
    return AI_TOOLS.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.slug.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat =
        selectedCat === "All" ||
        t.primaryCategory.toLowerCase() === selectedCat.toLowerCase();
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCat]);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl py-10 px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/admin" className="hover:text-foreground">Admin</Link>
            <span>/</span>
            <span className="font-semibold text-foreground">AI Tools & Leads</span>
          </nav>

          <Link
            to="/admin"
            className="text-xs text-muted-foreground hover:text-foreground font-semibold"
          >
            ← Back to Admin Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Wrench className="h-4 w-4" />
            <span>Internal Directory Operations</span>
          </div>
          <h1 className="text-3xl font-black text-foreground mt-1">
            AI Tool Library & Stack Funnel Administration
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor tool records, verification statuses, and incoming AI architecture qualification leads.
          </p>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-1 shadow-2xs">
            <span className="text-muted-foreground text-[11px] font-semibold">Total Curated Tools</span>
            <p className="text-2xl font-black text-foreground">{AI_TOOLS.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">100% Verified</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-1 shadow-2xs">
            <span className="text-muted-foreground text-[11px] font-semibold">Open Source & Local</span>
            <p className="text-2xl font-black text-foreground">
              {AI_TOOLS.filter((t) => t.openSource || t.selfHosted).length}
            </p>
            <span className="text-[11px] text-blue-500 font-semibold">Self-Hostable</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-1 shadow-2xs">
            <span className="text-muted-foreground text-[11px] font-semibold">Higher Ed Specialized</span>
            <p className="text-2xl font-black text-foreground">
              {AI_TOOLS.filter((t) => t.industries.includes("Higher Education")).length}
            </p>
            <span className="text-[11px] text-purple-500 font-semibold">FERPA-aligned</span>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-1 shadow-2xs">
            <span className="text-muted-foreground text-[11px] font-semibold">Avg MIT Recommendation</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {Math.round(
                AI_TOOLS.reduce((acc, t) => acc + t.mitRecommendationScore, 0) / AI_TOOLS.length,
              )}
              %
            </p>
            <span className="text-[11px] text-muted-foreground">Production standard</span>
          </div>
        </div>

        {/* TABS: TOOLS DIRECTORY & LEADS PIPELINE */}
        <Tabs defaultValue="directory" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="directory" className="rounded-lg text-xs font-semibold">
              Curated Tools ({filteredTools.length})
            </TabsTrigger>
            <TabsTrigger value="leads" className="rounded-lg text-xs font-semibold">
              Lead Qualification Protocol
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: TOOLS DIRECTORY */}
          <TabsContent value="directory" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tool name or slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                {["All", "Automation", "AI Agents", "LLM & API Platforms", "Education & Higher Ed"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
                      selectedCat === cat
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 font-bold text-muted-foreground">
                      <th className="p-3.5">Tool Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">MIT Score</th>
                      <th className="p-3.5">Starting Price</th>
                      <th className="p-3.5">Hosting</th>
                      <th className="p-3.5">Verified Date</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredTools.map((tool) => (
                      <tr key={tool.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-bold text-foreground">
                          <Link
                            to="/ai-tools/$slug"
                            params={{ slug: tool.slug }}
                            className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                          >
                            <span>{tool.name}</span>
                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                          </Link>
                          <span className="block text-[10px] text-muted-foreground font-normal">
                            /{tool.slug}
                          </span>
                        </td>
                        <td className="p-3.5 text-muted-foreground">{tool.primaryCategory}</td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                            <Star className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                            {tool.mitRecommendationScore}%
                          </span>
                        </td>
                        <td className="p-3.5 font-medium text-foreground">{tool.startingPrice}</td>
                        <td className="p-3.5 text-muted-foreground">
                          {tool.selfHosted ? (
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                              Self-Hosted
                            </span>
                          ) : (
                            "Cloud SaaS"
                          )}
                        </td>
                        <td className="p-3.5 text-muted-foreground">{tool.lastVerified}</td>
                        <td className="p-3.5 text-right space-x-2">
                          <Link
                            to="/ai-tools/$slug"
                            params={{ slug: tool.slug }}
                            className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-muted"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: LEAD QUALIFICATION PROTOCOL */}
          <TabsContent value="leads" className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-4">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Automated Lead Qualification & Scoring Tiers
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                When visitors submit inquiries via the AI Stack Builder or &ldquo;Talk to MIT&rdquo; modals, our server function evaluates their technical complexity, timeline, organization type, and budget to assign an automated tier:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4 space-y-1">
                  <Badge className="bg-purple-600 text-white text-[10px]">Enterprise Opportunity</Badge>
                  <p className="font-bold text-foreground mt-1">Score: 90 - 100</p>
                  <p className="text-muted-foreground text-[11px]">
                    Higher education institutions, enterprises, or budgets &gt;$10,000. Flagged for immediate 24h technical partner review.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1">
                  <Badge className="bg-emerald-600 text-white text-[10px]">High Priority</Badge>
                  <p className="font-bold text-foreground mt-1">Score: 80 - 89</p>
                  <p className="text-muted-foreground text-[11px]">
                    Budgets $5,000 - $10,000 with urgent timeline (&lt; 30 days) and defined compliance requirements.
                  </p>
                </div>

                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-4 space-y-1">
                  <Badge className="bg-blue-600 text-white text-[10px]">Qualified</Badge>
                  <p className="font-bold text-foreground mt-1">Score: 50 - 79</p>
                  <p className="text-muted-foreground text-[11px]">
                    Standard business workflow and automation sprint projects ($1,500 - $5,000 budget range).
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-1">
                  <Badge variant="outline" className="text-[10px]">Low Priority / Nurture</Badge>
                  <p className="font-bold text-foreground mt-1">Score: &lt; 50</p>
                  <p className="text-muted-foreground text-[11px]">
                    Researching phase with zero current budget. Receives automated blueprint guides and learning path follow-ups.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SiteLayout>
  );
}
