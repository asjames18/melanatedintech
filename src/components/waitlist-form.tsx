import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { joinWaitlist } from "@/lib/public.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";
import { trackEvent } from "@/lib/analytics";

export function WaitlistForm({
  source = "site",
  interest,
  compact = false,
  submitLabel = "Join waitlist",
  pendingLabel = "Joining…",
}: {
  source?: string;
  interest?: string;
  compact?: boolean;
  /** Override when the form is a subscribe box rather than a launch waitlist. */
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const join = useServerFn(joinWaitlist);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = z.string().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      await join({ data: { email, source, interest, hp: hp || undefined } });
      setDone(true);
      setEmail("");
      trackEvent("waitlist_joined", { source, interest: interest ?? "general" });
      toast.success("You're on the list.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">You&apos;re on the list.</p>
        <p className="mt-1">Check your inbox for the next update from Melanated In Tech.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "flex w-full gap-2" : "flex w-full max-w-md flex-col gap-2 sm:flex-row"}
    >
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
      <Input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={loading}>
        {loading ? pendingLabel : submitLabel}
      </Button>
    </form>
  );
}
