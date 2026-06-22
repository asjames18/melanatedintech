import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { useImpression } from "@/hooks/use-impression";
import { trackEvent } from "@/lib/analytics";

export type RecMeta = {
  surface: string;
  itemType: "article" | "agent" | "product";
  itemSlug: string;
  itemCategory: string;
  reason: string;
  position: number;
  personalized: boolean;
  sourceType: "article" | "agent" | "product";
  sourceSlug: string;
  sourceCategory: string;
};

/**
 * Wraps a recommendation card with impression + click analytics and renders
 * the "Because you're…" reason underneath. One place, used by every surface.
 */
export function RecommendationItem({
  meta,
  children,
}: {
  meta: RecMeta;
  children: ReactNode;
}) {
  const ref = useImpression<HTMLDivElement>(
    () => trackEvent("recommendation_impression", meta),
    { key: `${meta.surface}:${meta.itemSlug}:${meta.sourceSlug}` },
  );
  return (
    <div
      ref={ref}
      className="flex flex-col"
      onClickCapture={() => trackEvent("recommendation_click", meta)}
    >
      {children}
      <p className="mt-2 px-1 text-xs text-muted-foreground">
        <Sparkles className="mr-1 inline h-3 w-3 text-accent2" />
        {meta.reason}
      </p>
    </div>
  );
}
