import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import React, { useState, useMemo, forwardRef } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Pencil,
  Plus,
  Trash2,
  ShieldCheck,
  Mail,
  Inbox,
  Lock,
  Unlock,
  Users,
  BookOpen,
  BarChart3,
  CreditCard,
  ChevronRight,
  MessageSquare,
  Sparkles,
  Server,
  Search,
  Download,
  Menu,
} from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/markdown";
import { adminAnalyticsSummary } from "@/lib/analytics.functions";
import {
  adminListAgents,
  adminListArticles,
  adminListServices,
  adminListWaitlist,
  adminListMessages,
  adminListPurchases,
  adminUpdateMessage,
  adminDeleteMessage,
  adminUpsertAgent,
  adminUpsertArticle,
  adminUpsertService,
  adminDelete,
  checkAdminStatus,
  claimFirstAdmin,
} from "@/lib/admin.functions";
import { adminListProducts, adminUpsertProduct, type ProductRow } from "@/lib/product.functions";
import {
  adminListPosts,
  adminListReplies,
  adminListHashtags,
  adminSuppressHashtag,
  adminDeleteItem,
  moderateThread,
  adminCommunityStats,
  type AdminPostRow,
  type AdminReplyRow,
  type AdminHashtagRow,
  type CommunityStats,
} from "@/lib/community.functions";
import { adminListSubmissions, adminReviewSubmission } from "@/lib/submissions.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Admin â€” Melanated In Tech" }] }),
  component: AdminPage,
});

function AdminPage() {
  const check = useServerFn(checkAdminStatus);
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => check() });

  const listAgentsFn = useServerFn(adminListAgents);
  const listProductsFn = useServerFn(adminListProducts);
  const listSubmissionsFn = useServerFn(adminListSubmissions);
  const listWaitlistFn = useServerFn(adminListWaitlist);
  const listMessagesFn = useServerFn(adminListMessages);
  const listPurchasesFn = useServerFn(adminListPurchases);
  const getAnalyticsFn = useServerFn(adminAnalyticsSummary);

  const isAdmin = status.data?.isAdmin ?? false;

  const agentsQuery = useQuery({
    queryKey: ["admin-agents"],
    queryFn: () => listAgentsFn(),
    enabled: isAdmin,
  });
  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listProductsFn(),
    enabled: isAdmin,
  });
  const submissionsQuery = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: () => listSubmissionsFn(),
    enabled: isAdmin,
  });
  const waitlistQuery = useQuery({
    queryKey: ["admin-waitlist"],
    queryFn: () => listWaitlistFn(),
    enabled: isAdmin,
  });
  const messagesQuery = useQuery({
    queryKey: ["admin-messages"],
    queryFn: () => listMessagesFn(),
    enabled: isAdmin,
  });
  const purchasesQuery = useQuery({
    queryKey: ["admin-purchases"],
    queryFn: () => listPurchasesFn(),
    enabled: isAdmin,
  });
  const analyticsQuery = useQuery({
    queryKey: ["admin-analytics", 30],
    queryFn: () => getAnalyticsFn({ data: { days: 30 } }),
    enabled: isAdmin,
  });

  if (status.isLoading) {
    return (
      <SiteLayout>
        <div className="p-12 text-sm text-muted-foreground">Loadingâ€¦</div>
      </SiteLayout>
    );
  }
  if (status.error) {
    return (
      <SiteLayout>
        <div className="p-12 text-sm text-destructive">{(status.error as Error).message}</div>
      </SiteLayout>
    );
  }
  if (!status.data?.isAdmin) {
    return (
      <NoAccess adminCount={status.data?.adminCount ?? 0} onClaimed={() => status.refetch()} />
    );
  }

  const [activeTab, setActiveTab] = useState("agents");
  const [sheetOpen, setSheetOpen] = useState(false);

  const TAB_NAMES: Record<string, string> = {
    agents: "Marketplace Agents",
    products: "Marketplace Products",
    articles: "Knowledge Hub",
    services: "Professional Services",
    submissions: "Submissions",
    waitlist: "Waitlist",
    messages: "Messages",
    purchases: "Purchases & Sales",
    community: "Community Moderation",
    analytics: "Recommendations",
  };
  const activeTabDisplayName = TAB_NAMES[activeTab] || activeTab;

  // Calculate Metrics
  const pendingSubmissions = (submissionsQuery.data ?? []).filter(
    (s) => s.status === "pending",
  ).length;
  const waitlistCount = waitlistQuery.data?.length ?? 0;
  const activeListings = (agentsQuery.data?.length ?? 0) + (productsQuery.data?.length ?? 0);
  const ctrPercent = analyticsQuery.data
    ? `${(analyticsQuery.data.totals.ctr * 100).toFixed(1)}%`
    : "0.0%";
  const totalImpressions = analyticsQuery.data?.totals.impressions ?? 0;
  const unreadMessages = (messagesQuery.data ?? []).length;
  const purchases = purchasesQuery.data ?? [];
  const grossSalesCents = purchases.reduce((sum, row) => sum + (row.amount_cents ?? 0), 0);
  const sellerSalesCount = purchases.filter((row) => row.seller_id).length;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="Manage the platform."
        description="Edit marketplace listings, knowledge content, services, and review inbound activity."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* SUMMARY METRICS CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Active Waitlist
              </span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-foreground">
              {waitlistQuery.isLoading ? "..." : waitlistCount}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Total waitlist signups</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Pending Submissions
              </span>
              <Inbox className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-foreground">
              {submissionsQuery.isLoading ? "..." : pendingSubmissions}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              Marketplace reviews outstanding
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Catalog Listings
              </span>
              <BookOpen className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-foreground">
              {agentsQuery.isLoading || productsQuery.isLoading ? "..." : activeListings}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Total agents & products</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-indigo-500/30 transition-all">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Recommendation CTR
              </span>
              <BarChart3 className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-foreground">
              {analyticsQuery.isLoading ? "..." : ctrPercent}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {totalImpressions} impressions (30d)
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:border-purple-500/30 transition-all">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[10px] font-bold uppercase tracking-wider">
                Gross Sales
              </span>
              <CreditCard className="h-4 w-4 text-purple-500" />
            </div>
            <div className="mt-2 font-display text-2xl font-bold text-foreground">
              {purchasesQuery.isLoading ? "..." : `$${(grossSalesCents / 100).toFixed(2)}`}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {purchases.length} total orders ({sellerSalesCount} seller sales)
            </p>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION GRID */}
        <Tabs value={activeTab} onValueChange={(val) => {
          setActiveTab(val);
          setSheetOpen(false);
        }} className="w-full">
          {/* MOBILE NAVIGATION BAR (Visible on mobile/tablet, hidden on desktop) */}
          <div className="flex items-center justify-between lg:hidden bg-card border border-border rounded-2xl p-3 mb-6 shadow-sm">
            <div className="flex items-center gap-2 px-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Section:
              </span>
              <span className="text-sm font-bold text-primary">
                {activeTabDisplayName}
              </span>
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1.5 rounded-xl cursor-pointer">
                  <Menu className="h-4 w-4" />
                  <span>Navigate</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] p-6 overflow-y-auto bg-card border-r border-border">
                <SheetTitle className="font-display text-base font-bold text-foreground mb-4">
                  Admin Navigation
                </SheetTitle>
                <div className="space-y-4">
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3">
                      Management
                    </p>
                    <TabsList className="flex flex-col w-full bg-transparent p-0 gap-1.5 h-auto border-none items-stretch">
                      <TabsTrigger
                        value="agents"
                        className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <Server className="h-4 w-4 mr-3" /> Marketplace Agents
                      </TabsTrigger>
                      <TabsTrigger
                        value="products"
                        className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <BookOpen className="h-4 w-4 mr-3" /> Marketplace Products
                      </TabsTrigger>
                      <TabsTrigger
                        value="articles"
                        className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <Sparkles className="h-4 w-4 mr-3" /> Knowledge Hub
                      </TabsTrigger>
                      <TabsTrigger
                        value="services"
                        className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <Server className="h-4 w-4 mr-3" /> Professional Services
                      </TabsTrigger>

                      <hr className="my-2 border-border" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                        Inbound Activity
                      </p>

                      <TabsTrigger
                        value="submissions"
                        className="flex justify-between items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <span className="flex items-center">
                          <Inbox className="h-4 w-4 mr-3" /> Submissions
                        </span>
                        {pendingSubmissions > 0 && (
                          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {pendingSubmissions}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="waitlist"
                        className="flex justify-between items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-3" /> Waitlist
                        </span>
                        {waitlistCount > 0 && (
                          <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {waitlistCount}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="messages"
                        className="flex justify-between items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <span className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-3" /> Messages
                        </span>
                        {unreadMessages > 0 && (
                          <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadMessages}
                          </span>
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="purchases"
                        className="flex justify-between items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <span className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-3" /> Purchases & Sales
                        </span>
                        {purchases.length > 0 && (
                          <span className="bg-sky-500/10 border border-sky-500/20 text-sky-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {purchases.length}
                          </span>
                        )}
                      </TabsTrigger>                      <TabsTrigger
                        value="community"
                        className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4 mr-3" /> Community Moderation
                      </TabsTrigger>

                      <hr className="my-2 border-border" />
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-1">
                        Performance
                      </p>

                      <TabsTrigger
                        value="analytics"
                        className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                      >
                        <BarChart3 className="h-4 w-4 mr-3" /> Recommendations
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="pt-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                      Links
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full justify-start rounded-xl animate-none"
                    >
                      <Link to="/admin/content-agent" onClick={() => setSheetOpen(false)}>
                        Content review queue
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full justify-start rounded-xl animate-none"
                    >
                      <Link to="/admin/catalog" onClick={() => setSheetOpen(false)}>Catalog verification â†’</Link>
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="w-full justify-start rounded-xl mt-1.5 animate-none"
                    >
                      <Link to="/admin/analytics" onClick={() => setSheetOpen(false)}>View full analytics â†’</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Sidebar Column (Desktop Only) */}
            <div className="hidden lg:block lg:col-span-1 space-y-4">
              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-3">
                  Management
                </p>
                <TabsList className="flex flex-col w-full bg-transparent p-0 gap-1.5 h-auto border-none items-stretch">
                  <TabsTrigger
                    value="agents"
                    className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <Server className="h-4 w-4 mr-3" /> Marketplace Agents
                  </TabsTrigger>
                  <TabsTrigger
                    value="products"
                    className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4 mr-3" /> Marketplace Products
                  </TabsTrigger>
                  <TabsTrigger
                    value="articles"
                    className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-3" /> Knowledge Hub
                  </TabsTrigger>
                  <TabsTrigger
                    value="services"
                    className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <Server className="h-4 w-4 mr-3" /> Professional Services
                  </TabsTrigger>

                  <hr className="my-2 border-border" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                    Inbound Activity
                  </p>

                  <TabsTrigger
                    value="submissions"
                    className="flex justify-between items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <span className="flex items-center">
                      <Inbox className="h-4 w-4 mr-3" /> Submissions
                    </span>
                    {pendingSubmissions > 0 && (
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {pendingSubmissions}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="waitlist"
                    className="flex justify-between items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-3" /> Waitlist
                    </span>
                    {waitlistCount > 0 && (
                      <span className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {waitlistCount}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    className="flex justify-between items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <span className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-3" /> Messages
                    </span>
                    {unreadMessages > 0 && (
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {unreadMessages}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger
                    value="purchases"
                    className="flex justify-between items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <span className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-3" /> Purchases & Sales
                    </span>
                    {purchases.length > 0 && (
                      <span className="bg-sky-500/10 border border-sky-500/20 text-sky-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {purchases.length}
                      </span>
                    )}
                  </TabsTrigger>                  <TabsTrigger
                    value="community"
                    className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-4 w-4 mr-3" /> Community Moderation
                  </TabsTrigger>

                  <hr className="my-2 border-border" />
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3 mb-2">
                    Performance
                  </p>

                  <TabsTrigger
                    value="analytics"
                    className="flex justify-start items-center text-sm font-medium px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground data-[state=active]:bg-muted data-[state=active]:text-primary border-none shadow-none text-left w-full transition-all cursor-pointer"
                  >
                    <BarChart3 className="h-4 w-4 mr-3" /> Recommendations
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-3">
                  Links
                </p>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-xl"
                >
                  <Link to="/admin/content-agent">Content review queue</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-xl"
                >
                  <Link to="/admin/catalog">Catalog verification â†’</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full justify-start rounded-xl"
                >
                  <Link to="/admin/analytics">View full analytics â†’</Link>
                </Button>
              </div>
            </div>

            {/* Content Column */}
            <div className="lg:col-span-3">
              <TabsContent value="agents" className="m-0 outline-none">
                <AgentsPanel />
              </TabsContent>
              <TabsContent value="products" className="m-0 outline-none">
                <ProductsPanel />
              </TabsContent>
              <TabsContent value="articles" className="m-0 outline-none">
                <ArticlesPanel />
              </TabsContent>
              <TabsContent value="services" className="m-0 outline-none">
                <ServicesPanel />
              </TabsContent>
              <TabsContent value="submissions" className="m-0 outline-none">
                <SubmissionsPanel />
              </TabsContent>
              <TabsContent value="waitlist" className="m-0 outline-none">
                <WaitlistPanel />
              </TabsContent>
              <TabsContent value="messages" className="m-0 outline-none">
                <MessagesPanel />
              </TabsContent>
              <TabsContent value="purchases" className="m-0 outline-none">
                <PurchasesPanel />
              </TabsContent>
              <TabsContent value="community" className="m-0 outline-none">
                <CommunityPanel />
              </TabsContent>
              <TabsContent value="analytics" className="m-0 outline-none">
                <AnalyticsPanel />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function NoAccess({ adminCount, onClaimed }: { adminCount: number; onClaimed: () => void }) {
  const claim = useServerFn(claimFirstAdmin);
  const mut = useMutation({
    mutationFn: () => claim(),
    onSuccess: () => {
      toast.success("You're now an admin.");
      onClaimed();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-foreground text-background">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1>
        {adminCount === 0 ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              No admins exist yet. Claim the first admin seat for this workspace.
            </p>
            <Button className="mt-6" onClick={() => mut.mutate()} disabled={mut.isPending}>
              {mut.isPending ? "Claimingâ€¦" : "Claim admin access"}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account doesn't have admin permissions. Ask an existing admin to grant access.
            </p>
            <Button asChild variant="outline" className="mt-6">
              <Link to="/account">Back to account</Link>
            </Button>
          </>
        )}
      </div>
    </SiteLayout>
  );
}

// ---------- Agents ----------

type AgentRow = Awaited<ReturnType<typeof adminListAgents>>[number];
type AgentConfigRow = AgentRow & {
  model?: string | null;
  system_prompt?: string | null;
  max_tokens?: number | null;
  temperature?: number | null;
  unlock_content?: string | null;
};

function AgentsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListAgents);
  const del = useServerFn(adminDelete);
  const q = useQuery({ queryKey: ["admin-agents"], queryFn: () => list() });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { table: "agents", id } }),
    onSuccess: () => {
      toast.success("Agent deleted.");
      qc.invalidateQueries({ queryKey: ["admin-agents"] });
      qc.invalidateQueries({ queryKey: ["agents"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Toolbar
        title="Marketplace agents"
        count={q.data?.length ?? 0}
        action={
          <AgentEditor
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" /> New agent
              </Button>
            }
          />
        }
      />
      <SearchableDataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        searchPlaceholder="Search agents by name, slug, category..."
        searchFields={["name", "slug", "category", "tagline"]}
        columns={[
          { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
          {
            header: "Category",
            cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
          },
          { header: "Tier", cell: (r) => <span className="capitalize">{r.tier}</span> },
          {
            header: "Status",
            cell: (r) => <PublishBadge status={r.status} scheduledAt={r.scheduled_at} />,
          },
        ]}
        actions={(r) => (
          <>
            <AgentEditor
              existing={r}
              trigger={
                <IconBtn label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </IconBtn>
              }
            />
            <DeleteBtn onConfirm={() => delMut.mutate(r.id)} name={r.name} />
          </>
        )}
      />
    </div>
  );
}

function AgentEditor({ existing, trigger }: { existing?: AgentRow; trigger: React.ReactNode }) {
  const qc = useQueryClient();
  const upsert = useServerFn(adminUpsertAgent);
  const [open, setOpen] = useState(false);
  const config = existing as AgentConfigRow | undefined;
  const [form, setForm] = useState(() => ({
    id: existing?.id,
    slug: existing?.slug ?? "",
    name: existing?.name ?? "",
    tagline: existing?.tagline ?? "",
    description: existing?.description ?? "",
    category: existing?.category ?? "",
    tier: (existing?.tier ?? "free") as "free" | "premium" | "custom",
    capabilities: (existing?.capabilities ?? []).join("\n"),
    featured: existing?.featured ?? false,
    model: config?.model ?? "gpt-4o-mini",
    system_prompt: config?.system_prompt ?? "",
    max_tokens: config?.max_tokens ?? 1000,
    temperature: config?.temperature ?? 0.7,
    unlock_content: config?.unlock_content ?? "",
    status: (existing?.status ?? "draft") as PublishStatus,
    scheduled_at: existing?.scheduled_at ?? null,
  }));

  const mut = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          ...form,
          capabilities: form.capabilities
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }),
    onSuccess: () => {
      toast.success(existing ? "Agent saved." : "Agent created.");
      qc.invalidateQueries({ queryKey: ["admin-agents"] });
      qc.invalidateQueries({ queryKey: ["agents"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit agent" : "New agent"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Slug">
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="kebab-case-url"
            />
          </Field>
          <Field label="Tagline">
            <Input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <Field label="Tier">
              <Select
                value={form.tier}
                onValueChange={(v) => setForm({ ...form, tier: v as typeof form.tier })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Capabilities (one per line)">
            <Textarea
              rows={4}
              value={form.capabilities}
              onChange={(e) => setForm({ ...form, capabilities: e.target.value })}
            />
          </Field>
          <ToggleField
            label="Featured"
            checked={form.featured}
            onChange={(v) => setForm({ ...form, featured: v })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="AI model">
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="gpt-4o-mini"
              />
            </Field>
            <Field label="Temperature">
              <Input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="System prompt (optional â€” used as the agent's instructions when buyers chat)">
            <Textarea
              rows={4}
              value={form.system_prompt}
              onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
              placeholder="Define the agent's personality, role, and instructions for buyers."
            />
          </Field>
          <FulfillmentField
            label="Unlock pack (markdown) â€” delivered to buyers only"
            value={form.unlock_content}
            onChange={(v) => setForm({ ...form, unlock_content: v })}
            hint="Premium agents need a pack here or they show â€œComing soonâ€ instead of a buy button."
          />
          <PublishControls
            status={form.status}
            scheduledAt={form.scheduled_at}
            onChange={(status, scheduled_at) => setForm({ ...form, status, scheduled_at })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Savingâ€¦" : saveLabel(form.status)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Articles ----------

type ArticleRow = Awaited<ReturnType<typeof adminListArticles>>[number];

function ArticlesPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListArticles);
  const del = useServerFn(adminDelete);
  const q = useQuery({ queryKey: ["admin-articles"], queryFn: () => list() });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { table: "articles", id } }),
    onSuccess: () => {
      toast.success("Article deleted.");
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      qc.invalidateQueries({ queryKey: ["articles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Toolbar
        title="Knowledge hub articles"
        count={q.data?.length ?? 0}
        action={
          <ArticleEditor
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" /> New article
              </Button>
            }
          />
        }
      />
      <SearchableDataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        searchPlaceholder="Search articles by title, slug, category..."
        searchFields={["title", "slug", "category", "excerpt"]}
        columns={[
          { header: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
          {
            header: "Category",
            cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
          },
          { header: "Read", cell: (r) => <span>{r.read_minutes} min</span> },
          {
            header: "Status",
            cell: (r) => <PublishBadge status={r.status} scheduledAt={r.scheduled_at} />,
          },
        ]}
        actions={(r) => (
          <>
            <ArticleEditor
              existing={r}
              trigger={
                <IconBtn label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </IconBtn>
              }
            />
            <DeleteBtn onConfirm={() => delMut.mutate(r.id)} name={r.title} />
          </>
        )}
      />
    </div>
  );
}

function ArticleEditor({ existing, trigger }: { existing?: ArticleRow; trigger: React.ReactNode }) {
  const qc = useQueryClient();
  const upsert = useServerFn(adminUpsertArticle);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    id: existing?.id,
    slug: existing?.slug ?? "",
    title: existing?.title ?? "",
    excerpt: existing?.excerpt ?? "",
    body: existing?.body ?? "",
    category: existing?.category ?? "",
    read_minutes: existing?.read_minutes ?? 5,
    status: (existing?.status ?? "draft") as PublishStatus,
    scheduled_at: existing?.scheduled_at ?? null,
  }));

  const mut = useMutation({
    mutationFn: () => upsert({ data: form }),
    onSuccess: () => {
      toast.success(existing ? "Article saved." : "Article created.");
      qc.invalidateQueries({ queryKey: ["admin-articles"] });
      qc.invalidateQueries({ queryKey: ["articles"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit article" : "New article"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Title">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="Excerpt">
            <Textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </Field>
          <Field label="Body (markdown)">
            <Textarea
              rows={10}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <Field label="Read minutes">
              <Input
                type="number"
                value={form.read_minutes}
                onChange={(e) => setForm({ ...form, read_minutes: Number(e.target.value) })}
              />
            </Field>
          </div>
          <PublishControls
            status={form.status}
            scheduledAt={form.scheduled_at}
            onChange={(status, scheduled_at) => setForm({ ...form, status, scheduled_at })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Savingâ€¦" : saveLabel(form.status)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Products ----------

function ProductsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListProducts);
  const del = useServerFn(adminDelete);
  const q = useQuery({ queryKey: ["admin-products"], queryFn: () => list() });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { table: "products", id } }),
    onSuccess: () => {
      toast.success("Product deleted.");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Toolbar
        title="Digital products"
        count={q.data?.length ?? 0}
        action={
          <ProductEditor
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" /> New product
              </Button>
            }
          />
        }
      />
      <SearchableDataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        searchPlaceholder="Search products by name, slug, category..."
        searchFields={["name", "slug", "category", "tagline"]}
        columns={[
          { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
          {
            header: "Category",
            cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
          },
          {
            header: "Price",
            cell: (r) => (r.price_cents ? `$${(r.price_cents / 100).toFixed(2)}` : "â€”"),
          },
          {
            header: "Tier",
            cell: (r) => <Badge variant="outline">{r.tier}</Badge>,
          },
          {
            header: "Status",
            cell: (r) => <PublishBadge status={r.status} scheduledAt={r.scheduled_at} />,
          },
        ]}
        actions={(r) => (
          <>
            <ProductEditor
              existing={r}
              trigger={
                <IconBtn label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </IconBtn>
              }
            />
            <DeleteBtn onConfirm={() => delMut.mutate(r.id)} name={r.name} />
          </>
        )}
      />
    </div>
  );
}

function ProductEditor({ existing, trigger }: { existing?: ProductRow; trigger: React.ReactNode }) {
  const qc = useQueryClient();
  const upsert = useServerFn(adminUpsertProduct);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    id: existing?.id,
    slug: existing?.slug ?? "",
    name: existing?.name ?? "",
    tagline: existing?.tagline ?? "",
    description: existing?.description ?? "",
    category: existing?.category ?? "",
    tier: (existing?.tier ?? "free") as "free" | "premium" | "custom",
    price_cents: existing?.price_cents ?? null,
    image_url: existing?.image_url ?? "",
    featured: existing?.featured ?? false,
    model: (existing?.model ?? "gpt-4o-mini") as string,
    system_prompt: (existing?.system_prompt ?? "") as string,
    max_tokens: existing?.max_tokens ?? 1000,
    temperature: existing?.temperature ?? 0.7,
    unlock_content: (existing?.unlock_content ?? "") as string,
    status: (existing?.status ?? "draft") as PublishStatus,
    scheduled_at: existing?.scheduled_at ?? null,
  }));

  const mut = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          ...form,
          price_cents: form.price_cents ?? null,
          image_url: form.image_url || null,
        },
      }),
    onSuccess: () => {
      toast.success(existing ? "Product saved." : "Product created.");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit product" : "New product"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <Input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
            <Field label="Tier">
              <Select
                value={form.tier}
                onValueChange={(v) => setForm({ ...form, tier: v as typeof form.tier })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price (cents)">
              <Input
                type="number"
                min={0}
                value={form.price_cents ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price_cents: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="0 for free"
              />
            </Field>
            <Field label="Image URL">
              <Input
                value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://â€¦"
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="AI model">
              <Input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </Field>
            <Field label="Temperature">
              <Input
                type="number"
                min={0}
                max={2}
                step={0.1}
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="System prompt (optional)">
            <Textarea
              rows={3}
              value={form.system_prompt}
              onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
            />
          </Field>
          <Field label="Unlock content (markdown, buyers only)">
            <Textarea
              rows={5}
              value={form.unlock_content}
              onChange={(e) => setForm({ ...form, unlock_content: e.target.value })}
            />
          </Field>
          <ToggleField
            label="Featured"
            checked={form.featured}
            onChange={(v) => setForm({ ...form, featured: v })}
          />
          <PublishControls
            status={form.status}
            scheduledAt={form.scheduled_at}
            onChange={(status, scheduled_at) => setForm({ ...form, status, scheduled_at })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Savingâ€¦" : saveLabel(form.status)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Services ----------

type ServiceRow = Awaited<ReturnType<typeof adminListServices>>[number];

function ServicesPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListServices);
  const del = useServerFn(adminDelete);
  const q = useQuery({ queryKey: ["admin-services"], queryFn: () => list() });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { table: "services", id } }),
    onSuccess: () => {
      toast.success("Service deleted.");
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Toolbar
        title="Professional services"
        count={q.data?.length ?? 0}
        action={
          <ServiceEditor
            trigger={
              <Button size="sm">
                <Plus className="h-4 w-4" /> New service
              </Button>
            }
          />
        }
      />
      <SearchableDataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        searchPlaceholder="Search services by name, slug, tagline..."
        searchFields={["name", "slug", "tagline"]}
        columns={[
          { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
          {
            header: "Outcomes",
            cell: (r) => <span className="text-muted-foreground">{r.outcomes.length}</span>,
          },
          {
            header: "Status",
            cell: (r) => <PublishBadge status={r.status} scheduledAt={r.scheduled_at} />,
          },
        ]}
        actions={(r) => (
          <>
            <ServiceEditor
              existing={r}
              trigger={
                <IconBtn label="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </IconBtn>
              }
            />
            <DeleteBtn onConfirm={() => delMut.mutate(r.id)} name={r.name} />
          </>
        )}
      />
    </div>
  );
}

function ServiceEditor({ existing, trigger }: { existing?: ServiceRow; trigger: React.ReactNode }) {
  const qc = useQueryClient();
  const upsert = useServerFn(adminUpsertService);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    id: existing?.id,
    slug: existing?.slug ?? "",
    name: existing?.name ?? "",
    tagline: existing?.tagline ?? "",
    description: existing?.description ?? "",
    outcomes: (existing?.outcomes ?? []).join("\n"),
    status: (existing?.status ?? "draft") as PublishStatus,
    scheduled_at: existing?.scheduled_at ?? null,
  }));

  const mut = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          ...form,
          outcomes: form.outcomes
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        },
      }),
    onSuccess: () => {
      toast.success(existing ? "Service saved." : "Service created.");
      qc.invalidateQueries({ queryKey: ["admin-services"] });
      qc.invalidateQueries({ queryKey: ["services"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] w-[calc(100vw-2rem)] sm:max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{existing ? "Edit service" : "New service"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Slug">
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <Input
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Outcomes (one per line)">
            <Textarea
              rows={4}
              value={form.outcomes}
              onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
            />
          </Field>
          <PublishControls
            status={form.status}
            scheduledAt={form.scheduled_at}
            onChange={(status, scheduled_at) => setForm({ ...form, status, scheduled_at })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Savingâ€¦" : saveLabel(form.status)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


type PurchaseRow = Awaited<ReturnType<typeof adminListPurchases>>[number];

function PurchasesPanel() {
  const list = useServerFn(adminListPurchases);
  const q = useQuery({ queryKey: ["admin-purchases"], queryFn: () => list() });
  const rows = q.data ?? [];
  const grossCents = rows.reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);
  const sellerGrossCents = rows
    .filter((r) => r.seller_id)
    .reduce((sum, r) => sum + (r.amount_cents ?? 0), 0);
  const sellerEarningsCents = rows.reduce((sum, r) => sum + (r.seller_earnings_cents ?? 0), 0);
  const unpaidSellerCents = rows
    .filter((r) => r.seller_id && !r.seller_paid)
    .reduce((sum, r) => sum + (r.seller_earnings_cents ?? 0), 0);

  return (
    <div className="space-y-5">
      <Toolbar
        title="Purchases & sales"
        count={rows.length}
        icon={<CreditCard className="h-4 w-4" />}
        action={
          <Button
            size="sm"
            variant="outline"
            disabled={rows.length === 0}
            onClick={() =>
              downloadCsv(
                "admin-purchases-sales",
                [
                  "Granted At",
                  "Environment",
                  "Kind",
                  "Slug",
                  "Item",
                  "Buyer",
                  "Gross",
                  "Seller",
                  "Seller Earnings",
                  "Platform Fee",
                  "Seller Paid",
                  "Stripe Session",
                ],
                rows.map((r) => [
                  new Date(r.granted_at).toISOString(),
                  r.environment,
                  r.kind,
                  r.slug,
                  r.item_name,
                  r.buyer_name ?? r.user_id,
                  formatCents(r.amount_cents),
                  r.seller_name ?? "",
                  formatCents(r.seller_earnings_cents),
                  formatCents(r.platform_fee_cents),
                  r.seller_paid ? "yes" : "no",
                  r.stripe_session_id ?? "",
                ]),
              )
            }
          >
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SalesStat label="Gross sales" value={formatCents(grossCents)} />
        <SalesStat label="Seller sales" value={formatCents(sellerGrossCents)} />
        <SalesStat label="Seller earnings" value={formatCents(sellerEarningsCents)} />
        <SalesStat label="Unpaid seller earnings" value={formatCents(unpaidSellerCents)} />
      </div>

      <SearchableDataTable
        loading={q.isLoading}
        rows={rows}
        searchPlaceholder="Search buyer, seller, item, slug, Stripe session..."
        searchFields={["buyer_name", "user_id", "seller_name", "item_name", "slug", "stripe_session_id", "environment"]}
        columns={[
          {
            header: "When",
            cell: (r) => (
              <span className="text-muted-foreground">
                {new Date(r.granted_at).toLocaleDateString()}
              </span>
            ),
          },
          {
            header: "Item",
            cell: (r) => (
              <div>
                <div className="font-medium">{r.item_name}</div>
                <div className="text-xs text-muted-foreground">
                  {r.kind} · {r.slug}
                </div>
              </div>
            ),
          },
          {
            header: "Buyer",
            cell: (r) => (
              <div>
                <div className="font-medium">{r.buyer_name ?? "Unknown buyer"}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{r.user_id.slice(0, 8)}…</div>
              </div>
            ),
          },
          {
            header: "Gross",
            cell: (r) => <span className="font-medium">{formatCents(r.amount_cents)}</span>,
          },
          {
            header: "Seller",
            cell: (r) =>
              r.seller_id ? (
                <div>
                  <div className="font-medium">{r.seller_name ?? "Unknown seller"}</div>
                  <div className="text-xs text-muted-foreground">
                    earns {formatCents(r.seller_earnings_cents)}
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">Platform</span>
              ),
          },
          {
            header: "Payout",
            cell: (r) =>
              r.seller_id ? (
                <Badge variant={r.seller_paid ? "secondary" : "outline"}>
                  {r.seller_paid ? "Paid" : "Unpaid"}
                </Badge>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            header: "Stripe",
            cell: (r) => (
              <div className="max-w-[180px] truncate font-mono text-[11px] text-muted-foreground">
                {r.stripe_session_id ?? r.price_id ?? "—"}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

function SalesStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}

// ---------- Waitlist & Messages (read-only) ----------

function WaitlistPanel() {
  const list = useServerFn(adminListWaitlist);
  const q = useQuery({ queryKey: ["admin-waitlist"], queryFn: () => list() });
  const rows = q.data ?? [];
  return (
    <div>
      <Toolbar
        title="Waitlist signups"
        count={rows.length}
        icon={<Inbox className="h-4 w-4" />}
        action={
          <Button
            size="sm"
            variant="outline"
            disabled={rows.length === 0}
            onClick={() =>
              downloadCsv(
                "waitlist-signups",
                ["Email", "Source", "Interest", "When"],
                rows.map((r) => [
                  r.email,
                  r.source ?? "",
                  r.interest ?? "",
                  new Date(r.created_at).toISOString(),
                ]),
              )
            }
          >
            Export CSV
          </Button>
        }
      />
      <SearchableDataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        searchPlaceholder="Search waitlist by email, source, interest..."
        searchFields={["email", "source", "interest"]}
        columns={[
          { header: "Email", cell: (r) => <span className="font-medium">{r.email}</span> },
          {
            header: "Source",
            cell: (r) => <span className="text-muted-foreground">{r.source ?? "â€”"}</span>,
          },
          {
            header: "Interest",
            cell: (r) => <span className="text-muted-foreground">{r.interest ?? "â€”"}</span>,
          },
          {
            header: "When",
            cell: (r) => (
              <span className="text-muted-foreground">
                {new Date(r.created_at).toLocaleDateString()}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}

function MessagesPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListMessages);
  const update = useServerFn(adminUpdateMessage);
  const del = useServerFn(adminDeleteMessage);
  const q = useQuery({ queryKey: ["admin-messages"], queryFn: () => list() });

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    if (!s) return q.data ?? [];
    return (q.data ?? []).filter(
      (row) =>
        row.name.toLowerCase().includes(s) ||
        row.email.toLowerCase().includes(s) ||
        (row.organization && row.organization.toLowerCase().includes(s)) ||
        (row.topic && row.topic.toLowerCase().includes(s)) ||
        row.message.toLowerCase().includes(s),
    );
  }, [q.data, search]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin-messages"] });
  const updateMut = useMutation({
    mutationFn: (args: { id: string; handled: boolean }) => update({ data: args }),
    onSuccess: (_r, args) => {
      toast.success(args.handled ? "Marked handled." : "Reopened.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Message deleted.");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Toolbar
          title="Contact messages"
          count={filtered.length}
          icon={<Mail className="h-4 w-4" />}
        />
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {filtered.map((m) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const handled = !!(m as any).handled;
          return (
            <div
              key={m.id}
              className={`rounded-xl border border-border bg-card p-4 ${handled ? "opacity-60" : ""}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {m.name} <span className="text-muted-foreground">Â· {m.email}</span>
                    {handled && (
                      <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 ring-1 ring-emerald-500/30">
                        Handled
                      </span>
                    )}
                  </p>
                  {m.organization && (
                    <p className="text-xs text-muted-foreground">
                      {m.organization}
                      {m.topic ? ` Â· ${m.topic}` : ""}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
              <div className="mt-3 flex flex-wrap justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={updateMut.isPending}
                  onClick={() => updateMut.mutate({ id: m.id, handled: !handled })}
                >
                  {handled ? "Reopen" : "Mark handled"}
                </Button>
                <DeleteBtn onConfirm={() => delMut.mutate(m.id)} name={`message from ${m.name}`} />
              </div>
            </div>
          );
        })}
        {!q.isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {search ? "No matching messages found." : "No messages yet."}
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListSubmissions);
  const review = useServerFn(adminReviewSubmission);
  const q = useQuery({ queryKey: ["admin-submissions"], queryFn: () => list() });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let items = q.data ?? [];
    if (statusFilter !== "all") {
      items = items.filter((s) => s.status === statusFilter);
    }
    const s = search.toLowerCase().trim();
    if (s) {
      items = items.filter(
        (row) =>
          row.name.toLowerCase().includes(s) ||
          (row.tagline && row.tagline.toLowerCase().includes(s)) ||
          row.category.toLowerCase().includes(s) ||
          row.contact_email.toLowerCase().includes(s),
      );
    }
    return items;
  }, [q.data, search, statusFilter]);

  const reviewMut = useMutation({
    mutationFn: (args: {
      id: string;
      status: "approved" | "rejected" | "pending";
      notes: string;
    }) => review({ data: { id: args.id, status: args.status, review_notes: args.notes || null } }),
    onSuccess: (res) => {
      if (res?.publishedSlug) {
        toast.success(`Approved â€” published as /agents/${res.publishedSlug}`);
      } else {
        toast.success("Submission updated.");
      }
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Toolbar
          title="Agent submissions"
          count={filtered.length}
          icon={<Inbox className="h-4 w-4" />}
        />
        <div className="flex flex-wrap items-center gap-2">
          {/* Status selectors */}
          <div className="flex items-center rounded-xl bg-muted/60 p-0.5 border border-border/40">
            {["all", "pending", "approved", "rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold capitalize transition-all cursor-pointer ${
                  statusFilter === status
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3">
        {filtered.map((s) => (
          <SubmissionCard
            key={s.id}
            submission={s}
            pending={reviewMut.isPending}
            onReview={(status, notes) => reviewMut.mutate({ id: s.id, status, notes })}
          />
        ))}
        {!q.isLoading && filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            {search || statusFilter !== "all"
              ? "No matching submissions found."
              : "No submissions yet."}
          </div>
        )}
      </div>
    </div>
  );
}

type SubmissionRow = Awaited<ReturnType<typeof adminListSubmissions>>[number];

function SubmissionCard({
  submission,
  onReview,
  pending,
}: {
  submission: SubmissionRow;
  onReview: (status: "approved" | "rejected" | "pending", notes: string) => void;
  pending: boolean;
}) {
  const [notes, setNotes] = useState(submission.review_notes ?? "");
  const statusTone =
    submission.status === "approved"
      ? "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20"
      : submission.status === "rejected"
        ? "bg-red-500/10 text-red-700 ring-red-500/20"
        : "bg-muted text-muted-foreground ring-border";

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold">{submission.name}</p>
          <p className="text-xs text-muted-foreground">
            {submission.category} Â· {submission.contact_email} Â·{" "}
            {new Date(submission.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ring-1 ${statusTone}`}>
          {submission.status}
        </span>
      </div>
      <p className="mt-3 text-sm">{submission.tagline}</p>
      {submission.image_url && (
        <img
          src={submission.image_url}
          alt=""
          className="mt-3 max-h-40 rounded-lg border border-border object-contain"
        />
      )}
      <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
        {submission.description}
      </p>
      {(submission.website_url ||
        submission.demo_url ||
        submission.repo_url ||
        submission.published_agent_id) && (
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {submission.website_url && (
            <a
              href={submission.website_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Website â†—
            </a>
          )}
          {submission.demo_url && (
            <a
              href={submission.demo_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Demo â†—
            </a>
          )}
          {submission.repo_url && (
            <a
              href={submission.repo_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Repo â†—
            </a>
          )}
          {submission.published_agent_id && (
            <Link to="/agents" className="text-emerald-700 hover:underline">
              Live agent â†—
            </Link>
          )}
        </div>
      )}
      <Textarea
        rows={2}
        className="mt-4"
        placeholder="Internal review notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onReview("pending", notes)}
        >
          Mark pending
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={pending}
          onClick={() => onReview("rejected", notes)}
        >
          Reject
        </Button>
        <Button size="sm" disabled={pending} onClick={() => onReview("approved", notes)}>
          Approve
        </Button>
      </div>
    </div>
  );
}

// ---------- Shared bits ----------

function formatCents(cents: number | null | undefined) {
  return cents == null ? "-" : `$${(cents / 100).toFixed(2)}`;
}
function downloadCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  // eslint-disable-next-line no-irregular-whitespace
  const blob = new Blob([`ï»¿${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Toolbar({
  title,
  count,
  action,
  icon,
}: {
  title: string;
  count: number;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {count}
        </span>
      </div>
      {action}
    </div>
  );
}

type Col<T> = { header: string; cell: (r: T) => React.ReactNode };
function DataTable<T extends { id: string }>({
  rows,
  columns,
  actions,
  loading,
}: {
  rows: T[];
  columns: Col<T>[];
  actions?: (r: T) => React.ReactNode;
  loading?: boolean;
}) {
  if (loading) return <p className="mt-6 text-sm text-muted-foreground">Loadingâ€¦</p>;
  if (rows.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Nothing here yet.
      </div>
    );
  }
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            {columns.map((c) => (
              <th key={c.header} className="px-4 py-2.5 text-left font-medium">
                {c.header}
              </th>
            ))}
            {actions && <th className="px-4 py-2.5 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              {columns.map((c, i) => (
                <td key={i} className="px-4 py-3">
                  {c.cell(r)}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">{actions(r)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SearchableDataTable<T extends { id: string }>({
  rows,
  columns,
  actions,
  loading,
  searchPlaceholder = "Search...",
  searchFields = [],
}: {
  rows: T[];
  columns: Col<T>[];
  actions?: (r: T) => React.ReactNode;
  loading?: boolean;
  searchPlaceholder?: string;
  searchFields?: string[];
}) {
  const [search, setSearch] = useState("");
  const filteredRows = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term || searchFields.length === 0) return rows;
    return rows.filter((row) =>
      searchFields.some((field) => {
        const val = (row as Record<string, unknown>)[field];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      }),
    );
  }, [rows, search, searchFields]);

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="pl-9 h-9"
        />
      </div>
      <DataTable rows={filteredRows} columns={columns} actions={actions} loading={loading} />
    </div>
  );
}

function AnalyticsStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
    </div>
  );
}

function AnalyticsPanelWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="border-b border-border bg-muted/20 px-5 py-3 text-sm font-semibold">
        {title}
      </div>
      <div className="overflow-x-auto p-2">{children}</div>
    </div>
  );
}

function AnalyticsTable({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  if (rows.length === 0) {
    return <div className="px-5 py-8 text-sm text-muted-foreground text-center">No data yet.</div>;
  }
  return (
    <table className="w-full min-w-[480px] text-sm">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
          {headers.map((h) => (
            <th key={h} className="px-4 py-2.5 font-semibold">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
            {r.map((c, j) => (
              <td key={j} className="px-4 py-2.5">
                {c}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

type SummaryData = NonNullable<Awaited<ReturnType<typeof adminAnalyticsSummary>>>;

function downloadAnalyticsCsv(data: SummaryData, days: number) {
  const lines: string[] = [];
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const row = (cells: (string | number)[]) =>
    esc(cells[0]) +
    cells
      .slice(1)
      .map((c) => "," + esc(c))
      .join("");

  lines.push(`# Recommendation analytics â€” last ${days} days`);
  lines.push("");
  lines.push("Metric,Value");
  lines.push(row(["Impressions", data.totals.impressions]));
  lines.push(row(["Clicks", data.totals.clicks]));
  lines.push(row(["CTR", (data.totals.ctr * 100).toFixed(2) + "%"]));
  lines.push(row(["Events", data.totals.events]));
  lines.push("");

  lines.push("By surface");
  lines.push(row(["Surface", "Impressions", "Clicks", "CTR"]));
  for (const r of data.bySurface)
    lines.push(row([r.surface, r.impressions, r.clicks, (r.ctr * 100).toFixed(2) + "%"]));
  lines.push("");

  lines.push("Top items");
  lines.push(row(["Type", "Slug", "Category", "Impressions", "Clicks", "CTR"]));
  for (const r of data.topItems)
    lines.push(
      row([
        r.itemType,
        r.itemSlug,
        r.itemCategory,
        r.impressions,
        r.clicks,
        (r.ctr * 100).toFixed(2) + "%",
      ]),
    );
  lines.push("");

  lines.push("Top reasons");
  lines.push(row(["Reason", "Impressions", "Clicks", "CTR"]));
  for (const r of data.topReasons)
    lines.push(row([r.reason, r.impressions, r.clicks, (r.ctr * 100).toFixed(2) + "%"]));

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recommendations-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function FulfillmentField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [preview, setPreview] = useState(false);
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs"
          onClick={() => setPreview((p) => !p)}
          disabled={!value.trim()}
        >
          {preview ? "Edit" : "Preview"}
        </Button>
      </div>
      {preview ? (
        <div className="max-h-72 overflow-y-auto rounded-md border border-border bg-muted/30 p-4">
          <Markdown md={value} />
        </div>
      ) : (
        <Textarea
          rows={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Pack title&#10;&#10;Markdown the buyer sees after purchaseâ€¦"
          className="font-mono text-xs"
        />
      )}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <Switch checked={checked} onCheckedChange={onChange} />
      {label}
    </label>
  );
}

function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-accent2" : "bg-muted-foreground/40"}`}
      />
      {label}
    </span>
  );
}

const IconBtn = forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button> & { label: string }
>(({ children, label, ...props }, ref) => {
  return (
    <Button ref={ref} variant="ghost" size="icon" className="h-8 w-8" aria-label={label} {...props}>
      {children}
    </Button>
  );
});
IconBtn.displayName = "IconBtn";

function DeleteBtn({ onConfirm, name }: { onConfirm: () => void; name: string }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{name}"?</AlertDialogTitle>
          <AlertDialogDescription>This action can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------- Publish state helpers ----------

type PublishStatus = "draft" | "scheduled" | "published";

function saveLabel(status: PublishStatus) {
  if (status === "published") return "Save & publish";
  if (status === "scheduled") return "Save & schedule";
  return "Save draft";
}

// Convert ISO string <-> value for <input type="datetime-local">
function isoToLocalInput(iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function localInputToIso(v: string) {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function PublishControls({
  status,
  scheduledAt,
  onChange,
}: {
  status: PublishStatus;
  scheduledAt: string | null;
  onChange: (status: PublishStatus, scheduledAt: string | null) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Publication">
          <Select
            value={status}
            onValueChange={(v) => {
              const next = v as PublishStatus;
              onChange(next, next === "scheduled" ? scheduledAt : null);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft â€” hidden</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published â€” live</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {status === "scheduled" && (
          <Field label="Goes live at">
            <Input
              type="datetime-local"
              value={isoToLocalInput(scheduledAt)}
              onChange={(e) => onChange(status, localInputToIso(e.target.value))}
            />
          </Field>
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {status === "draft" && "Only admins can see this. Nothing is visible on the public site."}
        {status === "scheduled" &&
          (scheduledAt
            ? `Goes live on ${new Date(scheduledAt).toLocaleString()}.`
            : "Pick a date and time to schedule.")}
        {status === "published" && "Visible to everyone on the public site."}
      </p>
    </div>
  );
}

function PublishBadge({
  status,
  scheduledAt,
}: {
  status: PublishStatus;
  scheduledAt: string | null;
}) {
  const live =
    status === "published" ||
    (status === "scheduled" && scheduledAt && new Date(scheduledAt) <= new Date());
  const tone =
    status === "published"
      ? "bg-accent2/15 text-accent2 ring-accent2/30"
      : status === "scheduled"
        ? "bg-amber-500/15 text-amber-600 ring-amber-500/30 dark:text-amber-400"
        : "bg-muted text-muted-foreground ring-border";
  const label =
    status === "published"
      ? "Published"
      : status === "scheduled"
        ? scheduledAt
          ? live
            ? "Live (scheduled)"
            : `Scheduled Â· ${new Date(scheduledAt).toLocaleDateString()}`
          : "Scheduled"
        : "Draft";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs ring-1 ${tone}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${live ? "bg-current" : "bg-current opacity-50"}`}
      />
      {label}
    </span>
  );
}

// ---------- Community moderation ----------

function CommunityPanel() {
  return (
    <Tabs defaultValue="posts">
      <TabsList className="flex h-auto flex-wrap gap-1">
        <TabsTrigger value="posts">Posts</TabsTrigger>
        <TabsTrigger value="replies">Replies</TabsTrigger>
        <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>
      <TabsContent value="posts" className="mt-6">
        <AdminPostsPanel />
      </TabsContent>
      <TabsContent value="replies" className="mt-6">
        <AdminRepliesPanel />
      </TabsContent>
      <TabsContent value="hashtags" className="mt-6">
        <AdminHashtagsPanel />
      </TabsContent>
      <TabsContent value="stats" className="mt-6">
        <AdminCommunityStatsPanel />
      </TabsContent>
    </Tabs>
  );
}

function AdminPostsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListPosts);
  const del = useServerFn(adminDeleteItem);
  const moderate = useServerFn(moderateThread);
  const [locked, setLocked] = useState<"all" | "locked" | "open">("all");
  const [category, setCategory] = useState<string>("");

  const q = useQuery({
    queryKey: ["admin-posts", locked, category],
    queryFn: () => list({ data: { locked, category: category || undefined, limit: 50 } }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id, kind: "post" } }),
    onSuccess: () => {
      toast.success("Post deleted.");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const lockMut = useMutation({
    mutationFn: (args: { id: string; locked: boolean }) =>
      moderate({ data: { id: args.id, locked: args.locked } }),
    onSuccess: (_r, args) => {
      toast.success(args.locked ? "Thread locked." : "Thread unlocked.");
      qc.invalidateQueries({ queryKey: ["admin-posts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = q.data ?? [];

  return (
    <div>
      <Toolbar
        title="Community posts"
        count={rows.length}
        action={
          <div className="flex items-center gap-2">
            <Select value={locked} onValueChange={(v) => setLocked(v as typeof locked)}>
              <SelectTrigger className="h-8 w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Category filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-8 w-40"
            />
          </div>
        }
      />
      <DataTable
        loading={q.isLoading}
        rows={rows}
        columns={[
          {
            header: "Author",
            cell: (r) => <span className="font-medium">{r.author?.display_name ?? "â€”"}</span>,
          },
          {
            header: "Post",
            cell: (r) => (
              <div className="max-w-md">
                {r.title && <p className="font-medium">{r.title}</p>}
                <p className="line-clamp-1 text-xs text-muted-foreground">{r.body}</p>
              </div>
            ),
          },
          {
            header: "Category",
            cell: (r) => <span className="text-muted-foreground">{r.category}</span>,
          },
          {
            header: "Replies",
            cell: (r) => <span>{r.reply_count}</span>,
          },
          {
            header: "Reactions",
            cell: (r) => <span>{Object.values(r.reaction_count).reduce((a, b) => a + b, 0)}</span>,
          },
          {
            header: "Status",
            cell: (r) =>
              r.locked ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-600 ring-1 ring-amber-500/30">
                  Locked
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 ring-1 ring-emerald-500/30">
                  Open
                </span>
              ),
          },
        ]}
        actions={(r) => (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={r.locked ? "Unlock" : "Lock"}
              disabled={lockMut.isPending}
              onClick={() => lockMut.mutate({ id: r.id, locked: !r.locked })}
            >
              {r.locked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
            </Button>
            <DeleteBtn
              onConfirm={() => delMut.mutate(r.id)}
              name={r.title ?? r.body.slice(0, 40)}
            />
          </>
        )}
      />
    </div>
  );
}

function AdminRepliesPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListReplies);
  const del = useServerFn(adminDeleteItem);
  const q = useQuery({
    queryKey: ["admin-replies"],
    queryFn: () => list({ data: { limit: 50 } }),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id, kind: "reply" } }),
    onSuccess: () => {
      toast.success("Reply deleted.");
      qc.invalidateQueries({ queryKey: ["admin-replies"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = q.data ?? [];

  return (
    <div>
      <Toolbar title="Community replies" count={rows.length} />
      <DataTable
        loading={q.isLoading}
        rows={rows}
        columns={[
          {
            header: "Author",
            cell: (r) => <span className="font-medium">{r.author?.display_name ?? "â€”"}</span>,
          },
          {
            header: "Reply",
            cell: (r) => <p className="max-w-md line-clamp-2 text-xs">{r.body}</p>,
          },
          {
            header: "On post",
            cell: (r) => (
              <Link
                to="/community/$id"
                params={{ id: r.post_id }}
                className="text-primary hover:underline"
              >
                {r.post_title ?? r.post_id.slice(0, 8)}
              </Link>
            ),
          },
          { header: "Depth", cell: (r) => <span>{r.depth}</span> },
          {
            header: "Reactions",
            cell: (r) => <span>{Object.values(r.reaction_count).reduce((a, b) => a + b, 0)}</span>,
          },
        ]}
        actions={(r) => (
          <DeleteBtn onConfirm={() => delMut.mutate(r.id)} name={r.body.slice(0, 40)} />
        )}
      />
    </div>
  );
}

function AdminHashtagsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(adminListHashtags);
  const suppress = useServerFn(adminSuppressHashtag);
  const q = useQuery({
    queryKey: ["admin-hashtags"],
    queryFn: () => list({ data: { limit: 100 } }),
  });

  const suppressMut = useMutation({
    mutationFn: (args: { id: string; suppressed: boolean }) =>
      suppress({ data: { id: args.id, suppressed: args.suppressed } }),
    onSuccess: (_r, args) => {
      toast.success(args.suppressed ? "Hashtag suppressed." : "Hashtag restored.");
      qc.invalidateQueries({ queryKey: ["admin-hashtags"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = q.data ?? [];

  return (
    <div>
      <Toolbar title="Hashtags" count={rows.length} />
      <DataTable
        loading={q.isLoading}
        rows={rows}
        columns={[
          {
            header: "Tag",
            cell: (r) => <span className="font-medium">#{r.tag}</span>,
          },
          { header: "Posts", cell: (r) => <span>{r.usage_count}</span> },
          {
            header: "Status",
            cell: (r) =>
              r.suppressed ? (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-600 ring-1 ring-red-500/30">
                  Suppressed
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 ring-1 ring-emerald-500/30">
                  Active
                </span>
              ),
          },
        ]}
        actions={(r) => (
          <Button
            variant="outline"
            size="sm"
            disabled={suppressMut.isPending}
            onClick={() => suppressMut.mutate({ id: r.id, suppressed: !r.suppressed })}
          >
            {r.suppressed ? "Restore" : "Suppress"}
          </Button>
        )}
      />
    </div>
  );
}

function AdminCommunityStatsPanel() {
  const get = useServerFn(adminCommunityStats);
  const q = useQuery({ queryKey: ["admin-community-stats"], queryFn: () => get() });
  const s = q.data;

  return (
    <div>
      <Toolbar title="Community health" count={0} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Posts (7d)" value={s?.posts_7d ?? 0} />
        <StatCard label="Replies (7d)" value={s?.replies_7d ?? 0} />
        <StatCard label="Reactions (7d)" value={s?.reactions_7d ?? 0} />
        <StatCard label="New follows (7d)" value={s?.follows_7d ?? 0} />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total posts" value={s?.total_posts ?? 0} />
        <StatCard label="Total replies" value={s?.total_replies ?? 0} />
        <StatCard label="Total users" value={s?.total_users ?? 0} />
      </div>
      {q.error && <p className="mt-4 text-sm text-destructive">{(q.error as Error).message}</p>}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-2xl font-semibold">{value}</div>
    </div>
  );
}

function AnalyticsPanel() {
  const [days, setDays] = useState(30);
  const summary = useServerFn(adminAnalyticsSummary);
  const q = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => summary({ data: { days } }),
    retry: false,
  });

  if (q.isLoading) {
    return <p className="text-sm text-muted-foreground p-6">Loading analytics...</p>;
  }
  if (q.error) {
    return <div className="text-sm text-destructive p-6">{(q.error as Error).message}</div>;
  }

  const data = q.data;
  const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div>
          <h3 className="font-display text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> Recommendation Analytics
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {`Last ${data?.days} days Â· ${data?.totals.events ?? 0} recommendation events recorded`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-semibold">Window</span>
          <Select value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last day</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="h-9"
            disabled={!data}
            onClick={() => {
              if (!data) return;
              downloadAnalyticsCsv(data, days);
            }}
          >
            <Download className="mr-1 h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AnalyticsStat label="Impressions" value={data?.totals.impressions ?? 0} />
        <AnalyticsStat label="Clicks" value={data?.totals.clicks ?? 0} />
        <AnalyticsStat label="CTR" value={pct(data?.totals.ctr ?? 0)} />
        <AnalyticsStat label="Events" value={data?.totals.events ?? 0} />
      </div>

      <AnalyticsPanelWrapper title="By Recommendation Surface">
        <AnalyticsTable
          headers={["Surface", "Impressions", "Clicks", "CTR"]}
          rows={(data?.bySurface ?? []).map((r) => [
            r.surface,
            r.impressions,
            r.clicks,
            pct(r.ctr),
          ])}
        />
      </AnalyticsPanelWrapper>

      <AnalyticsPanelWrapper title="Top Recommended Items">
        <AnalyticsTable
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
      </AnalyticsPanelWrapper>

      <AnalyticsPanelWrapper title="Top Recommendation Reasons">
        <AnalyticsTable
          headers={["Reason", "Impressions", "Clicks", "CTR"]}
          rows={(data?.topReasons ?? []).map((r) => [
            r.reason,
            r.impressions,
            r.clicks,
            pct(r.ctr),
          ])}
        />
      </AnalyticsPanelWrapper>
    </div>
  );
}
