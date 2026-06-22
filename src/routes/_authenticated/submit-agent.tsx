import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { submitAgent, listMySubmissions } from "@/lib/submissions.functions";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/submit-agent")({
  head: () => ({
    meta: [
      { title: "Submit an agent — Melanated In Tech" },
      { name: "description", content: "Submit your AI agent for review and listing on the marketplace." },
    ],
  }),
  component: SubmitAgentPage,
});

const CATEGORIES = [
  "Research", "Writing", "Coding", "Design", "Marketing",
  "Sales", "Operations", "Data", "Education", "Other",
];

function SubmitAgentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const submit = useServerFn(submitAgent);
  const listMine = useServerFn(listMySubmissions);
  const mine = useQuery({ queryKey: ["my-submissions"], queryFn: () => listMine() });

  const [form, setForm] = useState({
    name: "", tagline: "", description: "",
    category: CATEGORIES[0], capabilities: "",
    website_url: "", demo_url: "", repo_url: "",
    contact_email: "", pricing_notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    try {
      const capabilities = form.capabilities
        .split(",").map((s) => s.trim()).filter(Boolean).slice(0, 12);
      await submit({
        data: {
          name: form.name,
          tagline: form.tagline,
          description: form.description,
          category: form.category,
          capabilities,
          website_url: form.website_url || undefined,
          demo_url: form.demo_url || undefined,
          repo_url: form.repo_url || undefined,
          contact_email: form.contact_email,
          pricing_notes: form.pricing_notes || null,
        },
      });
      toast.success("Submission received! We'll review it shortly.");
      setForm({
        name: "", tagline: "", description: "",
        category: CATEGORIES[0], capabilities: "",
        website_url: "", demo_url: "", repo_url: "",
        contact_email: "", pricing_notes: "",
      });
      qc.invalidateQueries({ queryKey: ["my-submissions"] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed.";
      try {
        const parsed = JSON.parse(msg);
        if (Array.isArray(parsed)) {
          const next: Record<string, string> = {};
          for (const issue of parsed) next[issue.path?.[0] ?? "form"] = issue.message;
          setErrors(next);
          toast.error("Please fix the highlighted fields.");
          return;
        }
      } catch {}
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Builders"
        title="Submit your agent"
        description="Share your AI agent with the community. Approved submissions get listed in the marketplace."
      />

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/account"><ArrowLeft className="mr-1 h-4 w-4" /> Back to account</Link>
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          <Field label="Agent name *" error={errors.name}>
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={80} required />
          </Field>

          <Field label="Tagline *" hint="One line that explains what it does." error={errors.tagline}>
            <Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} maxLength={140} required />
          </Field>

          <Field label="Description *" hint="What it does, who it's for, what makes it different." error={errors.description}>
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} maxLength={2000} required />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Category *" error={errors.category}>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Capabilities" hint="Comma-separated, up to 12." error={errors.capabilities}>
              <Input value={form.capabilities} onChange={(e) => update("capabilities", e.target.value)} placeholder="e.g. summarize, translate, code-review" />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Website" error={errors.website_url}>
              <Input type="url" value={form.website_url} onChange={(e) => update("website_url", e.target.value)} placeholder="https://" />
            </Field>
            <Field label="Demo URL" error={errors.demo_url}>
              <Input type="url" value={form.demo_url} onChange={(e) => update("demo_url", e.target.value)} placeholder="https://" />
            </Field>
            <Field label="Repo" error={errors.repo_url}>
              <Input type="url" value={form.repo_url} onChange={(e) => update("repo_url", e.target.value)} placeholder="https://" />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Contact email *" error={errors.contact_email}>
              <Input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} maxLength={255} required />
            </Field>
            <Field label="Pricing notes" hint="Free, freemium, $X/mo, etc." error={errors.pricing_notes}>
              <Input value={form.pricing_notes} onChange={(e) => update("pricing_notes", e.target.value)} maxLength={280} />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="text-xs text-muted-foreground">Reviews usually take 2–5 business days.</p>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for review"}
            </Button>
          </div>
        </form>

        <div className="mt-10">
          <h2 className="font-display text-lg font-semibold">Your submissions</h2>
          <div className="mt-4 space-y-3">
            {mine.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {mine.data && mine.data.length === 0 && (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            )}
            {mine.data?.map((s) => (
              <div key={s.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-4">
                <div>
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.category} · submitted {new Date(s.created_at).toLocaleDateString()}
                  </p>
                  {s.review_notes && (
                    <p className="mt-2 text-sm text-muted-foreground">Reviewer note: {s.review_notes}</p>
                  )}
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label, hint, error, children,
}: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: "pending" | "approved" | "rejected" }) {
  if (status === "approved") {
    return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Approved</Badge>;
  }
  if (status === "rejected") {
    return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
  }
  return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
}
