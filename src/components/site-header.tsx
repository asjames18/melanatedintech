import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronDown, Menu, Search, UserRound, X } from "lucide-react";

const HeaderAuthButton = lazy(() =>
  import("./header-auth-button").then((module) => ({ default: module.HeaderAuthButton })),
);
const MobileHeaderAuthLink = lazy(() =>
  import("./header-auth-button").then((module) => ({ default: module.MobileHeaderAuthLink })),
);
const groups = [
  {
    label: "Solutions",
    items: [
      ["Home & Field Services", "/solutions/home-field-services"],
      ["Project & Estimate Businesses", "/solutions/project-estimate-businesses"],
      ["Recurring Property Services", "/solutions/recurring-property-services"],
      ["Beauty & Personal Care", "/solutions/beauty-personal-care"],
      ["Ministry & Nonprofit", "/services/ministry-ai-implementation"],
    ],
  },
  {
    label: "Systems",
    items: [
      ["All Systems", "/systems"],
      ["Revenue Diagnostic ($297)", "/diagnostic"],
      ["Revenue Recovery", "/systems/revenue-recovery"],
      ["Estimate Recovery", "/systems/estimate-recovery"],
      ["Route & Retention", "/systems/route-retention"],
      ["Client Recovery", "/systems/client-recovery"],
    ],
  },
  {
    label: "Learn",
    items: [
      ["Knowledge Hub", "/knowledge"],
      ["Learning Paths", "/paths"],
      ["AI Tools", "/tools"],
      ["Starter Packs", "/starter-packs"],
    ],
  },
] as const;
const directLinks = [
  ["Work With Us", "/work-with-us"],
  ["Marketplace", "/agents"],
  ["Open Commons", "/open-commons"],
  ["About", "/about"],
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [loadAuth, setLoadAuth] = useState(false);
  useEffect(() => {
    const load = () => {
      const idle = window.requestIdleCallback ?? ((callback) => window.setTimeout(callback, 1));
      idle(() => setLoadAuth(true), { timeout: 2000 });
    };
    if (document.readyState === "complete") load();
    else {
      window.addEventListener("load", load, { once: true });
      return () => window.removeEventListener("load", load);
    }
  }, []);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur supports-[backdrop-filter]:bg-background/80">
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
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary navigation">
          {groups.map((group) => (
            <div key={group.label} className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-haspopup="true"
              >
                {group.label}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 min-w-64 translate-y-1 rounded-xl border border-border bg-card p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {group.items.map(([label, to]) => (
                  <a
                    key={to}
                    href={to}
                    className="block rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {label}
                  </a>
                ))}
              </div>
            </div>
          ))}
          {directLinks.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/search"
            className="flex items-center gap-2 rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/60 hover:text-foreground"
            aria-label="Search AI Tools and Knowledge Base"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xl:inline">Search AI Tools...</span>
            <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground shadow-2xs">
              ⌘K
            </kbd>
          </Link>
          <Link
            to="/work-with-us"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Work With Us
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
          aria-controls="mobile-navigation"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background shadow-lg lg:hidden"
        >
          <nav className="space-y-4 px-4 py-5" aria-label="Mobile navigation">
            {groups.map((group) => (
              <div key={group.label}>
                <p className="px-3 text-xs font-semibold uppercase tracking-wider text-primary">
                  {group.label}
                </p>
                <div className="mt-1">
                  {group.items.map(([label, to]) => (
                    <a
                      key={to}
                      href={to}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
            <div>
              {directLinks.map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
            <Link
              to="/work-with-us"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Work With Us
            </Link>
            <Link
              to="/search"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground"
            >
              <Search className="h-4 w-4" /> Search
            </Link>
            {loadAuth ? (
              <Suspense fallback={<MobileHeaderAuthFallback onClick={() => setOpen(false)} />}>
                <MobileHeaderAuthLink onClick={() => setOpen(false)} />
              </Suspense>
            ) : (
              <MobileHeaderAuthFallback onClick={() => setOpen(false)} />
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
function HeaderAuthFallback() {
  return (
    <Link
      to="/auth"
      className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium"
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
      className="flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2.5 text-sm font-medium"
    >
      <UserRound className="h-4 w-4" /> Sign in
    </Link>
  );
}
