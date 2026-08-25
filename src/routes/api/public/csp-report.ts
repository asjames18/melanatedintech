import { createFileRoute } from "@tanstack/react-router";

/**
 * Collector for Content-Security-Policy violation reports.
 *
 * The site sends its policy in Report-Only mode, which is the right place to
 * start — but a report-only policy with nowhere to report neither blocks
 * anything nor tells you what it would have blocked. This endpoint is that
 * destination: run it for a week, read what actually trips, tighten the policy
 * against real data, then switch the header to enforcing.
 *
 * Browsers post here unauthenticated and without cookies, so it is deliberately
 * cheap and unfailing: bounded body, per-IP cap, always 204. A malformed or
 * hostile report is dropped, never surfaced as an error.
 */

// Reports are small; anything larger is not a real report.
const MAX_BODY_BYTES = 16_384;
// Per isolate, per IP. A misbehaving extension can otherwise produce thousands.
const RATE = { max: 20, windowMs: 60_000 };

type NormalizedReport = {
  documentUri?: string;
  directive?: string;
  blockedUri?: string;
  sourceFile?: string;
  line?: number;
};

/**
 * Normalize the two wire formats: `report-uri` posts
 * `{"csp-report": {...}}` with kebab-case keys, `report-to` posts an array of
 * `{type, body}` with camelCase keys.
 */
function normalize(payload: unknown): NormalizedReport[] {
  const out: NormalizedReport[] = [];

  const fromLegacy = (r: Record<string, unknown>): NormalizedReport => ({
    documentUri: str(r["document-uri"]),
    directive: str(r["effective-directive"]) ?? str(r["violated-directive"]),
    blockedUri: str(r["blocked-uri"]),
    sourceFile: str(r["source-file"]),
    line: num(r["line-number"]),
  });

  const fromModern = (b: Record<string, unknown>): NormalizedReport => ({
    documentUri: str(b.documentURL),
    directive: str(b.effectiveDirective),
    blockedUri: str(b.blockedURL),
    sourceFile: str(b.sourceFile),
    line: num(b.lineNumber),
  });

  if (Array.isArray(payload)) {
    for (const entry of payload.slice(0, 20)) {
      if (isRecord(entry) && isRecord(entry.body)) out.push(fromModern(entry.body));
    }
  } else if (isRecord(payload)) {
    const legacy = payload["csp-report"];
    if (isRecord(legacy)) out.push(fromLegacy(legacy));
    else if (isRecord(payload.body)) out.push(fromModern(payload.body));
  }

  return out.filter((r) => r.directive || r.blockedUri);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function str(value: unknown): string | undefined {
  return typeof value === "string" && value ? value.slice(0, 500) : undefined;
}
function num(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export const Route = createFileRoute("/api/public/csp-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // 204 regardless of outcome: a browser has nothing useful to do with an
        // error here, and a failing collector must never look like a site fault.
        const accepted = new Response(null, { status: 204 });

        try {
          const declared = Number(request.headers.get("content-length") ?? 0);
          if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) return accepted;

          const { allowRequest, getClientIp } = await import("@/lib/request-guard.server");
          const ip = getClientIp(request.headers);
          if (!allowRequest(`csp:${ip}`, RATE.max, RATE.windowMs)) return accepted;

          const body = await request.text();
          if (!body || body.length > MAX_BODY_BYTES) return accepted;

          const reports = normalize(JSON.parse(body));
          for (const report of reports) {
            // Structured so the directive can be grouped in Workers logs — that
            // grouping is what tells you which directive to tighten or widen.
            console.warn("[csp-report]", JSON.stringify(report));
          }
        } catch {
          // Malformed JSON, aborted body, anything else — drop it silently.
        }

        return accepted;
      },
    },
  },
});
