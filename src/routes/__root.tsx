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
import { organizationLd, websiteLd, ldScript } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
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
    const win = window as typeof window & {
      dataLayer?: unknown[];
      gtag?: (...args: unknown[]) => void;
    };
    win.dataLayer = win.dataLayer || [];
    win.gtag = win.gtag || ((...args: unknown[]) => win.dataLayer?.push(args));
    win.gtag("js", new Date());
    win.gtag("config", "G-5YKK7V75YL", {
      send_page_view: true,
    });

    const existingScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]');
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://www.googletagmanager.com/gtag/js?id=G-5YKK7V75YL";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Track SPA pageview on location path change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const win = window as typeof window & {
      gtag?: (...args: unknown[]) => void;
    };
    if (typeof win.gtag === "function") {
      win.gtag("event", "page_view", {
        page_path: location.pathname + location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [location.pathname, location.search]);

  return null;
}
