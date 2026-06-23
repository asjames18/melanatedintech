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
    return { owned: false, unlockContent: null, downloadUrl: null, assetName: null, itemName: null };
  }

  const table = kind === "agent" ? "agents" : "products";
  const { data: item, error } = await (supabaseAdmin.from(table) as any)
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

export const getProductFulfillment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(({ data, context }): Promise<Fulfillment> =>
    resolveFulfillment("product", data.slug, context.userId),
  );

export const getAgentFulfillment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(({ data, context }): Promise<Fulfillment> =>
    resolveFulfillment("agent", data.slug, context.userId),
  );
