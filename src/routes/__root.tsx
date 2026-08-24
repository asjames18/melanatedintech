import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useLocation,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import interLatin400Woff2 from "@fontsource/inter/files/inter-latin-400-normal.woff2?url";
import interLatin500Woff2 from "@fontsource/inter/files/inter-latin-500-normal.woff2?url";
import spaceGroteskLatin600Woff2 from "@fontsource/space-grotesk/files/space-grotesk-latin-600-normal.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { SiteLayout } from "@/components/site-layout";
import { organizationLd, websiteLd, ldScript } from "@/lib/seo";
import { Search, ArrowRight } from "lucide-react";

function NotFoundComponent() {
  return (
    <SiteLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">HTTP 404 Error</p>
          <h1 className="mt-2 font-display text-5xl font-extrabold text-foreground sm:text-6xl">
            Page not found
          </h1>
          <p className="mt-4 text-base text-muted-foreground">
            The link you followed may be expired or mistyped. Search our collection of AI tools, guides, and systems below:
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              to="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground shadow-xs transition-all hover:border-primary/50 hover:bg-muted"
            >
              <Search className="h-4 w-4 text-primary" />
              <span>Search AI Tools & Knowledge Base</span>
              <kbd className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-mono">⌘K</kbd>
            </Link>
          </div>

          <div className="mt-10 border-t border-border pt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Popular Destinations</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
              <Link
                to="/systems"
                className="rounded-lg border border-border bg-card px-3.5 py-2 font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                Systems
              </Link>
              <Link
                to="/agents"
                className="rounded-lg border border-border bg-card px-3.5 py-2 font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                Marketplace
              </Link>
              <Link
                to="/knowledge"
                className="rounded-lg border border-border bg-card px-3.5 py-2 font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                Knowledge Hub
              </Link>
              <Link
                to="/tools"
                className="rounded-lg border border-border bg-card px-3.5 py-2 font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                AI Tools
              </Link>
              <Link
                to="/products"
                className="rounded-lg border border-border bg-card px-3.5 py-2 font-medium text-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              reset();
              router.invalidate();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" },
      { name: "theme-color", content: "#0f172a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "mobile-web-app-capable", content: "yes" },
      { title: "Melanated In Tech — AI Education, Agents & Workflows" },
      {
        name: "description",
        content:
          "Practical AI education platform helping beginners, business owners, and developers build, deploy, and benefit from AI agents.",
      },
      { name: "author", content: "Melanated In Tech" },
      { property: "og:title", content: "Melanated In Tech — AI Education, Agents & Workflows" },
      {
        property: "og:description",
        content: "Practical AI education platform helping beginners, business owners, and developers build, deploy, and benefit from AI agents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Melanated In Tech — AI Education, Agents & Workflows" },
      {
        name: "twitter:description",
        content: "Practical AI education platform helping beginners, business owners, and developers build, deploy, and benefit from AI agents.",
      },
      {
        property: "og:image",
        content: "https://melanatedintech.com/og-default.png",
      },
      {
        name: "twitter:image",
        content: "https://melanatedintech.com/og-default.png",
      },
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
      {
        rel: "preload",
        as: "font",
        href: interLatin400Woff2,
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        href: interLatin500Woff2,
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "font",
        href: spaceGroteskLatin600Woff2,
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        as: "image",
        href: "/brand/mit-logo-horizontal-276.webp",
        type: "image/webp",
        fetchPriority: "high",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
    scripts: [ldScript(organizationLd()), ldScript(websiteLd())],
  }),

  shellComponent: RootDocument,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors closeButton position="top-right" />
      <GoogleAnalytics />
    </QueryClientProvider>
  );
}

function GoogleAnalytics() {
  const location = useLocation();

  // Load gtag.js immediately on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const win = window as typeof window & {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
      };
      win.dataLayer = win.dataLayer || [];
      win.gtag = win.gtag || function (...args: unknown[]) {
        try {
          win.dataLayer?.push(args);
        } catch {
          /* ignore */
        }
      };
      win.gtag("js", new Date().toISOString());
      win.gtag("config", "G-5YKK7V75YL", {
        send_page_view: true,
      });

      const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.googletagmanager.com/gtag/js?id=G-5YKK7V75YL";
        script.async = true;
        script.onerror = () => {
          /* script blocked by client/adblocker - ignore silently */
        };
        document.head.appendChild(script);
      }
    } catch {
      /* ignore analytics initialization errors */
    }
  }, []);

  // Track SPA pageview on location path change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const win = window as typeof window & {
        gtag?: (...args: unknown[]) => void;
      };
      if (typeof win.gtag === "function") {
        win.gtag("event", "page_view", {
          page_path: String(location.pathname || "") + String(location.search || ""),
          page_location: String(window.location?.href || ""),
          page_title: String(document.title || ""),
        });
      }
    } catch {
      /* ignore tracking errors */
    }
  }, [location.pathname, location.search]);

  return null;
}
