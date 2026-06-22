import { useEffect, useMemo, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { Lock, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { createUnlockCheckout } from "@/lib/payments.functions";
import { getStripe, getStripeEnvironment, hasPaymentsClientToken } from "@/lib/stripe";
import { getPremiumEntry, type PremiumKind } from "@/lib/premium-catalog";
import { useHasEntitlement } from "@/hooks/use-entitlement";

interface Props {
  kind: PremiumKind;
  slug: string;
  itemName: string;
}

export function UnlockButton({ kind, slug, itemName }: Props) {
  const entry = getPremiumEntry(kind, slug);
  const router = useRouter();
  const navigate = useNavigate();
  const owned = useHasEntitlement(kind, slug);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkoutFn = useServerFn(createUnlockCheckout);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s?.user));
    return () => sub.subscription.unsubscribe();
  }, []);

  const options = useMemo(
    () => (clientSecret ? { clientSecret } : null),
    [clientSecret],
  );

  if (!entry) {
    return (
      <Button variant="outline" disabled className="w-full">
        <Lock className="h-4 w-4" /> Contact for pricing
      </Button>
    );
  }

  if (owned) {
    return (
      <Button variant="default" disabled className="w-full">
        <CheckCircle2 className="h-4 w-4" /> Unlocked
      </Button>
    );
  }

  const price = `$${(entry.amountCents / 100).toFixed(0)}`;

  async function start() {
    if (!hasPaymentsClientToken()) {
      toast.error("Payments aren't configured for this build yet.");
      return;
    }
    if (authed === false) {
      navigate({ to: "/auth" });
      return;
    }
    setLoading(true);
    try {
      const returnUrl = `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
      const result = await checkoutFn({
        data: {
          priceId: entry!.priceId,
          kind,
          slug,
          returnUrl,
          environment: getStripeEnvironment(),
        },
      });
      if ("error" in result) throw new Error(result.error);
      if (!result.clientSecret) throw new Error("No client secret returned");
      setClientSecret(result.clientSecret);
      setOpen(true);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not start checkout");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={start} disabled={loading || authed === null} className="w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Unlock for {price}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) {
            setClientSecret(null);
            // Refresh entitlements in case purchase succeeded
            router.invalidate();
          }
        }}
      >
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="border-b border-border px-6 py-4">
            <DialogTitle>Unlock {itemName}</DialogTitle>
            <DialogDescription>Complete payment to get instant access.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[75vh] overflow-y-auto">
            {options && (
              <EmbeddedCheckoutProvider stripe={getStripe()} options={options}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
