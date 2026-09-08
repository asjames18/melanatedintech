import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { classifyServiceInquiry, submitContact } from "@/lib/public.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

type CampaignAttribution = {
  source?: string;
  medium?: string;
  campaign?: string;
};

export function ContactForm({
  defaultTopic = "",
  campaign,
}: {
  defaultTopic?: string;
  campaign?: CampaignAttribution;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    topic: defaultTopic,
    message: "",
    systems: "",
    volume: "",
    timeline: "",
    budget: "",
    sensitivity: "",
  });
  const [hp, setHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const send = useServerFn(submitContact);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function markServiceInquiryStarted() {
    if (started) return;
    const inquiryType = classifyServiceInquiry(defaultTopic);
    if (inquiryType === "general") return;

    setStarted(true);
    trackEvent("service_inquiry_started", {
      inquiry_type: inquiryType,
      surface: "contact",
      source: campaign?.source ?? "direct_or_other",
      campaign: campaign?.campaign,
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const qualifiedMessage = [
        form.message.trim(),
        "",
        "--- Project context ---",
        `Systems involved: ${form.systems.trim() || "Not provided"}`,
        `Volume or time impact: ${form.volume.trim() || "Not provided"}`,
        `Desired timing: ${form.timeline || "Not provided"}`,
        `Planning budget: ${form.budget || "Not provided"}`,
        `Data sensitivity: ${form.sensitivity || "Not provided"}`,
      ].join("\n");
      const result = await send({
        data: {
          name: form.name,
          email: form.email,
          organization: form.organization || undefined,
          topic: form.topic || undefined,
          message: qualifiedMessage,
          utm_source: campaign?.source,
          utm_medium: campaign?.medium,
          utm_campaign: campaign?.campaign,
          hp: hp || undefined,
        },
      });
      setDone(true);
      if (form.topic === "Strategy Sprint application") {
        trackEvent("strategy_sprint_application_submitted", { surface: "strategy_sprint" });
      } else {
        trackEvent("contact_submission_completed", { surface: "contact" });
        if (result.inquiryType !== "general") {
          trackEvent("service_inquiry_submitted", {
            inquiry_type: result.inquiryType,
            surface: "contact",
          });
        }
      }
      toast.success("Message sent — we'll be in touch.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-sm text-muted-foreground">
        <p className="font-display text-lg font-semibold text-foreground">Message received.</p>
        <p className="mt-1">
          {form.topic === "Strategy Sprint application"
            ? "We read every application and will reply within two business days."
            : "We read every message and will reply within two business days."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} onFocus={markServiceInquiryStarted} className="space-y-4">
      {/* Honeypot — hidden from real users; bots fill it and get silently dropped. */}
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            required
            type="email"
            maxLength={255}
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="organization">Organization</Label>
          <Input
            id="organization"
            maxLength={120}
            value={form.organization}
            onChange={(e) => update("organization", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="topic">Topic</Label>
          <Input
            id="topic"
            maxLength={80}
            placeholder="e.g. Custom agent build"
            value={form.topic}
            onChange={(e) => update("topic", e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="message">What are you trying to solve?</Label>
        <Textarea
          id="message"
          required
          minLength={10}
          maxLength={1200}
          rows={6}
          placeholder="Describe the workflow, where it slows down or breaks, who is affected, and what a useful result would look like."
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="systems">Which systems or tools are involved?</Label>
          <Input
            id="systems"
            maxLength={220}
            placeholder="e.g. Microsoft 365, Salesforce, Banner, shared inboxes, PDFs"
            value={form.systems}
            onChange={(e) => update("systems", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="volume">How much work does this create?</Label>
          <Input
            id="volume"
            maxLength={180}
            placeholder="e.g. 300 requests/month or 20 staff hours/week"
            value={form.volume}
            onChange={(e) => update("volume", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timeline">Desired timing</Label>
          <select
            id="timeline"
            value={form.timeline}
            onChange={(e) => update("timeline", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Select a timeframe</option>
            <option>Within 30 days</option>
            <option>Within 60–90 days</option>
            <option>This quarter</option>
            <option>Exploring for later</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="budget">Planning budget</Label>
          <select
            id="budget"
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Select a range</option>
            <option>Under $7,500</option>
            <option>$7,500–$20,000</option>
            <option>$20,000–$50,000</option>
            <option>$50,000–$100,000</option>
            <option>$100,000+</option>
            <option>Not established yet</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sensitivity">Data sensitivity</Label>
          <select
            id="sensitivity"
            value={form.sensitivity}
            onChange={(e) => update("sensitivity", e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <option value="">Select one</option>
            <option>Public or low-sensitivity information</option>
            <option>Internal business information</option>
            <option>Personal, student, health, or financial information</option>
            <option>Not sure</option>
          </select>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Please do not include passwords, access keys, student records, health information, or other
        sensitive data in this form.
      </p>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Sending…" : "Send project details"}
      </Button>
    </form>
  );
}
