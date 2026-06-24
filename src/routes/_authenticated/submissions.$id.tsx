import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { getMySubmission, updateMySubmission } from "@/lib/submissions.functions";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Clock, XCircle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/submissions/$id")({
  head: () => ({ meta: [{ title: "Edit submission — Melanated In Tech" }] }),
  component: SubmissionEditor,
});

const CATEGORIES = [
  "Research",
  "Writing",
  "Coding",
  "Design",
  "Marketing",
  "Sales",
  "Operations",
  "Data",
  "Education",
  "Other",
];

type FormState = {
  name: string;
  tagline: string;
  description: string;
  category: string;
  capabilities: string;
  website_url: string;
  demo_url: string;
  repo_url: string;
  image_url: string;
  contact_email: string;
  pricing_notes: string;
};

const urlOk = (v: string) => {
  if (!v) return true;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

function validate(f: FormState): Record<string, string> {
  const e: Record<string, string> = {};
  if (f.name.trim().length < 2) e.name = "Name is required.";
  if (f.tagline.trim().length < 5) e.tagline = "Tagline is required.";
  if (f.description.trim().length < 20) e.description = "Add at least 20 characters.";
  if (!f.contact_email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contact_email))
    e.contact_email = "Valid email required.";
  if (!urlOk(f.website_url)) e.website_url = "Use a full http(s):// URL.";
  if (!urlOk(f.demo_url)) e.demo_url = "Use a full http(s):// URL.";
  if (!urlOk(f.repo_url)) e.repo_url = "Use a full http(s):// URL.";
  if (!urlOk(f.image_url)) e.image_url = "Use a full http(s):// URL.";
  return e;
}

function SubmissionEditor() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fetch = useServerFn(getMySubmission);
  const update = useServerFn(updateMySubmission);
  const sub = useQuery({ queryKey: ["my-submission", id], queryFn: () => fetch({ data: { id } }) });

  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sub.data && !form) {
      setForm({
        name: sub.data.name,
        tagline: sub.data.tagline,
        description: sub.data.description,
        category: sub.data.category,
        capabilities: (sub.data.capabilities ?? []).join(", "),
        website_url: sub.data.website_url ?? "",
        demo_url: sub.data.demo_url ?? "",
        repo_url: sub.data.repo_url ?? "",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        image_url: (sub.data as any).image_url ?? "",
        contact_email: sub.data.contact_email,
        pricing_notes: sub.data.pricing_notes ?? "",
      });
    }
  }, [sub.data, form]);

  if (sub.isLoading) {
    return (
      <SiteLayout>
        <div className="p-12 text-sm text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }
  if (sub.error || !sub.data) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <h1 className="font-display text-3xl font-semibold">Submission not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            It may have been removed, or you may not own it.
          </p>
          <Button asChild className="mt-6">
            <Link to="/submissions">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to submissions
            </Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const s = sub.data;
  const isApproved = s.status === "approved";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setSaving(true);
    try {
      const capabilities = form.capabilities
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 12);
      await update({
        data: {
          id,
          name: form.name,
          tagline: form.tagline,
          description: form.description,
          category: form.category,
          capabilities,
          website_url: form.website_url || undefined,
          demo_url: form.demo_url || undefined,
          repo_url: form.repo_url || undefined,
          image_url: form.image_url || undefined,
          contact_email: form.contact_email,
          pricing_notes: form.pricing_notes || null,
        },
      });
      toast.success("Resubmitted — back in the review queue.");
      qc.invalidateQueries({ queryKey: ["my-submissions"] });
      qc.invalidateQueries({ queryKey: ["my-submission", id] });
      navigate({ to: "/submissions" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Update failed.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Builders"
        title={
          isApproved
            ? "Submission details"
            : s.status === "rejected"
              ? "Edit & resubmit"
              : "Edit submission"
        }
        description={
          isApproved
            ? "This submission has been approved and published. Approved listings can no longer be edited here."
            : s.status === "rejected"
              ? "Address the reviewer's note below and resubmit — it'll go back in the pending queue."
              : "Make changes while we wait. Saving will refresh the review timer."
        }
      />

      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/submissions">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to submissions
            </Link>
          </Button>
          <StatusBadge status={s.status} />
        </div>

        {s.review_notes && (
          <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Reviewer note
            </p>
            <p className="mt-1 text-sm">{s.review_notes}</p>
          </div>
        )}

        {isApproved && s.published_agent_id && (
          <div className="mb-6 rounded-xl border bg-card p-4">
            <p className="text-sm font-medium">Live in the marketplace</p>
            <p className="text-sm text-muted-foreground">Your agent was published when approved.</p>
            <Button asChild className="mt-3" variant="outline" size="sm">
              <Link to="/agents">
                <ExternalLink className="mr-1 h-3 w-3" /> Browse marketplace
              </Link>
            </Button>
          </div>
        )}

        {!isApproved && form && (
          <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-2xl border bg-card p-6">
            <Field label="Agent name *" error={errors.name}>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={80}
              />
            </Field>
            <Field label="Tagline *" error={errors.tagline}>
              <Input
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                maxLength={140}
              />
            </Field>
            <Field
              label="Description *"
              hint={`${form.description.length} / 2000 characters`}
              error={errors.description}
            >
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={5}
                maxLength={2000}
              />
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Category *" error={errors.category}>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Capabilities" hint="Comma-separated, up to 12.">
                <Input
                  value={form.capabilities}
                  onChange={(e) => setForm({ ...form, capabilities: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <Field label="Website" error={errors.website_url}>
                <Input
                  type="url"
                  value={form.website_url}
                  onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                  placeholder="https://"
                />
              </Field>
              <Field label="Demo URL" error={errors.demo_url}>
                <Input
                  type="url"
                  value={form.demo_url}
                  onChange={(e) => setForm({ ...form, demo_url: e.target.value })}
                  placeholder="https://"
                />
              </Field>
              <Field label="Repo" error={errors.repo_url}>
                <Input
                  type="url"
                  value={form.repo_url}
                  onChange={(e) => setForm({ ...form, repo_url: e.target.value })}
                  placeholder="https://"
                />
              </Field>
            </div>
            <Field label="Screenshot / logo URL" error={errors.image_url}>
              <Input
                type="url"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://…/screenshot.png"
              />
              {urlOk(form.image_url) && form.image_url && (
                <img
                  src={form.image_url}
                  alt=""
                  className="mt-2 max-h-32 rounded-lg border border-border object-contain"
                />
              )}
            </Field>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Contact email *" error={errors.contact_email}>
                <Input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  maxLength={255}
                />
              </Field>
              <Field label="Pricing notes">
                <Input
                  value={form.pricing_notes}
                  onChange={(e) => setForm({ ...form, pricing_notes: e.target.value })}
                  maxLength={280}
                />
              </Field>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" disabled={saving}>
                {saving
                  ? "Saving…"
                  : s.status === "rejected"
                    ? "Resubmit for review"
                    : "Save changes"}
              </Button>
            </div>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
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
  if (status === "approved")
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCircle2 className="h-3 w-3" /> Approved
      </Badge>
    );
  if (status === "rejected")
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" /> Rejected
      </Badge>
    );
  return (
    <Badge variant="outline" className="gap-1">
      <Clock className="h-3 w-3" /> Pending
    </Badge>
  );
}
