import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitDiagnosticIntake } from "@/lib/service-leads.functions";
import { trackEvent } from "@/lib/analytics";

const INDUSTRIES = [
  "HVAC",
  "Plumbing",
  "Electrical",
  "Roofing",
  "Landscaping",
  "Pest control",
  "Pool service",
  "Residential cleaning",
  "Commercial cleaning",
  "Restoration",
  "Remodeling",
  "Painting",
  "Fencing",
  "Beauty & personal care",
  "Other",
];

const VOLUMES = [
  ["under-50", "Under 50 jobs / month"],
  ["50-149", "50–149 jobs / month"],
  ["150-499", "150–499 jobs / month"],
  ["500-plus", "500+ jobs / month"],
  ["unsure", "Not sure"],
] as const;

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

/**
 * Post-payment qualification for the Revenue Leak Diagnostic.
 *
 * Deliberately shorter than ServiceLeadForm: the buyer has already paid, so the
 * sales-qualification fields (budget, urgency, team size) are neither needed nor
 * appropriate. This asks only what is required to run the 45-minute session.
 */
export function DiagnosticIntakeForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    contact_name: "",
    phone: "",
    business_name: "",
    website: "",
    industry: "",
    monthly_volume: "unsure",
    current_tools: "",
    primary_leak: "",
    desired_outcome: "",
  });

  const submit = useServerFn(submitDiagnosticIntake);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await submit({
        data: {
          ...form,
          monthly_volume: form.monthly_volume as "unsure",
          website: form.website || undefined,
          current_tools: form.current_tools || undefined,
        },
      });
      setDone(true);
      onSubmitted?.();
      trackEvent("diagnostic_intake_submitted", {
        industry_category: form.industry,
        monthly_volume: form.monthly_volume,
      });
      toast.success("Got it — we'll have this in front of us before your session.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <div className="flex gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
          <div>
            <h2 className="font-display text-lg font-semibold">Your details are in.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We'll review {form.business_name || "your business"} and the leak you described
              before we meet, so the session starts with findings instead of questions. Book your
              time below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <h2 className="font-display text-lg font-semibold">
          Tell us where to look — before we meet
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Two minutes now means your 45-minute session starts with findings instead of
          background questions. You can book your time first and come back to this.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name" id="contact_name">
          <Input
            id="contact_name"
            required
            value={form.contact_name}
            onChange={(e) => update("contact_name", e.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field label="Phone" id="phone">
          <Input
            id="phone"
            required
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            autoComplete="tel"
          />
        </Field>
        <Field label="Business name" id="business_name">
          <Input
            id="business_name"
            required
            value={form.business_name}
            onChange={(e) => update("business_name", e.target.value)}
            autoComplete="organization"
          />
        </Field>
        <Field label="Website" id="website" hint="Optional">
          <Input
            id="website"
            type="url"
            placeholder="https://"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            autoComplete="url"
          />
        </Field>
        <Field label="Industry" id="industry">
          <select
            id="industry"
            required
            className={selectClass}
            value={form.industry}
            onChange={(e) => update("industry", e.target.value)}
          >
            <option value="">Select one…</option>
            {INDUSTRIES.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Monthly job volume" id="monthly_volume">
          <select
            id="monthly_volume"
            className={selectClass}
            value={form.monthly_volume}
            onChange={(e) => update("monthly_volume", e.target.value)}
          >
            {VOLUMES.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Where do you think revenue is leaking?" id="primary_leak">
        <Input
          id="primary_leak"
          required
          placeholder="Missed calls after hours, estimates that never get followed up…"
          value={form.primary_leak}
          onChange={(e) => update("primary_leak", e.target.value)}
        />
      </Field>

      <Field
        label="What would a good outcome look like?"
        id="desired_outcome"
        hint="At least a sentence"
      >
        <Textarea
          id="desired_outcome"
          required
          rows={3}
          value={form.desired_outcome}
          onChange={(e) => update("desired_outcome", e.target.value)}
        />
      </Field>

      <Field
        label="What are you using now?"
        id="current_tools"
        hint="Optional — CRM, scheduler, phone system"
      >
        <Input
          id="current_tools"
          value={form.current_tools}
          onChange={(e) => update("current_tools", e.target.value)}
        />
      </Field>

      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Saving…" : "Send this ahead"}
      </Button>
    </form>
  );
}

function Field({
  label,
  id,
  hint,
  children,
}: {
  label: string;
  id: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {label}
        {hint ? (
          <span className="ml-2 font-normal text-muted-foreground">({hint})</span>
        ) : null}
      </Label>
      {children}
    </div>
  );
}
