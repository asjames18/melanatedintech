import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BUNDLE_WEEKLY_ALLOWANCE } from "@/lib/redeem";

const REDEEM_ERROR_MESSAGES: Record<string, string> = {
  invalid_code: "That code wasn't recognized. Check it and try again.",
  already_redeemed: "That code was already redeemed.",
  already_has_bundle: "This account already redeemed a bundle code.",
};

export const redeemBundleCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ code: z.string().trim().min(4).max(64) }).parse(d))
  .handler(async ({ data, context }) => {
    // Server-only import inside the handler: this module ships to the client
    // bundle, so top-level server imports would break client rendering.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const code = data.code.trim().toUpperCase();

    // Atomic redemption: the redeem_bundle_code RPC locks the code row and
    // claims it + grants all five agent entitlements in a single transaction,
    // so concurrent redeems can't double-grant and one account can't stack
    // bundles. Requires migration 20260929130000_appsum_bundle_atomic_rpcs.
    const { data: raw, error } = await supabaseAdmin.rpc("redeem_bundle_code", {
      p_code: code,
      p_user_id: context.userId,
    });
    if (error) {
      console.error("[redeem] bundle redemption RPC failed:", error.message);
      throw new Error("Could not redeem your code — please try again.");
    }
    const result = (raw ?? {}) as { ok?: boolean; error?: string; agents?: string[] };
    if (!result.ok) {
      throw new Error(
        (result.error && REDEEM_ERROR_MESSAGES[result.error]) ??
          "Could not redeem your code — please try again.",
      );
    }

    return { ok: true, agents: result.agents ?? [] };
  });

const ET_TZ = "America/New_York";

/** America/New_York's offset behind UTC at the given instant, in ms. */
function etOffsetMs(at: Date): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(at)) parts[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return asUtc - at.getTime();
}

/**
 * Monday 00:00 America/New_York as a UTC instant — the same week boundary the
 * reserve_bundle_conversation RPC uses (DST-safe: the offset is read at the
 * boundary itself, and US DST transitions never land on a Monday midnight).
 */
function bundleWeekStart(): Date {
  const now = new Date();
  const wdStr = new Intl.DateTimeFormat("en-US", {
    timeZone: ET_TZ,
    weekday: "short",
  }).format(now);
  const wd = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wdStr);
  const daysBack = (wd + 6) % 7;
  const etToday = new Intl.DateTimeFormat("en-CA", {
    timeZone: ET_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now); // YYYY-MM-DD
  const [y, m, d] = etToday.split("-").map(Number);
  // Date.UTC normalizes day underflow, so read the normalized wall date back.
  const norm = new Date(Date.UTC(y, m - 1, d - daysBack, 0, 0, 0))
    .toISOString()
    .slice(0, 10);
  const [y2, m2, d2] = norm.split("-").map(Number);
  const wallAsUtc = Date.UTC(y2, m2 - 1, d2, 0, 0, 0);
  // Iterate twice so the offset is read at the true instant.
  const t1 = wallAsUtc - etOffsetMs(new Date(wallAsUtc));
  const t2 = wallAsUtc - etOffsetMs(new Date(t1));
  return new Date(t2);
}

/**
 * Bundle status for the signed-in user: whether they redeemed a bundle code
 * and how many of the weekly conversations remain. Counts successful bundle
 * conversations only: free-tier rows and in-flight __reserved__ placeholders
 * are excluded (the reserve RPC still counts placeholders internally so
 * concurrent requests can't overshoot).
 */
export const getBundleStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Server-only import inside the handler: this module ships to the client
    // bundle, so top-level server imports would break client rendering.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: codeRow } = await supabaseAdmin
      .from("redeem_codes")
      .select("code")
      .eq("redeemed_by", context.userId)
      .limit(1)
      .maybeSingle();
    if (!codeRow) {
      return { isRedeemer: false, remaining: 0, allowance: BUNDLE_WEEKLY_ALLOWANCE };
    }
    const { count, error } = await supabaseAdmin
      .from("agent_usage_log")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .not("model", "in", "(openrouter/free,openrouter/openrouter/free,__reserved__)")
      .gte("created_at", bundleWeekStart().toISOString());
    if (error) {
      console.error("[bundle] status count failed:", error.message);
      throw new Error("Could not load bundle status — please try again.");
    }
    const used = count ?? 0;
    return {
      isRedeemer: true,
      remaining: Math.max(0, BUNDLE_WEEKLY_ALLOWANCE - used),
      allowance: BUNDLE_WEEKLY_ALLOWANCE,
    };
  });
