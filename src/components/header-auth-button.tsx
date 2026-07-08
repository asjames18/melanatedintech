import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function HeaderAuthButton() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Button asChild size="sm">
      <Link to={signedIn ? "/account" : "/auth"}>{signedIn ? "Account" : "Sign in"}</Link>
    </Button>
  );
}

export function MobileHeaderAuthLink({ onClick }: { onClick: () => void }) {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

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
