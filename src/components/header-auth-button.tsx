import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function HeaderAuthButton() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (signedIn === null) return <HeaderAuthLoading />;

  return (
    <Button asChild size="sm">
      <Link to={signedIn ? "/account" : "/auth"}>{signedIn ? "Account" : "Sign in"}</Link>
    </Button>
  );
}

export function MobileHeaderAuthLink({ onClick }: { onClick: () => void }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (signedIn === null) return <MobileHeaderAuthLoading />;

  return (
    <Link
      to={signedIn ? "/account" : "/auth"}
      onClick={onClick}
      className="mt-3 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
    >
      <UserRound className="h-4 w-4" />
      {signedIn ? "Account" : "Sign in"}
    </Link>
  );
}

export function HeaderAuthLoading() {
  return (
    <span
      className="inline-flex h-9 w-20 animate-pulse rounded-md border border-border bg-muted/60"
      role="status"
      aria-label="Checking account status"
    >
      <span className="sr-only">Checking account status</span>
    </span>
  );
}

export function MobileHeaderAuthLoading() {
  return (
    <span
      className="mt-3 flex h-10 items-center justify-center rounded-md border border-border bg-muted/60 text-sm text-muted-foreground"
      role="status"
    >
      Checking account status
    </span>
  );
}
