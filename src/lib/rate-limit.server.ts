// Server-only helpers for throttling the unauthenticated public forms.
// Dynamically import this inside a server-fn handler (never at the top level of a
// *.functions.ts module) so it stays out of the client bundle.
import { getRequest } from "@tanstack/react-start/server";

type ThrottledTable = "contact_messages" | "waitlist_signups" | "service_system_leads";

/**
 * SHA-256 hash of the caller's IP, or null when no IP header is present.
 * We hash rather than store the raw IP for privacy.
 */
export async function getClientIpHash(): Promise<string | null> {
  const headers = getRequest()?.headers;
  if (!headers) return null;

  const ip =
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    null;
  if (!ip) return null;

  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * True when this ip_hash has already inserted >= `max` rows into `table` within
 * the last `windowMinutes`. Fails OPEN (returns false) on any error — including
 * the ip_hash column not existing yet — so legitimate users are never blocked by
 * an infra hiccup or a not-yet-applied migration.
 */
export async function tooManyRecent(
  table: ThrottledTable,
  ipHash: string,
  windowMinutes: number,
  max: number,
): Promise<boolean> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();
    const { count, error } = await supabaseAdmin
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if (error) return false;
    return (count ?? 0) >= max;
  } catch {
    return false;
  }
}
