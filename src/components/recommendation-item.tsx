import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
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
 * Returns the listing path for an item type. Used so a reason chip can deep-link
 * the user into the matching listing pre-filtered by category.
 */
function listingPathFor(itemType: RecMeta["itemType"]): "/agents" | "/knowledge" | "/products" {
  if (itemType === "agent") return "/agents";
  if (itemType === "product") return "/products";
  return "/knowledge";
}

/**
 * Wraps a recommendation card with impression + click analytics and renders
 * the "Because you're…" reason underneath. The reason is a Link that filters
 * the matching listing by the item's category.
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
  const matched = meta.sourceCategory && meta.itemCategory === meta.sourceCategory
    ? meta.sourceCategory
    : meta.itemCategory;
  const path = listingPathFor(meta.itemType);
  return (
    <div
      ref={ref}
      className="flex flex-col"
      onClickCapture={(e) => {
        // Only count card clicks, not reason-chip clicks (chip stops propagation).
        if ((e.target as HTMLElement).closest("[data-rec-reason]")) return;
        trackEvent("recommendation_click", meta);
      }}
    >
      {children}
      <Link
        to={path}
        search={{ page: 1, category: matched ?? "All" } as never}
        data-rec-reason
        onClick={(e) => {
          e.stopPropagation();
          trackEvent("recommendation_reason_click", { ...meta, matchedCategory: matched });
        }}
        className="group mt-2 inline-flex items-center px-1 text-left text-xs text-muted-foreground hover:text-foreground"
        title={`Browse more ${matched}`}
      >
        <Sparkles className="mr-1 inline h-3 w-3 text-accent2" />
        <span className="underline-offset-2 group-hover:underline">{meta.reason}</span>
      </Link>
    </div>
  );
}
