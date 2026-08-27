import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getPremiumEntry, type PremiumKind } from "@/lib/premium-catalog";

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
      supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId)
        .eq("role", "admin")
        .maybeSingle(),
      supabaseAdmin
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin"),
    ]);
    return { isAdmin: !!me, adminCount: count ?? 0 };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Defense-in-depth: even with zero admins (e.g. after a bad migration or
    // table wipe), bootstrap only works when explicitly re-enabled via env —
    // otherwise the first stranger to sign in could claim the whole site.
    if (process.env.ALLOW_ADMIN_BOOTSTRAP !== "true") {
      throw new Error(
        "Admin bootstrap is disabled. Set ALLOW_ADMIN_BOOTSTRAP=true in the server environment to claim the first admin.",
      );
    }
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
    const { data, error } = await supabaseAdmin
      .from("agents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListArticles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("articles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("services")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListWaitlist = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("waitlist_signups")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminListMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });


type AdminPurchaseItem = {
  id: string;
  user_id: string;
  buyer_name: string | null;
  kind: string;
  slug: string;
  item_name: string;
  amount_cents: number | null;
  seller_id: string | null;
  seller_name: string | null;
  seller_slug: string | null;
  price_id: string | null;
  stripe_session_id: string | null;
  environment: string;
  granted_at: string;
  created_at: string;
};

export const adminListPurchases = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminPurchaseItem[]> => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data, error } = await supabaseAdmin
      .from("user_entitlements")
      .select(
        "id,user_id,kind,slug,price_id,stripe_session_id,environment,granted_at,created_at,seller_id",
      )
      .order("granted_at", { ascending: false })
      .limit(250);
    if (error) throw new Error(error.message);

    const rows = data ?? [];
    const uniq = <T>(items: (T | null | undefined)[]): T[] =>
      Array.from(new Set(items.filter((x): x is T => x != null)));
    const buyerIds = uniq(rows.map((r) => r.user_id));
    const sellerIds = uniq(rows.map((r) => r.seller_id));
    const agentSlugs = uniq(rows.filter((r) => r.kind === "agent").map((r) => r.slug));
    const productSlugs = uniq(rows.filter((r) => r.kind === "product").map((r) => r.slug));

    const [profilesRes, sellersRes, agentsRes, productsRes] = await Promise.all([
      buyerIds.length
        ? supabaseAdmin.from("profiles").select("id,display_name").in("id", buyerIds)
        : Promise.resolve({ data: [], error: null }),
      sellerIds.length
        ? supabaseAdmin
            .from("seller_profiles")
            .select("id,display_name,slug")
            .in("id", sellerIds)
        : Promise.resolve({ data: [], error: null }),
      agentSlugs.length
        ? supabaseAdmin.from("agents").select("slug,name,price_cents").in("slug", agentSlugs)
        : Promise.resolve({ data: [], error: null }),
      productSlugs.length
        ? supabaseAdmin.from("products").select("slug,name,price_cents").in("slug", productSlugs)
        : Promise.resolve({ data: [], error: null }),
    ]);

    for (const res of [profilesRes, sellersRes, agentsRes, productsRes]) {
      if (res.error) throw new Error(res.error.message);
    }

    const buyerById = new Map((profilesRes.data ?? []).map((p) => [p.id, p.display_name ?? null]));
    const sellerById = new Map((sellersRes.data ?? []).map((s) => [s.id, s]));
    const agentBySlug = new Map((agentsRes.data ?? []).map((a) => [a.slug, a]));
    const productBySlug = new Map((productsRes.data ?? []).map((p) => [p.slug, p]));

    return rows.map((row) => {
      const kind = row.kind as PremiumKind;
      const item = row.kind === "agent" ? agentBySlug.get(row.slug) : productBySlug.get(row.slug);
      const staticEntry = kind === "agent" || kind === "product" ? getPremiumEntry(kind, row.slug) : null;
      const seller = row.seller_id ? sellerById.get(row.seller_id) : null;
      const amountCents = staticEntry?.amountCents ?? item?.price_cents ?? null;

      return {
        id: row.id,
        user_id: row.user_id,
        buyer_name: buyerById.get(row.user_id) ?? null,
        kind: row.kind,
        slug: row.slug,
        item_name: item?.name ?? row.slug,
        amount_cents: amountCents,
        seller_id: row.seller_id,
        seller_name: seller?.display_name ?? null,
        seller_slug: seller?.slug ?? null,
        price_id: row.price_id,
        stripe_session_id: row.stripe_session_id,
        environment: row.environment,
        granted_at: row.granted_at,
        created_at: row.created_at,
      };
    });
  });

// ---------- Contact message / services pipeline triage ----------

export const CONTACT_PIPELINE_STATUSES = [
  "new",
  "reviewing",
  "qualified",
  "proposal_sent",
  "in_progress",
  "won",
  "lost",
] as const;

export type ContactPipelineStatus = (typeof CONTACT_PIPELINE_STATUSES)[number];

const contactPipelineUpdateSchema = z
  .object({
    id: z.string().uuid(),
    lead_status: z.enum(CONTACT_PIPELINE_STATUSES).optional(),
    assigned_owner: z.string().trim().min(1).max(120).nullable().optional(),
    admin_notes: z.string().trim().min(1).max(4_000).nullable().optional(),
    follow_up_at: z.string().datetime().nullable().optional(),
    // Kept for compatibility with the original inbox action. The pipeline UI
    // uses lead_status; terminal statuses automatically mark a message handled.
    handled: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.lead_status !== undefined ||
      value.assigned_owner !== undefined ||
      value.admin_notes !== undefined ||
      value.follow_up_at !== undefined ||
      value.handled !== undefined,
    "Choose at least one pipeline field to update.",
  );

export const adminUpdateMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => contactPipelineUpdateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const terminal = data.lead_status === "won" || data.lead_status === "lost";
    const update = {
      ...(data.lead_status !== undefined ? { lead_status: data.lead_status, handled: terminal } : {}),
      ...(data.assigned_owner !== undefined ? { assigned_owner: data.assigned_owner } : {}),
      ...(data.admin_notes !== undefined ? { admin_notes: data.admin_notes } : {}),
      ...(data.follow_up_at !== undefined ? { follow_up_at: data.follow_up_at } : {}),
      ...(data.handled !== undefined && data.lead_status === undefined ? { handled: data.handled } : {}),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin.from("contact_messages").update(update).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Upserts ----------

const tierEnum = z.enum(["free", "premium", "custom"]);
const statusEnum = z.enum(["draft", "scheduled", "published"]);

// Status + optional scheduled_at, with cross-field validation.
const publishFields = {
  status: statusEnum.default("draft"),
  scheduled_at: z.string().datetime().nullable().optional(),
};
function refinePublish<T extends z.ZodTypeAny>(schema: T) {
  return schema.superRefine((val, ctx) => {
    const v = val as { status: string; scheduled_at?: string | null };
    if (v.status === "scheduled" && !v.scheduled_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduled_at"],
        message: "Pick a date and time to schedule.",
      });
    }
  });
}

const agentSchema = refinePublish(
  z.object({
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
    model: z.string().trim().min(1).max(80).default("gpt-4o-mini"),
    system_prompt: z.string().max(10000).nullable().optional(),
    max_tokens: z.number().int().min(100).max(128000).default(1000),
    temperature: z.number().min(0).max(2).default(0.7),
    // Owner-only deliverable (the paid pack). Empty string clears it.
    unlock_content: z.string().nullable().optional(),
    ...publishFields,
  }),
);

export const adminUpsertAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => agentSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Normalize a blank pack to NULL so getAgent's has_fulfillment stays accurate.
    const unlock_content = data.unlock_content?.trim() ? data.unlock_content : null;
    const row = { ...data, unlock_content, active: data.status === "published" };
    // unlock_content isn't in the generated Database types yet (migration may post-date
    // type generation), so cast past the typed Insert.
    const { error } = await supabaseAdmin.from("agents").upsert(row as never, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const articleSchema = refinePublish(
  z.object({
    id: z.string().uuid().optional(),
    slug: z.string().trim().min(1).max(160),
    title: z.string().trim().min(1).max(200),
    excerpt: z.string().trim().min(1).max(400),
    body: z.string().trim().min(1),
    category: z.string().trim().min(1).max(80),
    read_minutes: z.number().int().min(1).max(120).default(5),
    ...publishFields,
  }),
);

export const adminUpsertArticle = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => articleSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = { ...data, published: data.status === "published" };
    const { error } = await supabaseAdmin.from("articles").upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const serviceSchema = refinePublish(
  z.object({
    id: z.string().uuid().optional(),
    slug: z.string().trim().min(1).max(120),
    name: z.string().trim().min(1).max(120),
    tagline: z.string().trim().min(1).max(240),
    description: z.string().trim().min(1),
    outcomes: z.array(z.string().trim().min(1)).default([]),
    starting_price_cents: z.number().int().nullable().optional(),
    ...publishFields,
  }),
);

export const adminUpsertService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => serviceSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row = { ...data, active: data.status === "published" };
    const { error } = await supabaseAdmin.from("services").upsert(row, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Deletes ----------

const deleteSchema = z.object({
  table: z.enum(["agents", "products", "articles", "services"]),
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


// ---------- Website Launch nurture controls ----------

const websiteLaunchNurtureToggleSchema = z.object({ enabled: z.boolean() });

export const adminGetWebsiteLaunchNurture = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: settings, error: settingsError }, { data: enrollments, error: enrollmentError }] = await Promise.all([
      supabaseAdmin
        .from("website_launch_nurture_settings")
        .select("id,sequence_key,enabled,updated_at")
        .eq("id", 1)
        .single(),
      supabaseAdmin
        .from("website_launch_nurture_enrollments")
        .select("status,current_step,next_send_at,last_sent_at,created_at")
        .eq("sequence_key", "website_launch_sprint_v1")
        .order("created_at", { ascending: false })
        .limit(250),
    ]);
    if (settingsError) throw new Error(settingsError.message);
    if (enrollmentError) throw new Error(enrollmentError.message);
    return { settings, enrollments: enrollments ?? [] };
  });

export const adminSetWebsiteLaunchNurture = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => websiteLaunchNurtureToggleSchema.parse(d))
  .handler(async ({ context, data }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();

    const { error: settingsError } = await supabaseAdmin
      .from("website_launch_nurture_settings")
      .update({ enabled: data.enabled, updated_at: now })
      .eq("id", 1);
    if (settingsError) throw new Error(settingsError.message);

    if (data.enabled) {
      const { data: signups, error: signupsError } = await supabaseAdmin
        .from("waitlist_signups")
        .select("id")
        .eq("source", "website_launch_checklist")
        .eq("marketing_consent", true)
        .limit(5000);
      if (signupsError) throw new Error(signupsError.message);
      const rows = (signups ?? []).map((signup) => ({
        waitlist_signup_id: signup.id,
        sequence_key: "website_launch_sprint_v1",
        status: "paused",
        current_step: 0,
        next_send_at: null,
        updated_at: now,
      }));
      if (rows.length) {
        const { error: enrollmentError } = await supabaseAdmin
          .from("website_launch_nurture_enrollments")
          .upsert(rows, { onConflict: "waitlist_signup_id,sequence_key", ignoreDuplicates: true });
        if (enrollmentError) throw new Error(enrollmentError.message);
      }
      const { error: activateError } = await supabaseAdmin
        .from("website_launch_nurture_enrollments")
        .update({ status: "active", next_send_at: now, updated_at: now })
        .eq("sequence_key", "website_launch_sprint_v1")
        .in("status", ["paused", "pending_confirmation"]);
      if (activateError) throw new Error(activateError.message);
    } else {
      const { error: pauseError } = await supabaseAdmin
        .from("website_launch_nurture_enrollments")
        .update({ status: "paused", updated_at: now })
        .eq("sequence_key", "website_launch_sprint_v1")
        .eq("status", "active");
      if (pauseError) throw new Error(pauseError.message);
    }

    return { ok: true, enabled: data.enabled };
  });
