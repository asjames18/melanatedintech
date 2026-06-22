import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { joinWaitlist } from "@/lib/public.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";

export function WaitlistForm({
  source = "site",
  interest,
  compact = false,
}: {
  source?: string;
  interest?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
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
      await join({ data: { email, source, interest } });
      setDone(true);
      setEmail("");
      toast.success("You're on the list.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        Thanks — we'll be in touch with what's coming next.
      </p>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={compact ? "flex w-full gap-2" : "flex w-full max-w-md flex-col gap-2 sm:flex-row"}
    >
      <Input
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Joining…" : "Join waitlist"}
      </Button>
    </form>
  );
}
