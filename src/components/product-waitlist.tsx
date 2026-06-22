import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { joinProductWaitlist, getProductWaitlistCount } from "@/lib/product-waitlist.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle2, Users } from "lucide-react";
import { toast } from "sonner";

export function ProductWaitlist({ productSlug }: { productSlug: string }) {
  const qc = useQueryClient();
  const join = useServerFn(joinProductWaitlist);
  const getCount = useServerFn(getProductWaitlistCount);
  const count = useQuery({
    queryKey: ["product-waitlist-count", productSlug],
    queryFn: () => getCount({ data: { product_slug: productSlug } }),
  });

  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const m = useMutation({
    mutationFn: (input: { email: string }) =>
      join({ data: { email: input.email, product_slug: productSlug } }),
    onSuccess: () => {
      setDone(true);
      qc.invalidateQueries({ queryKey: ["product-waitlist-count", productSlug] });
      toast.success("You're on the list — we'll be in touch.");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't join."),
  });

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/5 p-5 text-center">
        <CheckCircle2 className="mx-auto h-6 w-6 text-emerald-600" />
        <p className="mt-2 font-display text-base font-semibold">You're on the waitlist</p>
        <p className="mt-1 text-sm text-muted-foreground">We'll email you the moment this product opens up.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <p className="font-display text-base font-semibold">Join the waitlist</p>
        </div>
        {(count.data?.count ?? 0) > 0 && (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" /> {count.data!.count} signed up
          </span>
        )}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Be the first to know when this drops. No spam — just one email per launch.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = email.trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            toast.error("Enter a valid email.");
            return;
          }
          m.mutate({ email: trimmed });
        }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          required
          maxLength={255}
          className="flex-1"
        />
        <Button type="submit" disabled={m.isPending}>
          {m.isPending ? "Adding…" : "Notify me"}
        </Button>
      </form>
    </div>
  );
}
