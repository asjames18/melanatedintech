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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Plus, Trash2, ShieldCheck, Mail, Inbox } from "lucide-react";
import { toast } from "sonner";
import {
  adminListAgents, adminListArticles, adminListServices,
  adminListWaitlist, adminListMessages,
  adminUpsertAgent, adminUpsertArticle, adminUpsertService,
  adminDelete, checkAdminStatus, claimFirstAdmin,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Melanated In Tech" }] }),
  component: AdminPage,
});

function AdminPage() {
  const check = useServerFn(checkAdminStatus);
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => check() });

  if (status.isLoading) {
    return <SiteLayout><div className="p-12 text-sm text-muted-foreground">Loading…</div></SiteLayout>;
  }
  if (status.error) {
    return <SiteLayout><div className="p-12 text-sm text-destructive">{(status.error as Error).message}</div></SiteLayout>;
  }
  if (!status.data?.isAdmin) {
    return <NoAccess adminCount={status.data?.adminCount ?? 0} onClaimed={() => status.refetch()} />;
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="Manage the platform."
        description="Edit marketplace listings, knowledge content, services, and review inbound activity."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Tabs defaultValue="agents">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="articles">Knowledge</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          <TabsContent value="agents" className="mt-6"><AgentsPanel /></TabsContent>
          <TabsContent value="articles" className="mt-6"><ArticlesPanel /></TabsContent>
          <TabsContent value="services" className="mt-6"><ServicesPanel /></TabsContent>
          <TabsContent value="waitlist" className="mt-6"><WaitlistPanel /></TabsContent>
          <TabsContent value="messages" className="mt-6"><MessagesPanel /></TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

function NoAccess({ adminCount, onClaimed }: { adminCount: number; onClaimed: () => void }) {
  const claim = useServerFn(claimFirstAdmin);
  const mut = useMutation({
    mutationFn: () => claim(),
    onSuccess: () => { toast.success("You're now an admin."); onClaimed(); },
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
            <p className="mt-2 text-sm text-muted-foreground">No admins exist yet. Claim the first admin seat for this workspace.</p>
            <Button className="mt-6" onClick={() => mut.mutate()} disabled={mut.isPending}>
              {mut.isPending ? "Claiming…" : "Claim admin access"}
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">Your account doesn't have admin permissions. Ask an existing admin to grant access.</p>
            <Button asChild variant="outline" className="mt-6"><Link to="/account">Back to account</Link></Button>
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
    onSuccess: () => { toast.success("Agent deleted."); qc.invalidateQueries({ queryKey: ["admin-agents"] }); qc.invalidateQueries({ queryKey: ["agents"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Toolbar
        title="Marketplace agents"
        count={q.data?.length ?? 0}
        action={<AgentEditor trigger={<Button size="sm"><Plus className="h-4 w-4" /> New agent</Button>} />}
      />
      <DataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        columns={[
          { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
          { header: "Category", cell: (r) => <span className="text-muted-foreground">{r.category}</span> },
          { header: "Tier", cell: (r) => <span className="capitalize">{r.tier}</span> },
          { header: "Status", cell: (r) => <PublishBadge status={r.status} scheduledAt={r.scheduled_at} /> },
        ]}
        actions={(r) => (
          <>
            <AgentEditor existing={r} trigger={<IconBtn label="Edit"><Pencil className="h-3.5 w-3.5" /></IconBtn>} />
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
    status: (existing?.status ?? "draft") as PublishStatus,
    scheduled_at: existing?.scheduled_at ?? null,
  }));

  const mut = useMutation({
    mutationFn: () => upsert({
      data: {
        ...form,
        capabilities: form.capabilities.split("\n").map((s) => s.trim()).filter(Boolean),
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
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="kebab-case-url" /></Field>
          <Field label="Tagline"><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
          <Field label="Description"><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Tier">
              <Select value={form.tier} onValueChange={(v) => setForm({ ...form, tier: v as typeof form.tier })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Capabilities (one per line)">
            <Textarea rows={4} value={form.capabilities} onChange={(e) => setForm({ ...form, capabilities: e.target.value })} />
          </Field>
          <ToggleField label="Featured" checked={form.featured} onChange={(v) => setForm({ ...form, featured: v })} />
          <PublishControls
            status={form.status}
            scheduledAt={form.scheduled_at}
            onChange={(status, scheduled_at) => setForm({ ...form, status, scheduled_at })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Saving…" : saveLabel(form.status)}</Button>
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
    onSuccess: () => { toast.success("Article deleted."); qc.invalidateQueries({ queryKey: ["admin-articles"] }); qc.invalidateQueries({ queryKey: ["articles"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Toolbar
        title="Knowledge hub articles"
        count={q.data?.length ?? 0}
        action={<ArticleEditor trigger={<Button size="sm"><Plus className="h-4 w-4" /> New article</Button>} />}
      />
      <DataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        columns={[
          { header: "Title", cell: (r) => <span className="font-medium">{r.title}</span> },
          { header: "Category", cell: (r) => <span className="text-muted-foreground">{r.category}</span> },
          { header: "Read", cell: (r) => <span>{r.read_minutes} min</span> },
          { header: "Status", cell: (r) => <PublishBadge status={r.status} scheduledAt={r.scheduled_at} /> },
        ]}
        actions={(r) => (
          <>
            <ArticleEditor existing={r} trigger={<IconBtn label="Edit"><Pencil className="h-3.5 w-3.5" /></IconBtn>} />
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
        <DialogHeader><DialogTitle>{existing ? "Edit article" : "New article"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
          <Field label="Excerpt"><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>
          <Field label="Body (markdown)"><Textarea rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Read minutes"><Input type="number" value={form.read_minutes} onChange={(e) => setForm({ ...form, read_minutes: Number(e.target.value) })} /></Field>
          </div>
          <PublishControls
            status={form.status}
            scheduledAt={form.scheduled_at}
            onChange={(status, scheduled_at) => setForm({ ...form, status, scheduled_at })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Saving…" : saveLabel(form.status)}</Button>
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
    onSuccess: () => { toast.success("Service deleted."); qc.invalidateQueries({ queryKey: ["admin-services"] }); qc.invalidateQueries({ queryKey: ["services"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <Toolbar
        title="Professional services"
        count={q.data?.length ?? 0}
        action={<ServiceEditor trigger={<Button size="sm"><Plus className="h-4 w-4" /> New service</Button>} />}
      />
      <DataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        columns={[
          { header: "Name", cell: (r) => <span className="font-medium">{r.name}</span> },
          { header: "Outcomes", cell: (r) => <span className="text-muted-foreground">{r.outcomes.length}</span> },
          { header: "Status", cell: (r) => <PublishBadge status={r.status} scheduledAt={r.scheduled_at} /> },
        ]}
        actions={(r) => (
          <>
            <ServiceEditor existing={r} trigger={<IconBtn label="Edit"><Pencil className="h-3.5 w-3.5" /></IconBtn>} />
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
    mutationFn: () => upsert({
      data: {
        ...form,
        outcomes: form.outcomes.split("\n").map((s) => s.trim()).filter(Boolean),
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
        <DialogHeader><DialogTitle>{existing ? "Edit service" : "New service"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <Field label="Name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
          <Field label="Tagline"><Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} /></Field>
          <Field label="Description"><Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <Field label="Outcomes (one per line)">
            <Textarea rows={4} value={form.outcomes} onChange={(e) => setForm({ ...form, outcomes: e.target.value })} />
          </Field>
          <PublishControls
            status={form.status}
            scheduledAt={form.scheduled_at}
            onChange={(status, scheduled_at) => setForm({ ...form, status, scheduled_at })}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>{mut.isPending ? "Saving…" : saveLabel(form.status)}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Waitlist & Messages (read-only) ----------

function WaitlistPanel() {
  const list = useServerFn(adminListWaitlist);
  const q = useQuery({ queryKey: ["admin-waitlist"], queryFn: () => list() });
  return (
    <div>
      <Toolbar title="Waitlist signups" count={q.data?.length ?? 0} icon={<Inbox className="h-4 w-4" />} />
      <DataTable
        loading={q.isLoading}
        rows={q.data ?? []}
        columns={[
          { header: "Email", cell: (r) => <span className="font-medium">{r.email}</span> },
          { header: "Source", cell: (r) => <span className="text-muted-foreground">{r.source ?? "—"}</span> },
          { header: "Interest", cell: (r) => <span className="text-muted-foreground">{r.interest ?? "—"}</span> },
          { header: "When", cell: (r) => <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span> },
        ]}
      />
    </div>
  );
}

function MessagesPanel() {
  const list = useServerFn(adminListMessages);
  const q = useQuery({ queryKey: ["admin-messages"], queryFn: () => list() });
  return (
    <div>
      <Toolbar title="Contact messages" count={q.data?.length ?? 0} icon={<Mail className="h-4 w-4" />} />
      <div className="mt-4 grid gap-3">
        {(q.data ?? []).map((m) => (
          <div key={m.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <p className="font-medium">{m.name} <span className="text-muted-foreground">· {m.email}</span></p>
                {m.organization && <p className="text-xs text-muted-foreground">{m.organization}{m.topic ? ` · ${m.topic}` : ""}</p>}
              </div>
              <span className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-2 whitespace-pre-line text-sm">{m.message}</p>
          </div>
        ))}
        {!q.isLoading && (q.data ?? []).length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No messages yet.</div>
        )}
      </div>
    </div>
  );
}

// ---------- Shared bits ----------

function Toolbar({ title, count, action, icon }: { title: string; count: number; action?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{count}</span>
      </div>
      {action}
    </div>
  );
}

type Col<T> = { header: string; cell: (r: T) => React.ReactNode };
function DataTable<T extends { id: string }>({
  rows, columns, actions, loading,
}: { rows: T[]; columns: Col<T>[]; actions?: (r: T) => React.ReactNode; loading?: boolean }) {
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
            {columns.map((c) => <th key={c.header} className="px-4 py-2.5 text-left font-medium">{c.header}</th>)}
            {actions && <th className="px-4 py-2.5 text-right font-medium">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border">
              {columns.map((c, i) => <td key={i} className="px-4 py-3">{c.cell(r)}</td>)}
              {actions && <td className="px-4 py-3"><div className="flex justify-end gap-1">{actions(r)}</div></td>}
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
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
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
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-accent2" : "bg-muted-foreground/40"}`} />
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
        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label="Delete">
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
