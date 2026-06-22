import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { listMyEntitlements } from "@/lib/payments.functions";
import { getStripeEnvironment, hasPaymentsClientToken } from "@/lib/stripe";

export function useEntitlements() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["entitlements", user?.id],
    queryFn: () => listMyEntitlements(),
    enabled: !!user,
    staleTime: 30_000,
  });
}

export function useHasEntitlement(kind: "agent" | "product", slug: string) {
  const env = hasPaymentsClientToken() ? getStripeEnvironment() : null;
  const { data } = useEntitlements();
  if (!data) return false;
  return data.some(
    (e) => e.kind === kind && e.slug === slug && (env ? e.environment === env : true),
  );
}
