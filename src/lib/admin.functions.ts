import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required.");
}

// ---------- Bootstrap ----------

export const checkAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: me }, { count }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("role").eq("user_id", context.userId).eq("role", "admin").maybeSingle(),
      supabaseAdmin.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "admin"),
    ]);
    return { isAdmin: !!me, adminCount: count ?? 0 };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if ((count ?? 0) > 0) throw new Error("An admin already exists.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Lists ----------

export const adminListAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("agents").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListArticles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("articles").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("services").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListWaitlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("waitlist_signups").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("contact_messages").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

// ---------- Upserts ----------

const tierEnum = z.enum(["free", "premium", "custom"]);

const agentSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  tier: tierEnum,
  capabilities: z.array(z.string().trim().min(1)).default([]),
  price_cents: z.number().int().nullable().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

export const adminUpsertAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => agentSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("agents").upsert(data, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const articleSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(160),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(400),
  body: z.string().trim().min(1),
  category: z.string().trim().min(1).max(80),
  read_minutes: z.number().int().min(1).max(120).default(5),
  published: z.boolean().default(true),
});

export const adminUpsertArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => articleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("articles").upsert(data, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1),
  outcomes: z.array(z.string().trim().min(1)).default([]),
  starting_price_cents: z.number().int().nullable().optional(),
  active: z.boolean().default(true),
});

export const adminUpsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => serviceSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("services").upsert(data, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Deletes ----------

const deleteSchema = z.object({
  table: z.enum(["agents", "articles", "services"]),
  id: z.string().uuid(),
});

export const adminDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => deleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
