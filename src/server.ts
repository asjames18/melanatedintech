import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

// Cloudflare runtime global. Declared locally so this file does not need the full
// @cloudflare/workers-types, which conflicts with the DOM lib the app relies on.
declare const HTMLRewriter: {
  new (): {
    on(
      selector: string,
      handlers: { element(element: { prepend(html: string, opts?: { html?: boolean }): void }): void },
    ): { transform(response: Response): Response };
  };
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/**
 * Public configuration the browser needs, read from the Worker's own environment.
 *
 * These are all publishable values — a Supabase project URL, a Supabase
 * publishable key, and a Stripe publishable key — and every one of them is
 * already visible in the client bundle when the build has them. Nothing secret
 * is exposed here; the service-role key and Stripe secret keys are deliberately
 * absent and must never be added.
 */
const PUBLIC_ENV_KEYS = [
  ["VITE_SUPABASE_URL", ["VITE_SUPABASE_URL", "SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]],
  [
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    ["VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  ],
  [
    "VITE_PAYMENTS_CLIENT_TOKEN",
    ["VITE_PAYMENTS_CLIENT_TOKEN", "STRIPE_PUBLISHABLE_KEY"],
  ],
  ["VITE_DIAGNOSTIC_BOOKING_URL", ["VITE_DIAGNOSTIC_BOOKING_URL"]],
] as const;

function collectPublicEnv(): Record<string, string> {
  const env = typeof process !== "undefined" ? process.env : {};
  const out: Record<string, string> = {};
  for (const [target, candidates] of PUBLIC_ENV_KEYS) {
    for (const name of candidates) {
      const value = env[name];
      if (typeof value === "string" && value.trim()) {
        out[target] = value;
        break;
      }
    }
  }
  return out;
}

/**
 * Write the public config into <head> so the client can read it at runtime.
 *
 * Vite inlines `import.meta.env` at BUILD time, so a bundle built without these
 * variables present can never recover them — the browser has no process.env, and
 * every Supabase and Stripe call fails. That made a working deploy depend on
 * whoever ran the build having the right shell environment, and it broke auth and
 * checkout in production when it was missing. The Worker holds these as secrets,
 * so it supplies them per request instead.
 *
 * HTMLRewriter streams, so this does not buffer the SSR response.
 */
function injectPublicEnv(response: Response): Response {
  const publicEnv = collectPublicEnv();
  if (Object.keys(publicEnv).length === 0) return response;

  // JSON.stringify then escape "<" so the payload can never terminate the
  // script element early, whatever a value contains.
  const payload = JSON.stringify(publicEnv).replace(/</g, "\\u003c");

  return new HTMLRewriter()
    .on("head", {
      element(element) {
        element.prepend(`<script>window.__PUBLIC_ENV__=${payload}</script>`, { html: true });
      },
    })
    .transform(response);
}

function withSecurityHeaders(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=(), interest-cohort=()",
  );

  if (new URL(request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }

  const contentType = headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    // Where violations go. Chromium reads Reporting-Endpoints + `report-to`;
    // Firefox and Safari still only honor the deprecated `report-uri`, so both
    // are sent. Without a destination the report-only policy below is inert —
    // it blocks nothing and records nothing.
    const reportPath = "/api/public/csp-report";
    headers.set("Reporting-Endpoints", `csp-endpoint="${new URL(reportPath, request.url).href}"`);

    headers.set(
      "Content-Security-Policy-Report-Only",
      [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.googletagmanager.com https://js.stripe.com https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: blob: https:",
        "font-src 'self' data: https:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://api.stripe.com https://static.cloudflareinsights.com https://openrouter.ai",
        "frame-src https://js.stripe.com https://hooks.stripe.com",
        "form-action 'self' https://checkout.stripe.com",
        `report-uri ${reportPath}`,
        "report-to csp-endpoint",
      ].join("; "),
    );
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      const contentType = normalized.headers.get("content-type") ?? "";
      const withEnv = contentType.includes("text/html")
        ? injectPublicEnv(normalized)
        : normalized;
      return withSecurityHeaders(request, withEnv);
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(request, new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      }));
    }
  },
};
