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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Melanated In Tech — AI Education, Agents & Workflows" },
      {
        name: "description",
        content:
          "Practical AI education platform helping beginners, business owners, and developers build, deploy, and benefit from AI agents.",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preload", href: interLatin400Woff2, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", href: interLatin500Woff2, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", href: spaceGroteskLatin600Woff2, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
    ],
    scripts: [ldScript(organizationLd()), ldScript(websiteLd())],
  }),

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

  // 1. Load gtag.js immediately on mount (NO 5-second delay)
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

  // 2. Track SPA pageview on every location path change
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
