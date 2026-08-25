import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Download, Gift, Loader2, PackageCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/analytics";
import {
  claimFreePack,
  getAgentFulfillment,
  getProductFulfillment,
} from "@/lib/fulfillment.functions";

function downloadMarkdown(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Public excerpt of a pack — the opening section, rendered for everyone including
 * crawlers. Fades out at the bottom so the cut reads as intentional rather than
 * as a page that failed to load.
 */
export function PackPreview({ md, truncated }: { md: string; truncated?: boolean }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-lg font-semibold">Inside this pack</h2>
      <div className="relative mt-4">
        <Markdown md={md} />
        {truncated ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-background"
          />
        ) : null}
      </div>
      {truncated ? (
        <p className="mt-3 text-sm text-muted-foreground">
          That's the opening. The full pack continues below once it's in your library.
        </p>
      ) : null}
    </section>
  );
}

/**
 * Free pack claim. Every pack in the library is free, but taking one requires an
 * account so the claim produces a named person rather than an anonymous
 * download. Once claimed, PackDelivery below renders the actual content.
 */
export function ProductFreePack({ slug, name }: { slug: string; name?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const claim = useServerFn(claimFreePack);
  const [pending, setPending] = useState(false);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user)).catch(() => setAuthed(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onClaim() {
    setPending(true);
    try {
      const result = await claim({ data: { slug } });
      if (!result.claimed) throw new Error("This pack is not available right now.");
      await qc.invalidateQueries({ queryKey: ["entitlements"] });
      trackEvent("free_pack_claimed", { itemSlug: slug });
      toast.success("Added to your library.");
      router.invalidate();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add that pack.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        <h2 className="font-display text-lg font-semibold">
          {name ? `${name} — free` : "This pack is free"}
        </h2>
      </div>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
        Every pack in the library is free. Sign in and it's yours to read, download, and
        keep — we ask for an account so we know what to build next, not for payment.
      </p>
      <div className="mt-5">
        {authed === false ? (
          <Button asChild>
            <Link to="/auth">Sign in to get this pack</Link>
          </Button>
        ) : (
          <Button onClick={onClaim} disabled={pending || authed === null}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
            {pending ? "Adding…" : "Add to my library"}
          </Button>
        )}
      </div>
    </section>
  );
}

/**
 * Owner-only delivery section. Renders the unlocked pack and download buttons.
 * Only mount this when the viewer already owns the item — the server fn
 * re-checks ownership regardless, but this avoids a wasted request.
 */
export function PackDelivery({ kind, slug }: { kind: "agent" | "product"; slug: string }) {
  const fn = useServerFn(kind === "agent" ? getAgentFulfillment : getProductFulfillment);
  const { data, isLoading } = useQuery({
    queryKey: ["fulfillment", kind, slug],
    queryFn: () => fn({ data: { slug } }),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="mt-10 rounded-2xl border border-border bg-muted/30 p-6 text-sm text-muted-foreground">
        Loading your purchase…
      </div>
    );
  }
  if (!data?.owned) return null;

  return (
    <section className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Your purchase</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.unlockContent && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => downloadMarkdown(`${slug}.md`, data.unlockContent!)}
            >
              <Download className="h-4 w-4" /> Download .md
            </Button>
          )}
          {data.downloadUrl && (
            <Button asChild size="sm">
              <a href={data.downloadUrl} target="_blank" rel="noreferrer">
                <Download className="h-4 w-4" /> Download {data.assetName ?? "files"}
              </a>
            </Button>
          )}
        </div>
      </div>

      {data.unlockContent ? (
        <div className="mt-5 border-t border-border pt-5">
          <Markdown md={data.unlockContent} />
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          Your download is ready above. Thanks for your purchase!
        </p>
      )}
    </section>
  );
}

/** Thin named wrappers so callers read clearly at the call site. */
export function ProductDelivery({ slug }: { slug: string }) {
  return <PackDelivery kind="product" slug={slug} />;
}

export function AgentDelivery({ slug }: { slug: string }) {
  return <PackDelivery kind="agent" slug={slug} />;
}
