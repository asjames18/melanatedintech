import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import {
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/integrations/supabase/env";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

const tierEnum = z.enum(["free", "premium", "custom"]);
const statusEnum = z.enum(["draft", "scheduled", "published"]);

const productSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  tier: tierEnum,
  price_cents: z.number().int().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  featured: z.boolean().default(false),
  model: z.string().trim().min(1).max(80).default("gpt-4o-mini"),
  system_prompt: z.string().max(10000).nullable().optional(),
  max_tokens: z.number().int().min(100).max(128000).default(1000),
  temperature: z.number().min(0).max(2).default(0.7),
  unlock_content: z.string().nullable().optional(),
  status: statusEnum.default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
});

function publicClient() {
  return createClient<Database>(getSupabaseUrl()!, getSupabasePublishableKey()!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function supabaseAdmin() {
  return createClient<Database>(getSupabaseUrl()!, getSupabaseServiceRoleKey()!);
}

async function assertAdmin(userId: string) {
  const sb = supabaseAdmin();
  const admin = await sb.rpc("has_role", {
    _role: "admin" as const,
    _user_id: userId,
  });
  if (!admin.data) throw new Error("Forbidden");
}

export type ProductRow = Database["public"]["Tables"]["products"]["Row"];

// ---------- Admin CRUD ----------

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("products")
      .select(
        "id, slug, name, tagline, description, category, tier, price_cents, image_url, status, featured, model, system_prompt, max_tokens, temperature, unlock_content, scheduled_at, asset_path, asset_name, seller_id, active, created_at, updated_at",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const adminGetProduct = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = supabaseAdmin();
    const { data: row, error } = await sb
      .from("products")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Product not found");
    return row;
  });

export const adminUpsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const schema = z.object({
      id: z.string().uuid().optional(),
      ...productSchema.shape,
    });
    return schema.parse(d);
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = supabaseAdmin();
    const id = data.id;
    const isUpdate = !!id;

    const unlock_content = data.unlock_content?.trim() ? data.unlock_content : null;
    const row = {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      description: data.description,
      category: data.category,
      tier: data.tier,
      price_cents: data.price_cents ?? null,
      image_url: data.image_url ?? null,
      featured: data.featured,
      model: data.model,
      system_prompt: data.system_prompt ?? null,
      max_tokens: data.max_tokens,
      temperature: data.temperature,
      unlock_content,
      status: data.status,
      scheduled_at: data.scheduled_at ?? null,
      active: data.status === "published",
    };

    const { error } = isUpdate
      ? await sb.from("products").update(row).eq("id", id!)
      : await sb.from("products").insert(row);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = supabaseAdmin();
    const { error } = await sb.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Seller CRUD ----------

export const sellerListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = supabaseAdmin();
    const { data: profile } = await sb
      .from("seller_profiles")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!profile) return [];

    const { data, error } = await sb
      .from("products")
      .select(
        "id, slug, name, tagline, description, category, tier, price_cents, status, featured, model, system_prompt, max_tokens, temperature, unlock_content, scheduled_at, created_at, updated_at",
      )
      .eq("seller_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const sellerGetProduct = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const sb = supabaseAdmin();
    const { data: profile } = await sb
      .from("seller_profiles")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!profile) throw new Error("No seller profile");

    const { data: row, error } = await sb
      .from("products")
      .select("*")
      .eq("id", data.id)
      .eq("seller_id", profile.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("Product not found");
    return row;
  });

export const sellerUpsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const schema = z.object({
      id: z.string().uuid().optional(),
      ...productSchema.shape,
    });
    return schema.parse(d);
  })
  .handler(async ({ data, context }) => {
    const sb = supabaseAdmin();
    const { data: profile } = await sb
      .from("seller_profiles")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!profile) throw new Error("No seller profile");

    const id = data.id;
    const isUpdate = !!id;

    if (isUpdate) {
      const { data: existing } = await sb
        .from("products")
        .select("seller_id")
        .eq("id", id)
        .maybeSingle();
      if (!existing || existing.seller_id !== profile.id) {
        throw new Error("Not found or not authorized");
      }
    }

    const unlock_content = data.unlock_content?.trim() ? data.unlock_content : null;
    const row = {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      description: data.description,
      category: data.category,
      tier: data.tier,
      price_cents: data.price_cents ?? null,
      image_url: data.image_url ?? null,
      featured: data.featured,
      model: data.model,
      system_prompt: data.system_prompt ?? null,
      max_tokens: data.max_tokens,
      temperature: data.temperature,
      unlock_content,
      status: data.status,
      scheduled_at: data.scheduled_at ?? null,
      active: data.status === "published",
      seller_id: profile.id,
    };

    const { error } = isUpdate
      ? await sb.from("products").update(row).eq("id", id!)
      : await sb.from("products").insert(row);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const sellerDeleteProduct = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const sb = supabaseAdmin();
    const { data: profile } = await sb
      .from("seller_profiles")
      .select("id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!profile) throw new Error("No seller profile");

    const { data: existing } = await sb
      .from("products")
      .select("seller_id")
      .eq("id", data.id)
      .maybeSingle();
    if (!existing || existing.seller_id !== profile.id) {
      throw new Error("Not found or not authorized");
    }

    const { error } = await sb.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
