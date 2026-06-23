import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProductFulfillment = {
  owned: boolean;
  unlockContent: string | null;
  downloadUrl: string | null;
  assetName: string | null;
  productName: string | null;
};

/**
 * Returns a product's deliverable — the unlocked pack content and a short-lived
 * signed download URL — but ONLY to a verified owner. The entitlement check runs
 * server-side against user_entitlements before any content is read, so the pack
 * never reaches a non-buyer. (unlock_content / asset_path are not in the
 * generated Database types yet, hence the casts.)
 */
export const getProductFulfillment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }): Promise<ProductFulfillment> => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: ent } = await supabaseAdmin
      .from("user_entitlements")
      .select("slug")
      .eq("user_id", userId)
      .eq("kind", "product")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!ent) {
      return {
        owned: false,
        unlockContent: null,
        downloadUrl: null,
        assetName: null,
        productName: null,
      };
    }

    const { data: prod, error } = await (supabaseAdmin.from("products") as any)
      .select("name, unlock_content, asset_path, asset_name")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);

    let downloadUrl: string | null = null;
    if (prod?.asset_path) {
      const { data: signed } = await supabaseAdmin.storage
        .from("product-assets")
        .createSignedUrl(prod.asset_path, 3600);
      downloadUrl = signed?.signedUrl ?? null;
    }

    return {
      owned: true,
      unlockContent: prod?.unlock_content ?? null,
      downloadUrl,
      assetName: prod?.asset_name ?? null,
      productName: prod?.name ?? null,
    };
  });
