import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { Menu, X, Search, UserRound } from "lucide-react";
import { NAV } from "@/lib/site";

const HeaderAuthButton = lazy(() =>
  import("./header-auth-button").then((mod) => ({ default: mod.HeaderAuthButton })),
);
const MobileHeaderAuthLink = lazy(() =>
  import("./header-auth-button").then((mod) => ({ default: mod.MobileHeaderAuthLink })),
);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [loadAuth, setLoadAuth] = useState(false);

  useEffect(() => {
    const load = () => {
      const idle = window.requestIdleCallback ?? ((cb) => window.setTimeout(cb, 1));
      idle(() => setLoadAuth(true), { timeout: 2000 });
    };

    if (document.readyState === "complete") {
      load();
      return;
    }

    window.addEventListener("load", load, { once: true });
    return () => window.removeEventListener("load", load);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Melanated In Tech home">
          <picture>
            <source srcSet="/brand/mit-logo-horizontal-276.webp" type="image/webp" />
            <img
              src="/brand/mit-logo-horizontal.png"
              alt="Melanated In Tech"
              width={176}
              height={36}
              fetchPriority="high"
              decoding="async"
              className="h-8 w-auto lg:h-9"
            />
          </picture>
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
          {loadAuth ? (
            <Suspense fallback={<HeaderAuthFallback />}>
              <HeaderAuthButton />
            </Suspense>
          ) : (
            <HeaderAuthFallback />
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
            {loadAuth ? (
              <Suspense fallback={<MobileHeaderAuthFallback onClick={() => setOpen(false)} />}>
                <MobileHeaderAuthLink onClick={() => setOpen(false)} />
              </Suspense>
            ) : (
              <MobileHeaderAuthFallback onClick={() => setOpen(false)} />
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderAuthFallback() {
  return (
    <Link
      to="/auth"
      className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90"
    >
      Sign in
    </Link>
  );
}

function MobileHeaderAuthFallback({ onClick }: { onClick: () => void }) {
  return (
    <Link
      to="/auth"
      onClick={onClick}
      className="mt-3 flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
    >
      <UserRound className="h-4 w-4" />
      Sign in
    </Link>
  );
}
