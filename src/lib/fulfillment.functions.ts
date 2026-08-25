import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Fulfillment = {
  owned: boolean;
  unlockContent: string | null;
  downloadUrl: string | null;
  assetName: string | null;
  itemName: string | null;
};

/** Back-compat alias — the shape is identical for products and agents. */
export type ProductFulfillment = Fulfillment;

/**
 * Resolve a paid item's deliverable — the unlocked pack content and a short-lived
 * signed download URL — but ONLY for a verified owner. The entitlement check runs
 * server-side against user_entitlements before any content is read, so the pack
 * never reaches a non-buyer. Shared by both the product and agent fulfillment fns
 * so the gating + signing logic can't drift. (unlock_content / asset_path are not
 * in the generated Database types yet, hence the casts.)
 */
async function resolveFulfillment(
  kind: "agent" | "product",
  slug: string,
  userId: string,
): Promise<Fulfillment> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: ent } = await supabaseAdmin
    .from("user_entitlements")
    .select("slug")
    .eq("user_id", userId)
    .eq("kind", kind)
    .eq("slug", slug)
    .maybeSingle();

  if (!ent) {
    return {
      owned: false,
      unlockContent: null,
      downloadUrl: null,
      assetName: null,
      itemName: null,
    };
  }

  const { data: item, error } =
    kind === "agent"
      ? await supabaseAdmin
          .from("agents")
          .select("name, unlock_content, asset_path, asset_name")
          .eq("slug", slug)
          .maybeSingle()
      : await supabaseAdmin
          .from("products")
          .select("name, unlock_content, asset_path, asset_name")
          .eq("slug", slug)
          .maybeSingle();
  if (error) throw new Error(error.message);

  let downloadUrl: string | null = null;
  if (item?.asset_path) {
    // Agent and product pack files share the private product-assets bucket.
    const { data: signed } = await supabaseAdmin.storage
      .from("product-assets")
      .createSignedUrl(item.asset_path, 3600);
    downloadUrl = signed?.signedUrl ?? null;
  }

  return {
    owned: true,
    unlockContent: item?.unlock_content ?? null,
    downloadUrl,
    assetName: item?.asset_name ?? null,
    itemName: item?.name ?? null,
  };
}

/**
 * Environment recorded on a free claim.
 *
 * Paid entitlements are tagged "sandbox" or "live" so a test purchase cannot
 * grant real access. A free claim has no such split, and tagging it with the
 * build's Stripe mode would make the same pack look unclaimed after switching
 * modes. The unique key is (user_id, kind, slug, environment), so a distinct
 * value here also means a free claim can never collide with a real purchase.
 */
export const FREE_ENVIRONMENT = "free";

/**
 * Claim a free pack. This is the library's front door: every product pack is
 * free, but taking one requires an account, so each claim produces a named
 * person who told us which problem they have by which pack they took.
 *
 * Idempotent — re-claiming is a no-op upsert, so the button is safe to
 * double-click and safe to hit again from another device.
 */
export const claimFreePack = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ slug: z.string().min(1).max(160) }).parse(d))
  .handler(async ({ data, context }): Promise<{ claimed: boolean; reason?: string }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Never trust the client for what is free: re-resolve the product and confirm
    // it is both publicly visible and actually free before granting anything.
    const now = new Date().toISOString();
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .select("slug, tier")
      .eq("slug", data.slug)
      .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!product) return { claimed: false, reason: "not-found" };
    if (product.tier !== "free") return { claimed: false, reason: "not-free" };

    const { error: upsertError } = await supabaseAdmin.from("user_entitlements").upsert(
      {
        user_id: context.userId,
        kind: "product",
        slug: product.slug,
        price_id: "free",
        stripe_session_id: null,
        environment: FREE_ENVIRONMENT,
        granted_at: now,
      } as never,
      { onConflict: "user_id,kind,slug,environment" },
    );
    if (upsertError) {
      console.error("[claim-free-pack] upsert failed", upsertError);
      throw new Error("We could not add that pack to your library. Please try again.");
    }

    return { claimed: true };
  });

export const getProductFulfillment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(
    ({ data, context }): Promise<Fulfillment> =>
      resolveFulfillment("product", data.slug, context.userId),
  );

export const getAgentFulfillment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(
    ({ data, context }): Promise<Fulfillment> =>
      resolveFulfillment("agent", data.slug, context.userId),
  );
