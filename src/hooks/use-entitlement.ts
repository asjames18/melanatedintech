import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMyEntitlements } from "@/lib/payments.functions";
import { FREE_ENVIRONMENT } from "@/lib/fulfillment.functions";
import { getStripeEnvironment, hasPaymentsClientToken } from "@/lib/stripe";

export type EntitlementState = "unknown" | "owned" | "not-owned";

type EntitlementRow = { kind: string; slug: string; environment: string };

function useEntitlementQuery() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUserId(session?.user?.id ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  const listFn = useServerFn(listMyEntitlements);
  const query = useQuery({
    queryKey: ["entitlements", userId],
    queryFn: () => listFn(),
    enabled: !!userId,
    staleTime: 30_000,
  });
  return { query, userId };
}

export function useEntitlements() {
  return useEntitlementQuery().query;
}

/**
 * Ownership with an explicit "unknown" state. Callers that render a locked
 * pitch (price, unlock CTA) must wait for "not-owned" — rendering it while
 * auth or the entitlement query is still resolving flashes the buy state at
 * people who already own the item.
 */
export function useEntitlementState(
  kind: "agent" | "product",
  slug: string,
): EntitlementState {
  const { query, userId } = useEntitlementQuery();
  if (userId === undefined) return "unknown";
  if (userId === null) return "not-owned";
  if (!query.data) return query.isError ? "not-owned" : "unknown";
  return entitlementMatches(query.data as unknown as EntitlementRow[], kind, slug)
    ? "owned"
    : "not-owned";
}

export function useHasEntitlement(kind: "agent" | "product", slug: string) {
  return useEntitlementState(kind, slug) === "owned";
}

function entitlementMatches(rows: EntitlementRow[], kind: string, slug: string) {
  const env = hasPaymentsClientToken() ? safeEnv() : null;
  return rows.some((e) => {
    if (e.kind !== kind || e.slug !== slug) return false;
    // Free claims are not tied to a Stripe mode, so they count in either. Paid
    // entitlements still have to match the build's environment, or a sandbox
    // purchase would unlock live content.
    if (e.environment === FREE_ENVIRONMENT) return true;
    return env ? e.environment === env : true;
  });
}

function safeEnv() {
  try {
    return getStripeEnvironment();
  } catch {
    return null;
  }
}
