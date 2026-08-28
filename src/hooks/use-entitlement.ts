import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMyEntitlements } from "@/lib/payments.functions";
import { FREE_ENVIRONMENT } from "@/lib/fulfillment.functions";
import { getStripeEnvironment, hasPaymentsClientToken } from "@/lib/stripe";

export function useEntitlements() {
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUserId(session?.user?.id ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);
  const listFn = useServerFn(listMyEntitlements);
  return useQuery({
    queryKey: ["entitlements", userId],
    queryFn: () => listFn(),
    enabled: !!userId,
    staleTime: 30_000,
  });
}

export function useHasEntitlement(kind: "agent" | "product", slug: string) {
  const env = hasPaymentsClientToken() ? safeEnv() : null;
  const { data } = useEntitlements();
  if (!data) return false;
  return data.some((e: { kind: string; slug: string; environment: string }) => {
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
