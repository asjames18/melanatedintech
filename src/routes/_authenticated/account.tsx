import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getMyProfile, listMySavedAgents, listMySavedArticles } from "@/lib/account.functions";
import { listArticles, listAgents } from "@/lib/public.functions";
import { getMyFitFinderResult, listMyLearningProgress } from "@/lib/retention.functions";
import { ProfileEditor } from "@/components/profile-editor";
import { useAvatarUrl } from "@/hooks/use-avatar-url";
import { useInterests } from "@/hooks/use-interests";
import { TierBadge } from "@/components/cards";
import { useEntitlements } from "@/hooks/use-entitlement";
import {
  Bookmark,
  BookOpen,
  Clock,
  GraduationCap,
  LogOut,
  Menu,
  ShieldCheck,
  Server,
  Sparkles,
  Store,
  User,
  Search,
  CreditCard,
  Plus,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { checkAdminStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Account — Melanated In Tech" }] }),
  component: Account,
});

function Account() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getProfile = useServerFn(getMyProfile);
  const getSavedAgents = useServerFn(listMySavedAgents);
  const getSavedArticles = useServerFn(listMySavedArticles);
  const getProgress = useServerFn(listMyLearningProgress);
  const getFitFinder = useServerFn(getMyFitFinderResult);
  const checkAdmin = useServerFn(checkAdminStatus);

  const profile = useQuery({ queryKey: ["me"], queryFn: () => getProfile() });
  const savedAgents = useQuery({ queryKey: ["saved-agents"], queryFn: () => getSavedAgents() });
  const savedArticles = useQuery({
    queryKey: ["saved-articles"],
    queryFn: () => getSavedArticles(),
  });
  const pathProgress = useQuery({ queryKey: ["learning-progress"], queryFn: () => getProgress() });
  const fitFinder = useQuery({ queryKey: ["fit-finder-profile"], queryFn: () => getFitFinder() });
  const entitlements = useEntitlements();
  const avatarUrl = useAvatarUrl(profile.data?.avatar_url);
  const adminStatus = useQuery({ queryKey: ["admin-status"], queryFn: () => checkAdmin() });
  const isAdmin = adminStatus.data?.isAdmin ?? false;

  // Search & Filter state for Saved Agents
  const [agentSearch, setAgentSearch] = useState("");
  const [agentCategory, setAgentCategory] = useState("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & Filter state for Saved Articles
  const [articleSearch, setArticleSearch] = useState("");
  const [articleCategory, setArticleCategory] = useState("All");

  // Dynamically compute unique categories for Saved Agents
  const agentCategories = useMemo(() => {
    const categories = new Set<string>();
    (savedAgents.data ?? []).forEach((s) => {
      if (s.agents?.category) categories.add(s.agents.category);
    });
    return ["All", ...Array.from(categories)];
  }, [savedAgents.data]);

  // Dynamically compute unique categories for Saved Articles
  const articleCategories = useMemo(() => {
    const categories = new Set<string>();
    (savedArticles.data ?? []).forEach((s) => {
      if (s.articles?.category) categories.add(s.articles.category);
    });
    return ["All", ...Array.from(categories)];
  }, [savedArticles.data]);

  // Filtered Saved Agents
  const filteredAgents = useMemo(() => {
    return (savedAgents.data ?? []).filter((s) => {
      if (!s.agents) return false;
      const name = s.agents.name || "";
      const tagline = s.agents.tagline || "";
      const category = s.agents.category || "";
      const matchesSearch =
        name.toLowerCase().includes(agentSearch.toLowerCase()) ||
        tagline.toLowerCase().includes(agentSearch.toLowerCase());
      const matchesCategory = agentCategory === "All" || category === agentCategory;
      return matchesSearch && matchesCategory;
    });
  }, [savedAgents.data, agentSearch, agentCategory]);

  // Filtered Saved Articles
  const filteredArticles = useMemo(() => {
    return (savedArticles.data ?? []).filter((s) => {
      if (!s.articles) return false;
      const title = s.articles.title || "";
      const excerpt = s.articles.excerpt || "";
      const category = s.articles.category || "";
      const matchesSearch =
        title.toLowerCase().includes(articleSearch.toLowerCase()) ||
        excerpt.toLowerCase().includes(articleSearch.toLowerCase());
      const matchesCategory = articleCategory === "All" || category === articleCategory;
      return matchesSearch && matchesCategory;
    });
  }, [savedArticles.data, articleSearch, articleCategory]);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out.");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Account"
        title={profile.data?.display_name ? `Hey, ${profile.data.display_name}` : "Your account"}
        description="Saved agents and articles, reading history, profile, and access — all in one place."
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* MOBILE PROFILE SHEET TRIGGER (visible on mobile/tablet only) */}
          <div className="lg:hidden col-span-full">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full flex items-center justify-between rounded-2xl border-border h-12 px-4">
                  <div className="flex items-center gap-2">
                    <Menu className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{profile.data?.display_name ?? "My Account"}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">Profile & Tools →</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] overflow-y-auto p-0 bg-card border-r border-border">
                <SheetTitle className="sr-only">Account Sidebar</SheetTitle>
                <div className="p-6 space-y-6">
                  {/* Profile card inside sheet */}
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20 p-5">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-muted ring-2 ring-primary/20">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-9 w-9 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold">{profile.data?.display_name ?? "Unnamed Profile"}</h3>
                        {profile.data?.bio && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{profile.data.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Nav links */}
                  <nav className="space-y-1">
                    {[{to: "/seller", icon: Store, label: "Seller Center"}, {to: "/prompts", icon: BookOpen, label: "Prompt Library"}, {to: "/mcp", icon: Server, label: "MCP Registry"}, {to: "/submit-agent", icon: Plus, label: "Submit Agent"}, {to: "/submissions", icon: Clock, label: "My Submissions"}, {to: "/interests", icon: Sparkles, label: "Target Interests"}].map(({to, icon: Icon, label}) => (
                      <Button key={to} variant="ghost" className="w-full justify-start text-sm h-10 px-3 hover:bg-muted/70" asChild>
                        <Link to={to} onClick={() => setSidebarOpen(false)}>
                          <Icon className="h-4 w-4 mr-3 text-muted-foreground" />
                          <span className="flex-1 text-left font-medium">{label}</span>
                        </Link>
                      </Button>
                    ))}
                    {isAdmin && (
                      <Button variant="ghost" className="w-full justify-start text-sm h-10 px-3 hover:bg-primary/10 border border-primary/20 bg-primary/5" asChild>
                        <Link to="/admin" onClick={() => setSidebarOpen(false)}>
                          <ShieldCheck className="h-4 w-4 text-primary mr-3 animate-pulse" />
                          <span className="flex-1 text-left font-semibold text-primary">Admin Control Panel</span>
                        </Link>
                      </Button>
                    )}
                    <hr className="my-2 border-border" />
                    <Button variant="ghost" className="w-full justify-start text-sm h-10 px-3 hover:bg-destructive/10 text-muted-foreground hover:text-destructive" onClick={() => { setSidebarOpen(false); signOut(); }}>
                      <LogOut className="h-4 w-4 mr-3" />
                      <span className="flex-1 text-left font-medium">Sign Out</span>
                    </Button>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* LEFT SIDEBAR COLUMN: Profile + Billing + Quick Tools (Desktop only) */}
          <div className="hidden lg:block space-y-6 lg:col-span-1">
            {/* PROFILE OVERVIEW CARD */}
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full bg-muted ring-2 ring-primary/20 transition-all">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                </div>

                <h3 className="mt-4 font-display text-xl font-bold tracking-tight">
                  {profile.data?.display_name ?? "Unnamed Profile"}
                </h3>

                {profile.data?.bio ? (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                    {profile.data.bio}
                  </p>
                ) : (
                  <p className="mt-2 text-xs italic text-muted-foreground/70">
                    No bio description provided yet.
                  </p>
                )}

                {/* Profile Stats Quick-Bar */}
                <div className="mt-6 grid w-full grid-cols-3 gap-2 rounded-xl bg-muted/40 p-3 text-center border border-border/40">
                  <div>
                    <p className="text-xl font-bold font-display text-foreground">
                      {savedAgents.data?.length ?? 0}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Saved
                    </p>
                  </div>
                  <div className="border-x border-border/50">
                    <p className="text-xl font-bold font-display text-foreground">
                      {pathProgress.data?.length ?? 0}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Paths
                    </p>
                  </div>
                  <div>
                    <p className="text-xl font-bold font-display text-foreground">
                      {entitlements.data?.length ?? 0}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Owned
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* BILLING & MEMBERSHIP CARD */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" /> Billing & Membership
                </h3>
              </div>

              <div className="mt-4 space-y-4">
                <div className="rounded-xl bg-muted/35 border border-border/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Membership Tier
                    </p>
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                      {entitlements.data && entitlements.data.length > 0
                        ? "Premium Member"
                        : "Standard Account"}
                    </span>
                  </div>
                  <p className="mt-1 font-display text-base font-bold text-foreground">
                    {entitlements.data && entitlements.data.length > 0
                      ? "Melanated In Tech Pro"
                      : "Melanated In Tech Builder"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {entitlements.data && entitlements.data.length > 0
                      ? "Full access to premium developer tools, marketplace agents, and operations templates."
                      : "Access to free marketplace agents, prompt database, and developer pathways."}
                  </p>
                </div>

                {/* Purchases History */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                    Unlocked Assets
                  </h4>
                  {entitlements.isLoading ? (
                    <p className="text-xs text-muted-foreground">Loading assets...</p>
                  ) : !entitlements.data || entitlements.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-border/80 p-4 text-center">
                      <p className="text-xs text-muted-foreground">
                        No premium items unlocked yet.
                      </p>
                      <Button
                        asChild
                        size="sm"
                        variant="link"
                        className="mt-1 h-auto p-0 text-xs text-primary font-semibold"
                      >
                        <Link to="/agents">Browse Marketplace</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                      {entitlements.data.map((e) => {
                        const displayName = e.slug
                          .split("-")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ");
                        return (
                          <div
                            key={`${e.kind}-${e.slug}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 p-2 text-xs hover:bg-muted/40 transition-colors"
                          >
                            <div className="truncate">
                              <p className="font-semibold text-foreground truncate">
                                {displayName}
                              </p>
                              <p className="text-[10px] text-muted-foreground capitalize">
                                {e.kind}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">
                              {new Date(e.granted_at).toLocaleDateString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CREATOR & DEVELOPER PORTALS CARD */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h3 className="font-display font-semibold text-foreground mb-4">
                Studios & Dashboards
              </h3>

              <nav className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-10 px-3 hover:bg-muted/70 group"
                  asChild
                >
                  <Link to="/seller">
                    <Store className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mr-3" />
                    <span className="flex-1 text-left font-medium">Seller Center</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-10 px-3 hover:bg-muted/70 group"
                  asChild
                >
                  <Link to="/prompts">
                    <BookOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mr-3" />
                    <span className="flex-1 text-left font-medium">Prompt Library</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-10 px-3 hover:bg-muted/70 group"
                  asChild
                >
                  <Link to="/mcp">
                    <Server className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mr-3" />
                    <span className="flex-1 text-left font-medium">MCP Registry</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-10 px-3 hover:bg-muted/70 group"
                  asChild
                >
                  <Link to="/submit-agent">
                    <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mr-3" />
                    <span className="flex-1 text-left font-medium">Submit Agent</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-10 px-3 hover:bg-muted/70 group"
                  asChild
                >
                  <Link to="/submissions">
                    <Clock className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mr-3" />
                    <span className="flex-1 text-left font-medium">My Submissions</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-10 px-3 hover:bg-muted/70 group"
                  asChild
                >
                  <Link to="/interests">
                    <Sparkles className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mr-3" />
                    <span className="flex-1 text-left font-medium">Target Interests</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </Button>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-sm h-10 px-3 hover:bg-primary/10 border border-primary/20 bg-primary/5 group"
                    asChild
                  >
                    <Link to="/admin">
                      <ShieldCheck className="h-4 w-4 text-primary mr-3 animate-pulse" />
                      <span className="flex-1 text-left font-semibold text-primary">
                        Admin Control Panel
                      </span>
                      <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                )}

                <hr className="my-2 border-border" />

                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-10 px-3 hover:bg-destructive/10 text-muted-foreground hover:text-destructive group"
                  onClick={signOut}
                >
                  <LogOut className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors mr-3" />
                  <span className="flex-1 text-left font-medium">Sign Out</span>
                </Button>
              </nav>
            </div>
          </div>

          {/* RIGHT CONTENT COLUMN: Tabs & Displays */}
          <div className="lg:col-span-2 space-y-6">
            {/* QUICK TOOLS & ACTION LAUNCHER BAR */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Quick Action Launcher
                </p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 rounded-xl border-border bg-muted/20 hover:bg-muted/60" asChild>
                  <Link to="/fit-finder">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold">Fit Finder</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 rounded-xl border-border bg-muted/20 hover:bg-muted/60" asChild>
                  <Link to="/agents">
                    <Store className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-semibold">Marketplace</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 rounded-xl border-border bg-muted/20 hover:bg-muted/60" asChild>
                  <Link to="/tools">
                    <Server className="h-4 w-4 text-indigo-500" />
                    <span className="text-xs font-semibold">AI Tools</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-3 flex flex-col items-center gap-1.5 rounded-xl border-border bg-muted/20 hover:bg-muted/60" asChild>
                  <Link to="/prompts">
                    <BookOpen className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-semibold">Prompts</span>
                  </Link>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="agents" className="w-full">
              <TabsList className="flex flex-wrap w-full border-b border-border bg-transparent p-0 rounded-none h-auto gap-4 md:gap-6 justify-start mb-6">
                <TabsTrigger
                  value="agents"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                >
                  <Bookmark className="h-4 w-4 mr-2" /> Saved Agents
                  <Count n={savedAgents.data?.length ?? 0} />
                </TabsTrigger>
                <TabsTrigger
                  value="articles"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                >
                  <BookOpen className="h-4 w-4 mr-2" /> Saved Articles
                  <Count n={savedArticles.data?.length ?? 0} />
                </TabsTrigger>
                <TabsTrigger
                  value="learning"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                >
                  <GraduationCap className="h-4 w-4 mr-2" /> Learning Loop
                  <Count n={pathProgress.data?.length ?? 0} />
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                >
                  <Clock className="h-4 w-4 mr-2" /> History
                </TabsTrigger>
                <TabsTrigger
                  value="profile"
                  className="rounded-none border-b-2 border-transparent bg-transparent px-1 pb-3 text-sm font-semibold text-muted-foreground hover:text-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none"
                >
                  <User className="h-4 w-4 mr-2" /> Profile
                </TabsTrigger>
              </TabsList>

              <TabsContent value="agents" className="mt-4 outline-none">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search saved agents..."
                        value={agentSearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setAgentSearch(e.target.value)
                        }
                        className="pl-9 bg-card/50"
                      />
                    </div>

                    {agentCategories.length > 1 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {agentCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setAgentCategory(cat)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                              agentCategory === cat
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {savedAgents.isLoading ? (
                    <Loading />
                  ) : filteredAgents.length === 0 ? (
                    <Empty
                      title={
                        agentSearch || agentCategory !== "All"
                          ? "No matches found"
                          : "No saved agents yet"
                      }
                      body={
                        agentSearch || agentCategory !== "All"
                          ? "Try adjusting your search query or filters."
                          : "Browse the marketplace and save the agents you want to follow."
                      }
                      cta={
                        !(agentSearch || agentCategory !== "All") && (
                          <Button asChild className="mt-4">
                            <Link to="/agents">Browse the marketplace</Link>
                          </Button>
                        )
                      }
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredAgents.map(
                        (s) =>
                          s.agents && (
                            <Link
                              key={s.agent_id}
                              to="/agents/$slug"
                              params={{ slug: s.agents.slug }}
                              className="group relative flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    {s.agents.category}
                                  </p>
                                  <TierBadge tier={s.agents.tier} />
                                </div>
                                <p className="mt-2 font-display text-lg font-bold group-hover:text-primary transition-colors">
                                  {s.agents.name}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {s.agents.tagline}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-end text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                View Agent <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                              </div>
                            </Link>
                          ),
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="articles" className="mt-4 outline-none">
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search saved articles..."
                        value={articleSearch}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setArticleSearch(e.target.value)
                        }
                        className="pl-9 bg-card/50"
                      />
                    </div>

                    {articleCategories.length > 1 && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {articleCategories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setArticleCategory(cat)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold border transition-all ${
                              articleCategory === cat
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-muted/40 border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {savedArticles.isLoading ? (
                    <Loading />
                  ) : filteredArticles.length === 0 ? (
                    <Empty
                      title={
                        articleSearch || articleCategory !== "All"
                          ? "No matches found"
                          : "No saved articles yet"
                      }
                      body={
                        articleSearch || articleCategory !== "All"
                          ? "Try adjusting your search query or filters."
                          : "Use the Save button on any article to build your reading list."
                      }
                      cta={
                        !(articleSearch || articleCategory !== "All") && (
                          <Button asChild className="mt-4">
                            <Link to="/knowledge">Browse the knowledge hub</Link>
                          </Button>
                        )
                      }
                    />
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredArticles.map(
                        (s) =>
                          s.articles && (
                            <Link
                              key={s.article_id}
                              to="/knowledge/$slug"
                              params={{ slug: s.articles.slug }}
                              className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
                            >
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                  {s.articles.category}
                                </p>
                                <p className="mt-2 font-display text-lg font-bold group-hover:text-primary transition-colors">
                                  {s.articles.title}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                                  {s.articles.excerpt}
                                </p>
                              </div>
                              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
                                <span>{s.articles.read_minutes} min read</span>
                                <span className="font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                  Read Article <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                                </span>
                              </div>
                            </Link>
                          ),
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="learning" className="mt-4 outline-none">
                <LearningProgress rows={pathProgress.data ?? []} fitFinder={fitFinder.data} />
              </TabsContent>

              <TabsContent value="history" className="mt-4 outline-none">
                <ReadingHistory />
              </TabsContent>

              <TabsContent value="profile" className="mt-4 outline-none">
                {profile.isLoading || !profile.data ? (
                  <Loading />
                ) : (
                  <ProfileEditor profile={profile.data} />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Count({ n }: { n: number }) {
  return (
    <span className="ml-1.5 rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{n}</span>
  );
}

function Loading() {
  return <p className="text-sm text-muted-foreground">Loading…</p>;
}

function Empty({ title, body, cta }: { title: string; body: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      {cta}
    </div>
  );
}

function LearningProgress({
  rows,
  fitFinder,
}: {
  rows: Array<{
    id: string;
    completed_at: string | null;
    completed_item_ids: string[];
    learning_paths:
      | { slug: string; title: string; excerpt: string }
      | Array<{ slug: string; title: string; excerpt: string }>
      | null;
  }>;
  fitFinder: unknown;
}) {
  const progressRows = rows
    .map((row) => ({
      row,
      path: Array.isArray(row.learning_paths) ? row.learning_paths[0] : row.learning_paths,
    }))
    .filter((item) => item.path);

  if (progressRows.length === 0 && !fitFinder) {
    return (
      <Empty
        title="No learning progress yet"
        body="Start a learning path or run the fit finder to create your builder loop."
        cta={
          <div className="mt-4 flex justify-center gap-2">
            <Button asChild>
              <Link to="/paths">View paths</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/fit-finder">Open fit finder</Link>
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      {progressRows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {progressRows.map(({ row, path }) => {
            const count = row.completed_item_ids?.length ?? 0;
            const progressPercent = row.completed_at ? 100 : Math.min(90, count * 14);
            return (
              <Link
                key={row.id}
                to="/paths/$slug"
                params={{ slug: path!.slug }}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        row.completed_at
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {row.completed_at ? "Completed" : "In Progress"}
                    </span>
                  </div>
                  <p className="mt-3 font-display text-lg font-bold group-hover:text-primary transition-colors">
                    {path!.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{path!.excerpt}</p>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted/60 border border-border/10">
                    <div
                      className={`h-full transition-all duration-500 ${row.completed_at ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>
                      {count} step{count !== 1 ? "s" : ""} completed
                    </span>
                    <span className="font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all flex items-center">
                      {row.completed_at ? "Review Path" : "Continue Path"}{" "}
                      <ArrowUpRight className="ml-0.5 h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {fitFinder ? (
        <div className="rounded-2xl border border-border bg-card p-5 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-primary/5 blur-xl group-hover:bg-primary/10 transition-colors" />
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Saved Recommendations
          </p>
          <p className="mt-2 font-display text-lg font-bold text-foreground">
            Your latest recommendation set is active.
          </p>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Reopen the finder at any time to refresh your customized agent, article, and product
            recommendations.
          </p>
          <Button asChild className="mt-4" variant="outline" size="sm">
            <Link to="/fit-finder">Open fit finder</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
          <p className="font-display text-lg font-bold">No finder results saved yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Answer five questions to discover recommended agents and assets for your builder loop.
          </p>
          <Button asChild className="mt-4" variant="outline" size="sm">
            <Link to="/fit-finder">Open fit finder</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function ReadingHistory() {
  const { interests: articleInterests, clear: clearArticles } = useInterests("article");
  const { interests: agentInterests, clear: clearAgents } = useInterests("agent");
  const listArticlesFn = useServerFn(listArticles);
  const listAgentsFn = useServerFn(listAgents);
  const articles = useQuery({ queryKey: ["articles"], queryFn: () => listArticlesFn() });
  const agents = useQuery({ queryKey: ["agents"], queryFn: () => listAgentsFn() });
  const articleRows = articles.data;
  const agentRows = agents.data;
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const recentArticles = useMemo(() => {
    if (!articleRows) return [];
    const map = new Map(articleRows.map((a) => [a.slug, a]));
    return articleInterests.recent.map((s) => map.get(s)).filter(Boolean) as typeof articleRows;
  }, [articleRows, articleInterests.recent]);

  const recentAgents = useMemo(() => {
    if (!agentRows) return [];
    const map = new Map(agentRows.map((a) => [a.slug, a]));
    return agentInterests.recent.map((s) => map.get(s)).filter(Boolean) as typeof agentRows;
  }, [agentRows, agentInterests.recent]);

  if (!hydrated) return <Loading />;

  const empty = recentArticles.length === 0 && recentAgents.length === 0;
  if (empty) {
    return (
      <Empty
        title="No reading history yet"
        body="As you read articles and explore agents, your recent activity will show up here."
      />
    );
  }

  return (
    <div className="space-y-10">
      {recentArticles.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              Recently read
            </h3>
            <button
              onClick={clearArticles}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {recentArticles.slice(0, 10).map((a) => (
              <li key={a.id}>
                <Link
                  to="/knowledge/$slug"
                  params={{ slug: a.slug }}
                  className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {a.category}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{a.title}</p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {a.read_minutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentAgents.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              Recently viewed agents
            </h3>
            <button
              onClick={clearAgents}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card">
            {recentAgents.slice(0, 10).map((a) => (
              <li key={a.id}>
                <Link
                  to="/agents/$slug"
                  params={{ slug: a.slug }}
                  className="flex items-start justify-between gap-4 p-4 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">
                      {a.category}
                    </p>
                    <p className="mt-0.5 text-sm font-medium">{a.name}</p>
                  </div>
                  <TierBadge tier={a.tier} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
