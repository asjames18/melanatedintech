import { Link } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState } from "react";
import { ChevronDown, Menu, Search, X, Sparkles, ArrowRight, Zap } from "lucide-react";

const HeaderAuthButton = lazy(() =>
  import("./header-auth-button").then((module) => ({ default: module.HeaderAuthButton })),
);
const MobileHeaderAuthLink = lazy(() =>
  import("./header-auth-button").then((module) => ({ default: module.MobileHeaderAuthLink })),
);

interface NavDropdownItem {
  label: string;
  to: string;
  description?: string;
  badge?: string;
}

interface NavGroup {
  label: string;
  to: string;
  isProminent?: boolean;
  items: NavDropdownItem[];
}

const navGroups: NavGroup[] = [
  {
    label: "Solutions",
    to: "/solutions",
    items: [
      {
        label: "All Solutions (Overview)",
        to: "/solutions",
        description: "Browse curated solution architectures by problem",
      },
      {
        label: "Automate Customer Support",
        to: "/solutions/automate-customer-support",
        description: "24/7 AI tier-1 support, CRM lookup & ticket triage",
      },
      {
        label: "Build an AI Knowledge Base",
        to: "/solutions/build-ai-knowledge-base",
        description: "Private RAG over Notion, Google Docs & PDFs",
      },
      {
        label: "Automate Lead Follow-Up",
        to: "/solutions/automate-lead-follow-up",
        description: "Instant qualification, calendar booking & SMS alerts",
      },
      {
        label: "Document Intake Automation",
        to: "/solutions/automate-document-processing",
        description: "OCR, structured extraction & ERP auto-entry",
      },
      {
        label: "Student Services & Admissions",
        to: "/solutions/automate-student-services",
        description: "24/7 college admissions guidance & SIS lookup",
      },
      {
        label: "IT Help Desk Automation",
        to: "/solutions/automate-it-help-desk",
        description: "Password reset triage, SLA tracking & ticket routing",
      },
      {
        label: "Revenue Recovery Systems",
        to: "/systems/revenue-recovery",
        description: "Automated missed-call & invoice follow-up",
      },
    ],
  },
  {
    label: "AI Tools",
    to: "/ai-tools",
    isProminent: true,
    items: [
      {
        label: "AI Tool Library",
        to: "/ai-tools",
        description: "Vetted database of 40+ production-grade AI tools",
      },
      {
        label: "Find My AI Stack (Builder)",
        to: "/ai-stack-builder",
        description: "Interactive questionnaire for custom architecture",
        badge: "New",
      },
      {
        label: "Tool Comparisons",
        to: "/compare",
        description: "Side-by-side matrices (n8n vs Make, Claude vs GPT)",
      },
      {
        label: "Higher Education AI Tools",
        to: "/ai-tools/higher-education",
        description: "Curated tools with FERPA & academic workflows",
      },
      {
        label: "Tell Us What To Solve",
        to: "/solve",
        description: "AI problem diagnostic & stack recommendation",
      },
      {
        label: "Interactive AI Workbench",
        to: "/tools",
        description: "Prompt pilot, token cost calculators & MCP builders",
      },
    ],
  },
  {
    label: "Industries",
    to: "/industries/higher-education",
    items: [
      {
        label: "Higher Education",
        to: "/industries/higher-education",
        description: "Admissions, advising & campus IT automation",
      },
      {
        label: "Home & Field Services",
        to: "/solutions/home-field-services",
        description: "Dispatch, quote follow-up & urgent intake",
      },
      {
        label: "Project & Estimate Businesses",
        to: "/solutions/project-estimate-businesses",
        description: "Contractors, roofers & design estimate recovery",
      },
      {
        label: "Recurring Property Services",
        to: "/solutions/recurring-property-services",
        description: "Route density & retention for lawn, pool & pest",
      },
      {
        label: "Beauty & Personal Care",
        to: "/solutions/beauty-personal-care",
        description: "Appointment reminders & repeat booking loops",
      },
    ],
  },
  {
    label: "Resources",
    to: "/knowledge",
    items: [
      {
        label: "Knowledge Hub",
        to: "/knowledge",
        description: "Guides, playbooks & technical whitepapers",
      },
      {
        label: "AI Radar & Pulse",
        to: "/radar",
        description: "Weekly intelligence on AI releases & benchmarks",
      },
      {
        label: "Learning Paths",
        to: "/paths",
        description: "Structured roadmaps for business AI adoption",
      },
      {
        label: "Starter Packs",
        to: "/starter-packs",
        description: "Templates, prompts & automation recipes",
      },
      {
        label: "Open Commons",
        to: "/open-commons",
        description: "Community datasets, open blueprints & tools",
      },
    ],
  },
];

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
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link
          to="/"
          className="flex shrink-0 items-center transition-opacity hover:opacity-90 mr-2 xl:mr-4"
          aria-label="Melanated In Tech home"
        >
          <picture>
            <source srcSet="/brand/mit-logo-horizontal-276.webp" type="image/webp" />
            <img
              src="/brand/mit-logo-horizontal.png"
              alt="Melanated In Tech"
              width={160}
              height={32}
              fetchPriority="high"
              decoding="async"
              className="h-7 w-auto lg:h-8"
            />
          </picture>
        </Link>

        {/* Primary Desktop Navigation: Home | Solutions | AI Tools | Industries | Case Studies | Resources | About | Contact */}
        <nav className="hidden items-center gap-0.5 xl:gap-1.5 lg:flex" aria-label="Primary navigation">
          {/* Home */}
          <Link
            to="/"
            className="whitespace-nowrap shrink-0 rounded-lg px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Home
          </Link>

          {/* Solutions (Dropdown with dedicated landing page) */}
          <div className="group relative">
            <Link
              to="/solutions"
              className="whitespace-nowrap shrink-0 flex items-center gap-1 rounded-lg px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group-hover:text-foreground"
            >
              <span>Solutions</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
            </Link>

            <div className="invisible absolute left-0 top-full z-50 min-w-[300px] pt-1.5 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 before:absolute before:-top-3 before:left-0 before:h-3 before:w-full before:content-['']">
              <div className="rounded-2xl border border-border/80 bg-card/98 p-2 backdrop-blur-md">
                {navGroups[0].items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex flex-col rounded-xl px-3 py-2 text-left transition-all hover:bg-muted"
                  >
                    <span className="text-xs xl:text-sm font-semibold text-foreground">{item.label}</span>
                    {item.description && (
                      <span className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* AI Tools (Prominent link with dedicated landing page) */}
          <div className="group relative">
            <Link
              to="/ai-tools"
              className="whitespace-nowrap shrink-0 relative flex items-center gap-1 rounded-lg px-2 xl:px-3 py-2 text-xs xl:text-sm font-semibold text-foreground transition-all hover:bg-primary/10 hover:text-primary group-hover:text-primary"
            >
              <Zap className="h-3.5 w-3.5 text-emerald-500 animate-pulse shrink-0" />
              <span>AI Tools</span>
              <span className="ml-0.5 rounded-full bg-primary/15 px-1.5 py-0.2 text-[9px] font-bold text-primary">
                New
              </span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180 shrink-0" />
            </Link>

            <div className="invisible absolute left-0 top-full z-50 min-w-[320px] pt-1.5 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 before:absolute before:-top-3 before:left-0 before:h-3 before:w-full before:content-['']">
              <div className="rounded-2xl border border-border/80 bg-card/98 p-2 backdrop-blur-md">
                {navGroups[1].items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-left transition-all hover:bg-muted"
                  >
                    <div className="flex flex-col">
                      <span className="text-xs xl:text-sm font-semibold text-foreground">{item.label}</span>
                      {item.description && (
                        <span className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</span>
                      )}
                    </div>
                    {item.badge && (
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Industries (Dropdown) */}
          <div className="group relative">
            <Link
              to="/industries/higher-education"
              className="whitespace-nowrap shrink-0 flex items-center gap-1 rounded-lg px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group-hover:text-foreground"
            >
              <span>Industries</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
            </Link>

            <div className="invisible absolute left-0 top-full z-50 min-w-[280px] pt-1.5 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 before:absolute before:-top-3 before:left-0 before:h-3 before:w-full before:content-['']">
              <div className="rounded-2xl border border-border/80 bg-card/98 p-2 backdrop-blur-md">
                {navGroups[2].items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex flex-col rounded-xl px-3 py-2 text-left transition-all hover:bg-muted"
                  >
                    <span className="text-xs xl:text-sm font-semibold text-foreground">{item.label}</span>
                    {item.description && (
                      <span className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Case Studies */}
          <Link
            to="/proof"
            className="whitespace-nowrap shrink-0 rounded-lg px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Case Studies
          </Link>

          {/* Resources (Dropdown) */}
          <div className="group relative">
            <Link
              to="/knowledge"
              className="whitespace-nowrap shrink-0 flex items-center gap-1 rounded-lg px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground group-hover:text-foreground"
            >
              <span>Resources</span>
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
            </Link>

            <div className="invisible absolute left-0 top-full z-50 min-w-[260px] pt-1.5 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 before:absolute before:-top-3 before:left-0 before:h-3 before:w-full before:content-['']">
              <div className="rounded-2xl border border-border/80 bg-card/98 p-2 backdrop-blur-md">
                {navGroups[3].items.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex flex-col rounded-xl px-3 py-2 text-left transition-all hover:bg-muted"
                  >
                    <span className="text-xs xl:text-sm font-semibold text-foreground">{item.label}</span>
                    {item.description && (
                      <span className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* About */}
          <Link
            to="/about"
            className="whitespace-nowrap shrink-0 rounded-lg px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            About
          </Link>

          {/* Contact */}
          <Link
            to="/contact"
            className="whitespace-nowrap shrink-0 rounded-lg px-2 xl:px-3 py-2 text-xs xl:text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Contact
          </Link>
        </nav>

        {/* Right Desktop Action Bar */}
        <div className="hidden items-center gap-2 xl:gap-3 lg:flex shrink-0">
          <Link
            to="/search"
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-muted/70 hover:text-foreground"
            aria-label="Search AI Tools and Knowledge Base"
          >
            <Search className="h-3.5 w-3.5 text-primary" />
            <span className="hidden 2xl:inline">Search...</span>
            <kbd className="rounded-md border border-border/80 bg-background px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted-foreground shadow-2xs">
              ⌘K
            </kbd>
          </Link>

          <Link
            to="/solve"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs xl:text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98] whitespace-nowrap shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span className="hidden xl:inline">Tell Us Your Problem</span>
            <span className="xl:hidden">Solve Problem</span>
            <ArrowRight className="h-3.5 w-3.5 hidden xl:inline" />
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
          <div className="space-y-4">
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

            {/* Prominent Featured AI Tools Card */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-500 animate-pulse" />
                  <span className="font-bold text-sm text-foreground">AI Tool Library</span>
                </div>
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                  New
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Explore curated AI tools, comparison matrices, and find your custom stack.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/ai-tools"
                  onClick={() => setOpen(false)}
                  className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-2xs"
                >
                  Browse Tools
                </Link>
                <Link
                  to="/ai-stack-builder"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Stack Builder
                </Link>
                <Link
                  to="/compare"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  Comparisons
                </Link>
              </div>
            </div>

            {/* Quick Link to Home */}
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl border border-border/70 bg-card/60 px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <span>Home</span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>

            {/* Nav Groups */}
            <div className="space-y-3">
              {navGroups.map((group) => (
                <div
                  key={group.label}
                  className="rounded-2xl border border-border/70 bg-card/60 p-3 shadow-2xs"
                >
                  <div className="flex items-center justify-between px-2 pb-1.5 border-b border-border/40">
                    <Link
                      to={group.to}
                      onClick={() => setOpen(false)}
                      className="text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                    >
                      {group.label} →
                    </Link>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    {group.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-bold text-emerald-500">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Links: Case Studies, About, Contact */}
            <div className="rounded-2xl border border-border/70 bg-card/60 p-3 shadow-2xs space-y-1">
              <Link
                to="/proof"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span>Case Studies</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                to="/about"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span>About</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link
                to="/contact"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <span>Contact</span>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="space-y-2.5 pt-2">
              <Link
                to="/solve"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4 text-emerald-300" />
                <span>Tell Us Your Problem</span>
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
