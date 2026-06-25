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
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, DollarSign, Store, User, CreditCard } from "lucide-react";
import { toast } from "sonner";
import {
  getSellerProfile,
  updateSellerProfile,
  sellerListAgents,
  sellerListProducts,
  sellerListServices,
  sellerUpsertAgent,
  sellerUpsertProduct,
  sellerUpsertService,
  sellerDeleteListing,
  getSellerPayoutInfo,
} from "@/lib/seller.functions";
import { createConnectOnboardingLink, checkConnectAccountStatus } from "@/lib/payouts.functions";

export const Route = createFileRoute("/_authenticated/seller")({
  head: () => ({ meta: [{ title: "Seller Dashboard — Melanated In Tech" }] }),
  component: SellerDashboard,
});

function SellerDashboard() {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Seller"
        title="Your marketplace."
        description="Manage your agent and service listings, set pricing, and track earnings."
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Tabs defaultValue="agents">
          <TabsList className="flex h-auto flex-wrap justify-start gap-1">
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>
          <TabsContent value="agents" className="mt-6">
            <SellerAgentsPanel />
          </TabsContent>
          <TabsContent value="products" className="mt-6">
            <SellerProductsPanel />
          </TabsContent>
          <TabsContent value="services" className="mt-6">
            <SellerServicesPanel />
          </TabsContent>
          <TabsContent value="profile" className="mt-6">
            <SellerProfilePanel />
          </TabsContent>
          <TabsContent value="payouts" className="mt-6">
            <SellerPayoutsPanel />
          </TabsContent>
        </Tabs>
      </section>
    </SiteLayout>
  );
}

// ---------- Profile ----------

type SellerProfile = Awaited<ReturnType<typeof getSellerProfile>>;

function SellerProfilePanel() {
  const qc = useQueryClient();
  const profileQuery = useServerFn(getSellerProfile);
  const q = useQuery({ queryKey: ["seller-profile"], queryFn: () => profileQuery() });

  const [form, setForm] = useState({
    display_name: "",
    bio: "",
    avatar_url: "",
    website_url: "",
  });

  // Sync form when data loads.
  if (q.data && form.display_name === "" && q.data.display_name) {
    setForm({
      display_name: q.data.display_name,
      bio: q.data.bio ?? "",
      avatar_url: q.data.avatar_url ?? "",
      website_url: q.data.website_url ?? "",
    });
  }

  const updateMut = useServerFn(updateSellerProfile);
  const mut = useMutation({
    mutationFn: () => updateMut({ data: form }),
    onSuccess: () => {
      toast.success("Profile updated.");
      qc.invalidateQueries({ queryKey: ["seller-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading profile…</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div>
        <h3 className="mb-4 text-lg font-semibold">Seller Profile</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          This information is visible on your seller page and marketplace listings.
        </p>
        <div className="space-y-4">
          <div>
            <Label htmlFor="seller-name">Display Name</Label>
            <Input
              id="seller-name"
              value={form.display_name}
              onChange={(e) => setForm({ ...form, display_name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="seller-bio">Bio</Label>
            <Textarea
              id="seller-bio"
              rows={3}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              placeholder="Tell buyers about yourself and what you build."
            />
          </div>
          <div>
            <Label htmlFor="seller-avatar">Avatar URL</Label>
            <Input
              id="seller-avatar"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <div>
            <Label htmlFor="seller-website">Website</Label>
            <Input
              id="seller-website"
              value={form.website_url}
              onChange={(e) => setForm({ ...form, website_url: e.target.value })}
              placeholder="https://…"
            />
          </div>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : "Save profile"}
          </Button>
        </div>
      </div>
      <div className="rounded-lg border bg-muted/30 p-6">
        <h4 className="mb-2 font-medium">Your seller page</h4>
        <p className="text-sm text-muted-foreground">
          Your listings appear at{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            /sellers/{q.data?.slug ?? "your-slug"}
          </code>
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span className="capitalize">{q.data?.stripe_account_status ?? "pending"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payouts</span>
            <span>{q.data?.payout_enabled ? "Enabled" : "Not connected"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Commission</span>
            <span>{q.data?.commission_rate ?? 10}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Agents ----------

type SellerAgentRow = Awaited<ReturnType<typeof sellerListAgents>>[number];
type SellerProductRow = Awaited<ReturnType<typeof sellerListProducts>>[number];

function SellerAgentsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(sellerListAgents);
  const del = useServerFn(sellerDeleteListing);
  const q = useQuery({ queryKey: ["seller-agents"], queryFn: () => list() });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { table: "agents", id } }),
    onSuccess: () => {
      toast.success("Agent deleted.");
      qc.invalidateQueries({ queryKey: ["seller-agents"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {q.data?.length ?? 0} agent{(q.data?.length ?? 0) !== 1 ? "s" : ""} listed
        </p>
        <SellerAgentEditor
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> New agent
            </Button>
          }
        />
      </div>
      {q.isLoading ? (
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      ) : !q.data?.length ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Store className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No agents yet. Create your first listing to start selling.
          </p>
          <div className="mt-4">
            <SellerAgentEditor
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Create agent
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {q.data.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{agent.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs capitalize">
                    {agent.tier}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs capitalize">
                    {agent.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{agent.tagline}</p>
                <p className="mt-1 text-sm font-medium">
                  {agent.price_cents ? `$${(agent.price_cents / 100).toFixed(2)}` : "Free"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <SellerAgentEditor
                  existing={agent}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{agent.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. The listing will be removed from the marketplace.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => delMut.mutate(agent.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SellerAgentEditor({
  existing,
  trigger,
}: {
  existing?: SellerAgentRow;
  trigger: React.ReactNode;
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(sellerUpsertAgent);
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
    capabilities: (existing?.capabilities ?? []).join("\n"),
    model:
      ((existing as Record<string, unknown> | undefined)?.model as string | undefined) ??
      "gpt-4o-mini",
    system_prompt: (existing as Record<string, unknown> | undefined)?.system_prompt as
      | string
      | undefined,
    max_tokens:
      ((existing as Record<string, unknown> | undefined)?.max_tokens as number | undefined) ?? 1000,
    temperature:
      ((existing as Record<string, unknown> | undefined)?.temperature as number | undefined) ?? 0.7,
    unlock_content: (existing as Record<string, unknown> | undefined)?.unlock_content as
      | string
      | undefined,
    status: (existing?.status ?? "draft") as "draft" | "scheduled" | "published",
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
      qc.invalidateQueries({ queryKey: ["seller-agents"] });
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
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Capabilities (one per line)">
            <Textarea
              rows={3}
              value={form.capabilities}
              onChange={(e) => setForm({ ...form, capabilities: e.target.value })}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="AI model">
              <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="o1-mini">o1 Mini</SelectItem>
                  <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                  <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                </SelectContent>
              </Select>
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
          <Field label="System prompt (optional, buyers can chat with this agent)">
            <Textarea
              rows={4}
              value={form.system_prompt ?? ""}
              onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
              placeholder="Define the agent's personality, instructions, or knowledge base."
            />
          </Field>
          <Field label="Unlock content (markdown, buyers only)">
            <Textarea
              rows={5}
              value={form.unlock_content ?? ""}
              onChange={(e) => setForm({ ...form, unlock_content: e.target.value })}
              placeholder="The prompt pack or content delivered after purchase."
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : existing ? "Save changes" : "Create agent"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Services ----------

type SellerServiceRow = Awaited<ReturnType<typeof sellerListServices>>[number];

function SellerServicesPanel() {
  const qc = useQueryClient();
  const list = useServerFn(sellerListServices);
  const del = useServerFn(sellerDeleteListing);
  const q = useQuery({ queryKey: ["seller-services"], queryFn: () => list() });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { table: "services", id } }),
    onSuccess: () => {
      toast.success("Service deleted.");
      qc.invalidateQueries({ queryKey: ["seller-services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {q.data?.length ?? 0} service{(q.data?.length ?? 0) !== 1 ? "s" : ""} listed
        </p>
        <SellerServiceEditor
          trigger={
            <Button size="sm">
              <Plus className="h-4 w-4" /> New service
            </Button>
          }
        />
      </div>
      {q.isLoading ? (
        <div className="p-6 text-sm text-muted-foreground">Loading…</div>
      ) : !q.data?.length ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <User className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            No services yet. Create a service offering.
          </p>
          <div className="mt-4">
            <SellerServiceEditor
              trigger={
                <Button size="sm">
                  <Plus className="h-4 w-4" /> Create service
                </Button>
              }
            />
          </div>
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {q.data.map((svc) => (
            <div key={svc.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{svc.name}</span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs capitalize">
                    {svc.status}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">{svc.tagline}</p>
                <p className="mt-1 text-sm font-medium">
                  {svc.starting_price_cents
                    ? `From $${(svc.starting_price_cents / 100).toFixed(2)}`
                    : "Contact for pricing"}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <SellerServiceEditor
                  existing={svc}
                  trigger={
                    <Button variant="ghost" size="icon" aria-label="Edit">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete "{svc.name}"?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This cannot be undone. The listing will be removed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => delMut.mutate(svc.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SellerServiceEditor({
  existing,
  trigger,
}: {
  existing?: SellerServiceRow;
  trigger: React.ReactNode;
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(sellerUpsertService);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => ({
    id: existing?.id,
    slug: existing?.slug ?? "",
    name: existing?.name ?? "",
    tagline: existing?.tagline ?? "",
    description: existing?.description ?? "",
    starting_price_cents: existing?.starting_price_cents ?? null,
    outcomes: (existing?.outcomes ?? []).join("\n"),
    status: (existing?.status ?? "draft") as "draft" | "scheduled" | "published",
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
      qc.invalidateQueries({ queryKey: ["seller-services"] });
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
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Starting price (cents)">
            <Input
              type="number"
              min={0}
              value={form.starting_price_cents ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  starting_price_cents: e.target.value ? Number(e.target.value) : null,
                })
              }
              placeholder="0 for free / contact"
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Outcomes (one per line)">
            <Textarea
              rows={3}
              value={form.outcomes}
              onChange={(e) => setForm({ ...form, outcomes: e.target.value })}
              placeholder="What buyers receive or can expect."
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : existing ? "Save changes" : "Create service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Payouts ----------

type PayoutInfo = Awaited<ReturnType<typeof getSellerPayoutInfo>>;

function SellerPayoutsPanel() {
  const qc = useQueryClient();
  const payoutFn = useServerFn(getSellerPayoutInfo);
  const q = useQuery({ queryKey: ["seller-payouts"], queryFn: () => payoutFn() });

  const onboardFn = useServerFn(createConnectOnboardingLink);
  const checkStatusFn = useServerFn(checkConnectAccountStatus);

  const onboardMut = useMutation({
    mutationFn: () =>
      onboardFn({
        data: { baseUrl: window.location.origin },
      }),
    onSuccess: (result) => {
      window.location.href = result.url;
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkStatusMut = useMutation({
    mutationFn: () => checkStatusFn(),
    onSuccess: () => {
      toast.success("Account status updated.");
      qc.invalidateQueries({ queryKey: ["seller-payouts"] });
      qc.invalidateQueries({ queryKey: ["seller-profile"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (q.isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading payout info…</div>;
  }

  const info = q.data as PayoutInfo | undefined;
  const needsOnboarding = !info?.stripe_account_id || info?.stripe_account_status !== "connected";

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Payout Settings</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stripe status</span>
            <span className="capitalize">{info?.stripe_account_status ?? "pending"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payouts enabled</span>
            <span>{info?.payout_enabled ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Commission rate</span>
            <span>{info?.commission_rate ?? 10}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Connected account</span>
            <span className="font-mono text-xs">{info?.stripe_account_id ?? "Not connected"}</span>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {needsOnboarding ? (
            <Button size="sm" onClick={() => onboardMut.mutate()} disabled={onboardMut.isPending}>
              {onboardMut.isPending
                ? "Generating link…"
                : info?.stripe_account_id
                  ? "Reconnect Stripe account"
                  : "Connect Stripe account"}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => checkStatusMut.mutate()}
              disabled={checkStatusMut.isPending}
            >
              {checkStatusMut.isPending ? "Checking…" : "Refresh account status"}
            </Button>
          )}
          {info?.stripe_account_id && info.stripe_account_status === "connected" && (
            <p className="text-xs text-green-600">
              Your Stripe account is connected and ready to receive payouts.
            </p>
          )}
          {info?.stripe_account_id && info.stripe_account_status !== "connected" && (
            <p className="text-xs text-amber-600">
              Your account is connected but not yet active. Click the link above to complete
              onboarding, then refresh.
            </p>
          )}
        </div>
      </div>
      <div className="rounded-lg border p-6">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Earnings</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total earnings</span>
            <span className="font-medium">
              ${((info?.total_earnings_cents ?? 0) / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Unpaid earnings</span>
            <span className="font-medium text-green-600">
              ${((info?.unpaid_earnings_cents ?? 0) / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sales attributed</span>
            <span>{info?.entitlements_count ?? 0}</span>
          </div>
        </div>
        <div className="mt-4 rounded bg-muted/50 p-3 text-xs text-muted-foreground">
          Earnings are calculated from purchases attributed to your listings. Payouts are processed
          via Stripe Connect.
        </div>
      </div>
    </div>
  );
}

// ---------- Products ----------

function SellerProductsPanel() {
  const qc = useQueryClient();
  const list = useServerFn(sellerListProducts);
  const del = useServerFn(sellerDeleteListing);
  const q = useQuery({ queryKey: ["seller-products"], queryFn: () => list() });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { table: "products", id } }),
    onSuccess: () => {
      toast.success("Product deleted.");
      qc.invalidateQueries({ queryKey: ["seller-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Products</h2>
        <SellerProductEditor
          trigger={
            <Button size="sm">
              <Plus className="mr-1 h-4 w-4" /> New product
            </Button>
          }
        />
      </div>

      {q.isLoading && <div className="h-24 animate-pulse rounded-lg border bg-muted/50" />}

      {q.data && q.data.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No products yet. Click "New product" to create one.
        </div>
      )}

      <div className="space-y-3">
        {q.data?.map((p) => (
          <div key={p.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{p.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {p.tier}
                  </Badge>
                  {p.featured && <Badge className="text-xs">Featured</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{p.tagline}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.category} · {p.price_cents ? `$${(p.price_cents / 100).toFixed(2)}` : "Free"} ·{" "}
                  {p.status}
                </p>
              </div>
              <div className="flex gap-1">
                <SellerProductEditor
                  existing={p}
                  trigger={
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive"
                  onClick={() => delMut.mutate(p.id)}
                  disabled={delMut.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SellerProductEditor({
  existing,
  trigger,
}: {
  existing?: SellerProductRow;
  trigger: React.ReactNode;
}) {
  const qc = useQueryClient();
  const upsert = useServerFn(sellerUpsertProduct);
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
    featured: existing?.featured ?? false,
    model: (existing?.model ?? "gpt-4o-mini") as string,
    system_prompt: (existing?.system_prompt ?? "") as string,
    max_tokens: existing?.max_tokens ?? 1000,
    temperature: existing?.temperature ?? 0.7,
    unlock_content: (existing?.unlock_content ?? "") as string,
    status: (existing?.status ?? "draft") as "draft" | "scheduled" | "published",
    scheduled_at: existing?.scheduled_at ?? null,
  }));

  const mut = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          ...form,
          price_cents: form.price_cents ?? null,
        },
      }),
    onSuccess: () => {
      toast.success(existing ? "Product saved." : "Product created.");
      qc.invalidateQueries({ queryKey: ["seller-products"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
            <Field label="Status">
              <Select
                value={form.status}
                onValueChange={(v) => setForm({ ...form, status: v as typeof form.status })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="AI model">
              <Select value={form.model} onValueChange={(v) => setForm({ ...form, model: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="o1-mini">o1 Mini</SelectItem>
                  <SelectItem value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</SelectItem>
                  <SelectItem value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</SelectItem>
                </SelectContent>
              </Select>
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
              rows={4}
              value={form.unlock_content}
              onChange={(e) => setForm({ ...form, unlock_content: e.target.value })}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => mut.mutate()} disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : existing ? "Save changes" : "Create product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------- Shared UI ----------

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
