import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X, Sparkles, ArrowRight } from "lucide-react";

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
      ["Nonprofit & Community Organizations", "/work-with-us"],
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        const target = e.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        window.location.assign("/search");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex shrink-0 items-center transition-opacity hover:opacity-90" aria-label="Melanated In Tech home">
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

        {/* Primary Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {groups.map((group) => (
            <div key={group.label} className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group-hover:text-foreground"
                aria-haspopup="true"
              >
                {group.label}
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180" />
              </button>

              <div className="invisible absolute left-0 top-full z-50 min-w-[260px] translate-y-1.5 rounded-2xl border border-border/80 bg-card/98 p-2 opacity-0 shadow-xl backdrop-blur-md transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {group.items.map(([label, to]) => {
                  const isHighlight = to === "/diagnostic";
                  return (
                    <a
                      key={to}
                      href={to}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                        isHighlight
                          ? "bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <span>{label}</span>
                      {isHighlight && (
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          ))}

          {directLinks.map(([label, to]) => (
            <Link
              key={to}
              to={to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Desktop Action Bar */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/search"
            className="flex items-center gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/70 hover:text-foreground"
            aria-label="Search AI Tools and Knowledge Base"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span className="hidden xl:inline">Search AI Tools...</span>
            <kbd className="rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground shadow-2xs">
              ⌘K
            </kbd>
          </Link>

          <Link
            to="/work-with-us"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            <span>Work With Us</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {loadAuth ? (
            <Suspense fallback={<HeaderAuthFallback />}>
              <HeaderAuthButton />
            </Suspense>
          ) : (
            <HeaderAuthFallback />
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="rounded-lg p-2 text-foreground transition-colors hover:bg-muted lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label="Toggle menu"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5.5 w-5.5" /> : <Menu className="h-5.5 w-5.5" />}
        </button>
      </div>

      {/* Mobile Drawer Sheet */}
      {open && (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-border bg-background/98 p-4 shadow-2xl backdrop-blur-lg pb-28 lg:hidden"
        >
          <div className="space-y-5">
            {/* Quick Search */}
            <Link
              to="/search"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-3.5 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-2.5">
                <Search className="h-4 w-4 text-primary" />
                <span>Search AI tools, agents & playbooks...</span>
              </div>
              <kbd className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground">
                ⌘K
              </kbd>
            </Link>

            {/* Nav Groups */}
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.label} className="rounded-2xl border border-border/70 bg-card/60 p-3 shadow-2xs">
                  <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-primary">
                    {group.label}
                  </p>
                  <div className="mt-1 space-y-0.5">
                    {group.items.map(([label, to]) => (
                      <a
                        key={to}
                        href={to}
                        onClick={() => setOpen(false)}
                        className="block rounded-lg px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Links */}
            <div className="rounded-2xl border border-border/70 bg-card/60 p-3 shadow-2xs space-y-0.5">
              {directLinks.map(([label, to]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Mobile Actions */}
            <div className="space-y-2.5 pt-2">
              <Link
                to="/work-with-us"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                <span>Work With Us</span>
                <ArrowRight className="h-4 w-4" />
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
        </div>
      )}
    </header>
  );
}

function HeaderAuthFallback() {
  return (
    <span
      className="inline-flex h-9 w-20 animate-pulse rounded-xl border border-border bg-muted/60"
      role="status"
      aria-label="Checking account status"
    >
      <span className="sr-only">Checking account status</span>
    </span>
  );
}

function MobileHeaderAuthFallback({ onClick: _onClick }: { onClick: () => void }) {
  return (
    <span
      className="flex w-full items-center justify-center rounded-xl border border-border bg-muted/60 px-3 py-2.5 text-sm text-muted-foreground"
      role="status"
    >
      Checking account status
    </span>
  );
}
