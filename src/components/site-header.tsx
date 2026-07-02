import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Search, UserRound } from "lucide-react";
import { NAV } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Melanated In Tech home">
          <img
            src="/brand/mit-logo-horizontal.png"
            alt="Melanated In Tech"
            className="h-8 w-auto lg:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              activeProps={{ className: "bg-muted text-foreground" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/search"
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Link>
          <Link
            to="/contact"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            Contact
          </Link>
          {signedIn ? (
            <Button asChild size="sm">
              <Link to="/account">Account</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>

        <button
          className="rounded-md p-2 lg:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background shadow-lg lg:hidden">
          <div className="space-y-1 px-4 py-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                activeProps={{ className: "bg-muted text-foreground" }}
              >
                {n.label}
              </Link>
            ))}
            <div className="my-3 h-px bg-border" />
            <Link
              to="/search"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              Search
            </Link>
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Contact
            </Link>
            <Link
              to={signedIn ? "/account" : "/auth"}
              onClick={() => setOpen(false)}
              className="mt-3 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
            >
              <UserRound className="h-4 w-4" />
              {signedIn ? "Account" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
