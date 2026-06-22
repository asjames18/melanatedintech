import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { submitAgent, listMySubmissions } from "@/lib/submissions.functions";
import { toast } from "sonner";
import { CheckCircle2, Clock, XCircle, ArrowLeft, Save, ExternalLink } from "lucide-react";

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

const DRAFT_KEY = "mit:submit-agent:draft:v1";

type FormState = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  capabilities: string;
  website_url: string;
  demo_url: string;
  repo_url: string;
  contact_email: string;
  pricing_notes: string;
};

const emptyForm: FormState = {
  name: "", tagline: "", description: "",
  category: CATEGORIES[0], capabilities: "",
  website_url: "", demo_url: "", repo_url: "",
  contact_email: "", pricing_notes: "",
};

const urlOk = (v: string) => {
  if (!v) return true;
  try { const u = new URL(v); return u.protocol === "http:" || u.protocol === "https:"; }
  catch { return false; }
};

function validate(form: FormState): Record<string, string> {
  const errors: Record<string, string> = {};
  if (form.name.trim().length < 2) errors.name = "Name is required (min 2 characters).";
  else if (form.name.length > 80) errors.name = "Max 80 characters.";
  if (form.tagline.trim().length < 5) errors.tagline = "Tagline is required (min 5 characters).";
  else if (form.tagline.length > 140) errors.tagline = "Max 140 characters.";
  if (form.description.trim().length < 20) errors.description = "Add at least 20 characters.";
  else if (form.description.length > 2000) errors.description = "Max 2000 characters.";
  if (!form.category) errors.category = "Choose a category.";
  if (!form.contact_email.trim()) errors.contact_email = "Contact email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) errors.contact_email = "Enter a valid email.";
  if (!urlOk(form.website_url)) errors.website_url = "Use a full http(s):// URL.";
  if (!urlOk(form.demo_url)) errors.demo_url = "Use a full http(s):// URL.";
  if (!urlOk(form.repo_url)) errors.repo_url = "Use a full http(s):// URL.";
  if (form.pricing_notes.length > 280) errors.pricing_notes = "Max 280 characters.";
  return errors;
}

function SubmitAgentPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const submit = useServerFn(submitAgent);
  const listMine = useServerFn(listMySubmissions);
  const mine = useQuery({ queryKey: ["my-submissions"], queryFn: () => listMine() });

  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const restoredRef = useRef(false);

  // Restore draft on mount.
  useEffect(() => {
    if (typeof window === "undefined" || restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<FormState>;
      const hasContent = Object.values(parsed).some((v) => typeof v === "string" && v.trim().length > 0);
      if (!hasContent) return;
      setForm({ ...emptyForm, ...parsed });
      toast.message("Draft restored", {
        description: "We brought back what you were working on.",
        action: { label: "Discard", onClick: () => discardDraft() },
      });
    } catch {
      /* ignore */
    }
  }, []);

  // Debounced autosave.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hasContent = Object.values(form).some((v) => v.trim().length > 0);
    const t = setTimeout(() => {
      try {
        if (hasContent) {
          window.localStorage.setItem(DRAFT_KEY, JSON.stringify(form));
          setSavedAt(new Date().toLocaleTimeString());
        }
      } catch { /* ignore */ }
    }, 600);
    return () => clearTimeout(t);
  }, [form]);

  function discardDraft() {
    try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
    setForm(emptyForm);
    setErrors({});
    setSavedAt(null);
    toast.success("Draft discarded.");
  }

  function update<K extends keyof FormState>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const localErrors = validate(form);
    if (Object.keys(localErrors).length) {
      setErrors(localErrors);
      toast.error("Please fix the highlighted fields.");
      const firstKey = Object.keys(localErrors)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`);
      if (el && "scrollIntoView" in el) (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
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
      try { window.localStorage.removeItem(DRAFT_KEY); } catch {}
      setForm(emptyForm);
      setSavedAt(null);
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
        <div className="mb-6 flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/account"><ArrowLeft className="mr-1 h-4 w-4" /> Back to account</Link>
          </Button>
          {savedAt && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Save className="h-3 w-3" /> Draft saved {savedAt}
              <button
                type="button"
                onClick={discardDraft}
                className="ml-2 underline-offset-2 hover:text-foreground hover:underline"
              >
                discard
              </button>
            </span>
          )}
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm">
          <Field label="Agent name *" error={errors.name} field="name">
            <Input value={form.name} onChange={(e) => update("name", e.target.value)} maxLength={80} aria-invalid={!!errors.name} />
          </Field>

          <Field label="Tagline *" hint="One line that explains what it does." error={errors.tagline} field="tagline">
            <Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} maxLength={140} aria-invalid={!!errors.tagline} />
          </Field>

          <Field label="Description *" hint={`${form.description.length} / 2000 characters`} error={errors.description} field="description">
            <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={5} maxLength={2000} aria-invalid={!!errors.description} />
          </Field>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Category *" error={errors.category} field="category">
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Capabilities" hint="Comma-separated, up to 12." error={errors.capabilities} field="capabilities">
              <Input value={form.capabilities} onChange={(e) => update("capabilities", e.target.value)} placeholder="e.g. summarize, translate, code-review" />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Website" error={errors.website_url} field="website_url">
              <Input type="url" value={form.website_url} onChange={(e) => update("website_url", e.target.value)} placeholder="https://" aria-invalid={!!errors.website_url} />
            </Field>
            <Field label="Demo URL" error={errors.demo_url} field="demo_url">
              <Input type="url" value={form.demo_url} onChange={(e) => update("demo_url", e.target.value)} placeholder="https://" aria-invalid={!!errors.demo_url} />
            </Field>
            <Field label="Repo" error={errors.repo_url} field="repo_url">
              <Input type="url" value={form.repo_url} onChange={(e) => update("repo_url", e.target.value)} placeholder="https://" aria-invalid={!!errors.repo_url} />
            </Field>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <Field label="Contact email *" error={errors.contact_email} field="contact_email">
              <Input type="email" value={form.contact_email} onChange={(e) => update("contact_email", e.target.value)} maxLength={255} aria-invalid={!!errors.contact_email} />
            </Field>
            <Field label="Pricing notes" hint="Free, freemium, $X/mo, etc." error={errors.pricing_notes} field="pricing_notes">
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
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Your submissions</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/submissions">View all & edit</Link>
            </Button>
          </div>
          <div className="mt-4 space-y-3">
            {mine.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {mine.data && mine.data.length === 0 && (
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            )}
            {mine.data?.slice(0, 5).map((s) => (
              <div key={s.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-card p-4">
                <div className="min-w-0">
                  <p className="font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {s.category} · submitted {new Date(s.created_at).toLocaleDateString()}
                  </p>
                  {s.review_notes && (
                    <p className="mt-2 text-sm text-muted-foreground">Reviewer note: {s.review_notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={s.status} />
                  {s.status === "approved" && s.published_agent_id && (
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/submissions/$id" params={{ id: s.id }}>
                        <ExternalLink className="mr-1 h-3 w-3" /> View
                      </Link>
                    </Button>
                  )}
                  {s.status !== "approved" && (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/submissions/$id" params={{ id: s.id }}>Edit</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({
  label, hint, error, field, children,
}: { label: string; hint?: string; error?: string; field: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5" data-field={field}>
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
