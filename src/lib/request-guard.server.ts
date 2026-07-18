// Server-only request guards for public endpoints: in-memory per-IP rate
// limiting and optional caller identification from a Supabase bearer token.
//
// The limiter is per-isolate (Cloudflare Workers), so it is a cost/abuse
// dampener rather than a hard global quota — good enough to stop scripts
// hammering the public AI endpoints from one connection.
import { createClient } from "@supabase/supabase-js";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";

const buckets = new Map<string, number[]>();

/**
 * Sliding-window rate limit. Returns true when the call is allowed.
 * Keys should include the caller identity (ip and/or user id) and the surface.
 */
export function allowRequest(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);

  // Opportunistic cleanup so the map can't grow without bound.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) {
      if (v.every((t) => now - t >= windowMs)) buckets.delete(k);
    }
  }
  return true;
}

/** Best-effort client IP from proxy headers (Cloudflare first). */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Verify a Supabase bearer token from the Authorization header and return the
 * caller's user id, or null when absent/invalid. Never throws — public
 * endpoints treat an invalid token the same as no token.
 */
export async function getCallerUserId(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token || token.split(".").length !== 3) return null;

    const url = getSupabaseUrl();
    const key = getSupabasePublishableKey();
    if (!url || !key) return null;

    const supabase = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    return data.claims.sub;
  } catch {
    return null;
  }
}
