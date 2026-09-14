import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { submitContact } from "@/lib/public.functions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { funnelAttribution } from "@/components/funnel-attribution";
import { trackEvent } from "@/lib/analytics";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

const PRACTICE_AREAS = [
  "Personal injury",
  "Criminal defense / DUI",
  "Family law",
  "Immigration",
  "Other",
];

const CRMS = ["MyCase", "PracticePanther", "Filevine", "Clio", "None / spreadsheets", "Other"];

const FIRM_SIZES = ["Solo", "2–5 attorneys", "6–10 attorneys", "11+ attorneys"];

type FormState = {
  name: string;
  firm: string;
  email: string;
  phone: string;
  practiceArea: string;
  crm: string;
  firmSize: string;
  consent: boolean;
};

export function LegalIntakeAuditForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    firm: "",
    email: "",
    phone: "",
    practiceArea: "",
    crm: "",
    firmSize: "",
    consent: false,
  });
  const [hp, setHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = useServerFn(submitContact);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const attribution = funnelAttribution();
    const message = [
      `Phone: ${form.phone}`,
      `Practice area: ${form.practiceArea}`,
      `Current CRM: ${form.crm || "Not specified"}`,
      `Firm size: ${form.firmSize}`,
      "",
      "Request: free 7-Day Missed-Case Audit for 24/7 AI client intake.",
    ].join("\n");
    try {
      await send({
        data: {
          name: form.name,
          email: form.email,
          organization: form.firm || undefined,
          topic: "Legal intake audit request",
          message,
          utm_source: attribution.source,
          utm_campaign: attribution.campaign,
          hp: hp || undefined,
        },
      });
      setDone(true);
      trackEvent("legal_intake_audit_requested", {
        practice_area: form.practiceArea,
        firm_size: form.firmSize,
        source: attribution.source,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not send your request. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-display text-2xl font-semibold">Request received.</h3>
        <p className="mt-2 text-muted-foreground">
          We reply within one business day to set up your audit. Talk soon.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-10"
    >
      {/* Honeypot: real users never fill this. */}
      <input
        type="text"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <Label htmlFor="li-name">Your name</Label>
          <Input
            id="li-name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Jane Smith"
            required
            minLength={2}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-1">
          <Label htmlFor="li-firm">Firm name</Label>
          <Input
            id="li-firm"
            value={form.firm}
            onChange={(e) => update("firm", e.target.value)}
            placeholder="Smith & Associates"
            required
            minLength={2}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-1">
          <Label htmlFor="li-email">Work email</Label>
          <Input
            id="li-email"
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="jane@smithlaw.com"
            required
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-1">
          <Label htmlFor="li-phone">Phone</Label>
          <Input
            id="li-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(555) 123-4567"
            required
            minLength={7}
            className="mt-1.5"
          />
        </div>
        <div className="sm:col-span-1">
          <Label htmlFor="li-area">Primary practice area</Label>
          <select
            id="li-area"
            value={form.practiceArea}
            onChange={(e) => update("practiceArea", e.target.value)}
            required
            className={`${selectClass} mt-1.5`}
          >
            <option value="">Select…</option>
            {PRACTICE_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-1">
          <Label htmlFor="li-crm">Current CRM / case management</Label>
          <select
            id="li-crm"
            value={form.crm}
            onChange={(e) => update("crm", e.target.value)}
            className={`${selectClass} mt-1.5`}
          >
            <option value="">Select…</option>
            {CRMS.map((crm) => (
              <option key={crm} value={crm}>
                {crm}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="li-size">Firm size</Label>
          <select
            id="li-size"
            value={form.firmSize}
            onChange={(e) => update("firmSize", e.target.value)}
            required
            className={`${selectClass} mt-1.5`}
          >
            <option value="">Select…</option>
            {FIRM_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3">
        <Checkbox
          id="li-consent"
          checked={form.consent}
          onCheckedChange={(checked) => update("consent", checked === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="li-consent"
          className="text-sm font-normal leading-relaxed text-muted-foreground"
        >
          I agree to be contacted about my audit request. No marketing list, no spam — this request
          is only used to set up the audit.
        </Label>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading || !form.consent}>
        {loading ? "Sending…" : "Request my free 7-Day Missed-Case Audit"}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        We reply within one business day. Your details are only used to set up your audit.
      </p>
    </form>
  );
}
