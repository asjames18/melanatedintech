import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Download, Gift, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { getAgentFulfillment, getProductFulfillment } from "@/lib/fulfillment.functions";

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
 * Free pack — content ships publicly with the product, so it renders inline for
 * everyone (no entitlement). Premium packs go through ProductDelivery instead.
 */
export function ProductFreePack({ slug, content }: { slug: string; content: string }) {
  return (
    <section className="mt-10 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h2 className="font-display text-lg font-semibold">What's inside — free</h2>
        </div>
        <Button variant="outline" size="sm" onClick={() => downloadMarkdown(`${slug}.md`, content)}>
          <Download className="h-4 w-4" /> Download .md
        </Button>
      </div>
      <div className="mt-5 border-t border-border pt-5">
        <Markdown md={content} />
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
