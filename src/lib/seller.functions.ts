import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Seller profile helpers ----------

async function getOrCreateSellerProfile(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: existing } = await supabaseAdmin
    .from("seller_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return existing;

  // Auto-create a seller profile from the user's profile.
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  const displayName = profile?.display_name ?? "Seller";
  const baseSlug =
    displayName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || `seller-${Date.now().toString(36)}`;

  // Ensure unique slug.
  let slug = baseSlug;
  for (let i = 2; i < 20; i++) {
    const { data: clash } = await supabaseAdmin
      .from("seller_profiles")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!clash) break;
    slug = `${baseSlug}-${i}`;
  }

  const { data, error } = await supabaseAdmin
    .from("seller_profiles")
    .insert({
      user_id: userId,
      display_name: displayName,
      slug,
      avatar_url: profile?.avatar_url ?? null,
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ---------- Seller profile (self-management) ----------

export const getSellerProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const profile = await getOrCreateSellerProfile(context.userId);
    return profile;
  });

const sellerProfileSchema = z.object({
  display_name: z.string().trim().min(1).max(80),
  bio: z.string().trim().max(500).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  website_url: z.string().url().nullable().optional(),
});

export const updateSellerProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => sellerProfileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);
    const { error } = await supabaseAdmin
      .from("seller_profiles")
      .update({
        display_name: data.display_name,
        bio: data.bio ?? null,
        avatar_url: data.avatar_url ?? null,
        website_url: data.website_url ?? null,
      })
      .eq("id", profile.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Seller listing queries ----------

const sellerAgentFields =
  "id, slug, name, tagline, description, category, tier, price_cents, capabilities, image_url, active, status, created_at, updated_at";

export const sellerListAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);
    const { data, error } = await supabaseAdmin
      .from("agents")
      .select(sellerAgentFields)
      .eq("seller_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const sellerListServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);
    const { data, error } = await supabaseAdmin
      .from("services")
      .select(
        "id, slug, name, tagline, description, outcomes, starting_price_cents, active, status, created_at, updated_at",
      )
      .eq("seller_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Seller upserts ----------

const tierEnum = z.enum(["free", "premium", "custom"]);
const statusEnum = z.enum(["draft", "scheduled", "published"]);

const sellerAgentSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  tier: tierEnum,
  price_cents: z.number().int().min(0).nullable().optional(),
  capabilities: z.array(z.string().trim().min(1)).default([]),
  model: z.string().trim().min(1).max(80).default("gpt-4o-mini"),
  system_prompt: z.string().max(10000).nullable().optional(),
  max_tokens: z.number().int().min(100).max(128000).default(1000),
  temperature: z.number().min(0).max(2).default(0.7),
  unlock_content: z.string().nullable().optional(),
  status: statusEnum.default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
});

export const sellerUpsertAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => sellerAgentSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);

    const unlock_content = data.unlock_content?.trim() ? data.unlock_content : null;
    const row = {
      ...data,
      unlock_content,
      seller_id: profile.id,
      active: data.status === "published",
    };

    if (!row.id) {
      delete (row as Record<string, unknown>).id;
    }

    const { error } = await supabaseAdmin.from("agents").upsert(row as never, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const sellerServiceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1),
  starting_price_cents: z.number().int().min(0).nullable().optional(),
  outcomes: z.array(z.string().trim().min(1)).default([]),
  status: statusEnum.default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
});

export const sellerUpsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => sellerServiceSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);

    const row = {
      ...data,
      seller_id: profile.id,
      active: data.status === "published",
    };

    if (!row.id) {
      delete (row as Record<string, unknown>).id;
    }

    const { error } = await supabaseAdmin
      .from("services")
      .upsert(row as never, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Seller deletes ----------

const sellerDeleteSchema = z.object({
  table: z.enum(["agents", "products", "services"]),
  id: z.string().uuid(),
});

export const sellerDeleteListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => sellerDeleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);

    const { data: existing } = await supabaseAdmin
      .from(data.table)
      .select("seller_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!existing) throw new Error("Listing not found.");
    if (existing.seller_id !== profile.id) throw new Error("Not your listing.");

    const { error } = await supabaseAdmin.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Seller product CRUD ----------

const sellerProductSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  tier: tierEnum,
  price_cents: z.number().int().min(0).nullable().optional(),
  featured: z.boolean().default(false),
  model: z.string().trim().min(1).max(80).default("gpt-4o-mini"),
  system_prompt: z.string().max(10000).nullable().optional(),
  max_tokens: z.number().int().min(100).max(128000).default(1000),
  temperature: z.number().min(0).max(2).default(0.7),
  unlock_content: z.string().nullable().optional(),
  status: statusEnum.default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
});

export const sellerListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        "id, slug, name, tagline, description, category, tier, price_cents, status, featured, model, system_prompt, max_tokens, temperature, unlock_content, scheduled_at, created_at, updated_at",
      )
      .eq("seller_id", profile.id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data;
  });

export const sellerUpsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => sellerProductSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);
    const id = data.id;
    const isUpdate = !!id;

    if (isUpdate) {
      const { data: existing } = await supabaseAdmin
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
      ? await supabaseAdmin.from("products").update(row).eq("id", id!)
      : await supabaseAdmin.from("products").insert(row);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Seller payout info ----------

export const getSellerPayoutInfo = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const profile = await getOrCreateSellerProfile(context.userId);

    const { data: entitlements, error } = await supabaseAdmin
      .from("user_entitlements")
      .select("commission_cents, seller_paid")
      .eq("seller_id", profile.id);

    if (error) throw new Error(error.message);

    const totalCents = (entitlements ?? []).reduce((sum, e) => sum + (e.commission_cents ?? 0), 0);
    const unpaidCents = (entitlements ?? [])
      .filter((e) => !e.seller_paid)
      .reduce((sum, e) => sum + (e.commission_cents ?? 0), 0);

    return {
      stripe_account_id: profile.stripe_account_id,
      stripe_account_status: profile.stripe_account_status,
      payout_enabled: profile.payout_enabled,
      commission_rate: profile.commission_rate,
      total_earnings_cents: totalCents,
      unpaid_earnings_cents: unpaidCents,
      entitlements_count: entitlements?.length ?? 0,
    };
  });
