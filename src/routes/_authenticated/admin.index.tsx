import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Pencil, Plus, Trash2, ShieldCheck, Mail, Inbox, Lock, Unlock } from "lucide-react";
import { toast } from "sonner";
import { Markdown } from "@/components/markdown";
import {
  adminListAgents,
  adminListArticles,
  adminListServices,
  adminListWaitlist,
  adminListMessages,
  adminUpdateMessage,
  adminDeleteMessage,
  adminUpsertAgent,
  adminUpsertArticle,
  adminUpsertService,
  adminDelete,
  checkAdminStatus,
  claimFirstAdmin,
} from "@/lib/admin.functions";
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
  head: () => ({ meta: [{ title: "Admin — Melanated In Tech" }] }),
  component: AdminPage,
});

function AdminPage() {
  const check = useServerFn(checkAdminStatus);
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => check() });

  if (status.isLoading) {
    return (
      <SiteLayout>
        <div className="p-12 text-sm text-muted-foreground">Loading…</div>
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

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="Manage the platform."
        description="Edit marketplace listings, knowledge content, services, and review inbound activity."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap justify-end gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/catalog">Catalog verification →</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/analytics">View analytics →</Link>
          </Button>
        </div>
        <Tabs defaultValue="agents">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="articles">Knowledge</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="community">Community</TabsTrigger>
          </TabsList>
          <TabsContent value="agents" className="mt-6">
            <AgentsPanel />
          </TabsContent>
          <TabsContent value="articles" className="mt-6">
            <ArticlesPanel />
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <ServicesPanel />
          </TabsContent>
          <TabsContent value="submissions" className="mt-6">
            <SubmissionsPanel />
          </TabsContent>
          <TabsContent value="waitlist" className="mt-6">
            <WaitlistPanel />
          </TabsContent>
          <TabsContent value="messages" className="mt-6">
            <MessagesPanel />
          </TabsContent>
          <TabsContent value="community" className="mt-6">
            <CommunityPanel />
          </TabsContent>
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
              {mut.isPending ? "Claiming…" : "Claim admin access"}
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
      <DataTable
        loading={q.isLoading}
        rows={q.data ?? []}
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unlock_content: ((existing as any)?.unlock_content ?? "") as string,
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
          <FulfillmentField
            label="Unlock pack (markdown) — delivered to buyers only"
            value={form.unlock_content}
            onChange={(v) => setForm({ ...form, unlock_content: v })}
            hint="Premium agents need a pack here or they show “Coming soon” instead of a buy button."
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
            {mut.isPending ? "Saving…" : saveLabel(form.status)}
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
      <DataTable
        loading={q.isLoading}
        rows={q.data ?? []}
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
            {mut.isPending ? "Saving…" : saveLabel(form.status)}
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
      <DataTable
        loading={q.isLoading}
        rows={q.data ?? []}
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
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
            {mut.isPending ? "Saving…" : saveLabel(form.status)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      <DataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        columns={[
          { header: "Email", cell: (r) => <span className="font-medium">{r.email}</span> },
          {
            header: "Source",
            cell: (r) => <span className="text-muted-foreground">{r.source ?? "—"}</span>,
          },
          {
            header: "Interest",
            cell: (r) => <span className="text-muted-foreground">{r.interest ?? "—"}</span>,
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
    <div>
      <Toolbar
        title="Contact messages"
        count={q.data?.length ?? 0}
        icon={<Mail className="h-4 w-4" />}
      />
      <div className="mt-4 grid gap-3">
        {(q.data ?? []).map((m) => {
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
                    {m.name} <span className="text-muted-foreground">· {m.email}</span>
                    {handled && (
                      <span className="ml-2 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 ring-1 ring-emerald-500/30">
                        Handled
                      </span>
                    )}
                  </p>
                  {m.organization && (
                    <p className="text-xs text-muted-foreground">
                      {m.organization}
                      {m.topic ? ` · ${m.topic}` : ""}
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
        {!q.isLoading && (q.data ?? []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No messages yet.
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

  const reviewMut = useMutation({
    mutationFn: (args: {
      id: string;
      status: "approved" | "rejected" | "pending";
      notes: string;
    }) => review({ data: { id: args.id, status: args.status, review_notes: args.notes || null } }),
    onSuccess: (res) => {
      if (res?.publishedSlug) {
        toast.success(`Approved — published as /agents/${res.publishedSlug}`);
      } else {
        toast.success("Submission updated.");
      }
      qc.invalidateQueries({ queryKey: ["admin-submissions"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Toolbar
        title="Agent submissions"
        count={q.data?.length ?? 0}
        icon={<Inbox className="h-4 w-4" />}
      />
      <div className="mt-4 grid gap-3">
        {(q.data ?? []).map((s) => (
          <SubmissionCard
            key={s.id}
            submission={s}
            pending={reviewMut.isPending}
            onReview={(status, notes) => reviewMut.mutate({ id: s.id, status, notes })}
          />
        ))}
        {!q.isLoading && (q.data ?? []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            No submissions yet.
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
            {submission.category} · {submission.contact_email} ·{" "}
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
              Website ↗
            </a>
          )}
          {submission.demo_url && (
            <a
              href={submission.demo_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Demo ↗
            </a>
          )}
          {submission.repo_url && (
            <a
              href={submission.repo_url}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              Repo ↗
            </a>
          )}
          {submission.published_agent_id && (
            <Link to="/agents" className="text-emerald-700 hover:underline">
              Live agent ↗
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

function downloadCsv(name: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  // eslint-disable-next-line no-irregular-whitespace
  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" });
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
  if (loading) return <p className="mt-6 text-sm text-muted-foreground">Loading…</p>;
  if (rows.length === 0) {
    return (
      <div className="mt-4 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        Nothing here yet.
      </div>
    );
  }
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
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
          placeholder="# Pack title&#10;&#10;Markdown the buyer sees after purchase…"
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

function IconBtn({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={label}>
      {children}
    </Button>
  );
}

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
              <SelectItem value="draft">Draft — hidden</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="published">Published — live</SelectItem>
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
            : `Scheduled · ${new Date(scheduledAt).toLocaleDateString()}`
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
      <TabsList>
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
            cell: (r) => <span className="font-medium">{r.author?.display_name ?? "—"}</span>,
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
            cell: (r) => <span className="font-medium">{r.author?.display_name ?? "—"}</span>,
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
