import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SystemDemo } from "@/components/system-demo";
import { funnelAttribution } from "@/components/funnel-attribution";
import { SERVICE_SYSTEMS, type ServiceSystemSlug } from "@/lib/service-systems";
import { submitServiceLead } from "@/lib/service-leads.functions";
import { trackEvent } from "@/lib/analytics";

const industries = [
  "Landscaping",
  "Residential cleaning",
  "Commercial cleaning",
  "Pest control",
  "Pool service",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Restoration",
  "Roofing",
  "Remodeling",
  "Painting",
  "Fencing",
  "Barbershop",
  "Hair salon",
  "Nail professional",
  "Beauty studio",
  "Other",
];

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

export function ServiceLeadForm({
  initialSystem = "route-retention",
  showDemoOnSuccess = true,
  onSubmitted,
}: {
  initialSystem?: ServiceSystemSlug;
  showDemoOnSuccess?: boolean;
  onSubmitted?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [hp, setHp] = useState("");
  const [form, setForm] = useState({
    contact_name: "",
    email: "",
    phone: "",
    business_name: "",
    website: "",
    industry: "",
    service_model: initialSystem,
    team_size: "2-5",
    locations: "1",
    current_tools: "",
    monthly_volume: "unsure",
    primary_leak: "",
    desired_outcome: "",
    urgency: "within-30-days",
    budget_range: "1500-2499",
    consent: false,
  });
  const submit = useServerFn(submitServiceLead);

  function update(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    const attribution = funnelAttribution();
    try {
      await submit({
        data: {
          ...form,
          service_model: form.service_model as ServiceSystemSlug,
          team_size: form.team_size as "2-5",
          locations: Number(form.locations),
          monthly_volume: form.monthly_volume as "unsure",
          urgency: form.urgency as "within-30-days",
          budget_range: form.budget_range as "1500-2499",
          consent: form.consent as true,
          website: form.website || undefined,
          current_tools: form.current_tools || undefined,
          source: attribution.source,
          campaign: attribution.campaign,
          landing_path: typeof window === "undefined" ? "/get-a-demo" : window.location.pathname,
          hp: hp || undefined,
        },
      });
      setDone(true);
      onSubmitted?.();
      trackEvent("demo_requested", {
        service_model: form.service_model,
        industry_category: form.industry,
        source: attribution.source ?? "direct_or_other",
        campaign: attribution.campaign ?? "none",
      });
      toast.success("Your recovery-plan request is in.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (done)
    return (
      <div className="space-y-7">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div className="flex gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
            <div>
              <h2 className="font-display text-xl font-semibold">
                Your recovery-plan request is in.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                We will review {form.business_name || "your business"}, the revenue leak you
                identified, and your current tools. Expect a fit decision or focused follow-up
                within two business days.
              </p>
              <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                {["Fit review", "Fixed scope", "Deposit only if approved"].map((item) => (
                  <span key={item} className="rounded-lg bg-background px-3 py-2 font-medium">
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Submitting this form does not create a contract or guarantee an implementation or
                revenue outcome.
              </p>
            </div>
          </div>
        </div>
        {showDemoOnSuccess ? (
          <SystemDemo
            initialSystem={form.service_model as ServiceSystemSlug}
            showCta={false}
            businessName={form.business_name}
          />
        ) : null}
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="space-y-7">
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={(event) => setHp(event.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-semibold">You and your business</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Your name" id="contact_name">
            <Input
              id="contact_name"
              required
              maxLength={100}
              autoComplete="name"
              value={form.contact_name}
              onChange={(event) => update("contact_name", event.target.value)}
            />
          </Field>
          <Field label="Work email" id="lead_email">
            <Input
              id="lead_email"
              required
              type="email"
              maxLength={255}
              autoComplete="email"
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </Field>
          <Field label="Phone" id="lead_phone">
            <Input
              id="lead_phone"
              required
              type="tel"
              maxLength={30}
              autoComplete="tel"
              value={form.phone}
              onChange={(event) => update("phone", event.target.value)}
            />
          </Field>
          <Field label="Business name" id="business_name">
            <Input
              id="business_name"
              required
              maxLength={150}
              autoComplete="organization"
              value={form.business_name}
              onChange={(event) => update("business_name", event.target.value)}
            />
          </Field>
          <Field label="Website (optional)" id="website">
            <Input
              id="website"
              type="url"
              maxLength={300}
              placeholder="https://"
              value={form.website}
              onChange={(event) => update("website", event.target.value)}
            />
          </Field>
          <Field label="Industry" id="industry">
            <select
              id="industry"
              required
              className={selectClass}
              value={form.industry}
              onChange={(event) => update("industry", event.target.value)}
            >
              <option value="">Select your industry</option>
              {industries.map((industry) => (
                <option key={industry}>{industry}</option>
              ))}
            </select>
          </Field>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-semibold">Current operation</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="System you want to see" id="service_model">
            <select
              id="service_model"
              className={selectClass}
              value={form.service_model}
              onChange={(event) => update("service_model", event.target.value)}
            >
              {SERVICE_SYSTEMS.map((system) => (
                <option key={system.slug} value={system.slug}>
                  {system.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Team size" id="team_size">
            <select
              id="team_size"
              className={selectClass}
              value={form.team_size}
              onChange={(event) => update("team_size", event.target.value)}
            >
              <option value="2-5">2–5 people</option>
              <option value="6-10">6–10 people</option>
              <option value="11-20">11–20 people</option>
              <option value="outside-range">Outside 2–20</option>
            </select>
          </Field>
          <Field label="Number of locations" id="locations">
            <Input
              id="locations"
              required
              type="number"
              min={1}
              max={100}
              value={form.locations}
              onChange={(event) => update("locations", event.target.value)}
            />
          </Field>
          <Field label="Monthly inquiries or active customers" id="monthly_volume">
            <select
              id="monthly_volume"
              className={selectClass}
              value={form.monthly_volume}
              onChange={(event) => update("monthly_volume", event.target.value)}
            >
              <option value="under-50">Under 50</option>
              <option value="50-149">50–149</option>
              <option value="150-499">150–499</option>
              <option value="500-plus">500+</option>
              <option value="unsure">Not sure</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Current CRM, scheduling, or field-service software (optional)"
              id="current_tools"
            >
              <Input
                id="current_tools"
                maxLength={300}
                placeholder="For example: Jobber, Housecall Pro, Square, Fresha, or spreadsheets"
                value={form.current_tools}
                onChange={(event) => update("current_tools", event.target.value)}
              />
            </Field>
          </div>
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-semibold">The opportunity</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary revenue leak" id="primary_leak">
            <Input
              id="primary_leak"
              required
              minLength={3}
              maxLength={200}
              placeholder="For example: estimates are not followed up"
              value={form.primary_leak}
              onChange={(event) => update("primary_leak", event.target.value)}
            />
          </Field>
          <Field label="Implementation timing" id="urgency">
            <select
              id="urgency"
              className={selectClass}
              value={form.urgency}
              onChange={(event) => update("urgency", event.target.value)}
            >
              <option value="within-30-days">Within 30 days</option>
              <option value="1-3-months">Within 1–3 months</option>
              <option value="researching">Researching</option>
            </select>
          </Field>
          <Field label="Pilot budget" id="budget_range">
            <select
              id="budget_range"
              className={selectClass}
              value={form.budget_range}
              onChange={(event) => update("budget_range", event.target.value)}
            >
              <option value="1500-2499">$1,500–$2,499</option>
              <option value="2500-4999">$2,500–$4,999</option>
              <option value="5000-plus">$5,000+</option>
              <option value="not-sure">Not sure yet</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="What outcome would make this pilot worthwhile?" id="desired_outcome">
              <Textarea
                id="desired_outcome"
                required
                minLength={10}
                maxLength={1000}
                rows={4}
                value={form.desired_outcome}
                onChange={(event) => update("desired_outcome", event.target.value)}
              />
            </Field>
          </div>
        </div>
      </fieldset>

      <label className="flex cursor-pointer gap-3 rounded-2xl border border-border bg-muted/30 p-4 text-sm leading-relaxed">
        <input
          required
          type="checkbox"
          checked={form.consent}
          onChange={(event) => update("consent", event.target.checked)}
          className="mt-1 h-4 w-4 shrink-0 accent-primary"
        />
        <span>
          I agree that Melanated In Tech may contact me about this request by email or phone.
          Consent is not a condition of purchase, and I can ask not to be contacted again.
        </span>
      </label>
      <Button
        type="submit"
        disabled={loading || !form.consent}
        size="lg"
        className="w-full sm:w-auto"
      >
        {loading ? "Submitting…" : "Request my demo"}
      </Button>
      <p className="text-xs leading-relaxed text-muted-foreground">
        We use this information to assess fit and prepare the relevant demonstration. We do not sell
        your contact information. See our privacy policy for details.
      </p>
    </form>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
