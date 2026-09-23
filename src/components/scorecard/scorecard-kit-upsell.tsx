import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Package } from "lucide-react";
import { SCORECARD_SCORING_V2, type LeakSignal } from "@/lib/scorecard-scoring";
import { trackEvent } from "@/lib/analytics";

interface Props {
  /** Top-priority leak signal from the buyer's scorecard. Null = no card. */
  leakTheme: LeakSignal | null | undefined;
  /** Where the card is rendered, for analytics. */
  surface: "completion" | "return-visit";
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

/**
 * Post-purchase agent upsell for the $1 Workflow Opportunity Scorecard.
 * Shows ONE matched $39–$47 premium agent keyed to the buyer's leak theme —
 * the middle rung of the $1 → agent → $297 Diagnostic → Sprint ladder.
 * On-page only; the fulfillment email stays transactional.
 */
export function ScorecardKitUpsell({ leakTheme, surface }: Props) {
  const shownRef = useRef(false);
  const kit = leakTheme ? SCORECARD_SCORING_V2.leakProductMap[leakTheme] : undefined;

  useEffect(() => {
    if (shownRef.current || !kit || !leakTheme) return;
    shownRef.current = true;
    trackEvent("scorecard_kit_upsell_shown", {
      leak_theme: leakTheme,
      product_slug: kit.slug,
      surface,
    });
  }, [leakTheme, kit, surface]);

  if (!leakTheme || !kit) return null;

  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
      <div className="flex gap-3">
        <Package className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Recommended agent for your workflow
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold">{kit.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{kit.blurb}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              to="/agents/$slug"
              params={{ slug: kit.slug }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              onClick={() =>
                trackEvent("scorecard_kit_upsell_clicked", {
                  leak_theme: leakTheme,
                  product_slug: kit.slug,
                  surface,
                })
              }
            >
              Get the agent — {formatPrice(kit.priceCents)} <ArrowRight className="h-4 w-4" />
            </Link>
            <span className="text-xs text-muted-foreground">One-time purchase · yours to keep</span>
          </div>
        </div>
      </div>
    </div>
  );
}
