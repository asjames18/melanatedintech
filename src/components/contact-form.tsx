import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitContact } from "@/lib/public.functions";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

export function ContactForm({ defaultTopic = "" }: { defaultTopic?: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    organization: "",
    topic: defaultTopic,
    message: "",
  });
  const [hp, setHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const send = useServerFn(submitContact);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await send({
        data: {
          name: form.name,
          email: form.email,
          organization: form.organization || undefined,
          topic: form.topic || undefined,
          message: form.message,
          hp: hp || undefined,
        },
      });
      setDone(true);
      trackEvent(
        form.topic === "Strategy Sprint application"
          ? "strategy_sprint_application_submitted"
          : "contact_submission_completed",
        { surface: form.topic === "Strategy Sprint application" ? "strategy_sprint" : "contact" },
      );
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
    <form onSubmit={onSubmit} className="space-y-4">
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
        <Label htmlFor="message">How can we help?</Label>
        <Textarea
          id="message"
          required
          minLength={10}
          maxLength={2000}
          rows={6}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
