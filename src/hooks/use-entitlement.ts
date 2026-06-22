import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { listMyEntitlements } from "@/lib/payments.functions";
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
  return data.some(
    (e: { kind: string; slug: string; environment: string }) =>
      e.kind === kind && e.slug === slug && (env ? e.environment === env : true),
  );
}

function safeEnv() {
  try {
    return getStripeEnvironment();
  } catch {
    return null;
  }
}
