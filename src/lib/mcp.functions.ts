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

const providerEnum = z.enum(["anthropic", "openai", "custom"]);
const mcpSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).nullable().optional(),
  url: z.string().url().max(500),
  provider: providerEnum.default("custom"),
  category: z.string().trim().min(1).max(80).default("general"),
  tags: z.array(z.string().trim().min(1).max(40)).default([]),
  is_public: z.boolean().default(false),
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

export type McpServerRow = Database["public"]["Tables"]["mcp_servers"]["Row"];

// Public, unauthenticated listing (only approved + public servers).
export const listPublicMcpServers = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z
      .object({
        provider: providerEnum.optional(),
        category: z.string().optional(),
        search: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let query = sb
      .from("mcp_servers")
      .select("id, name, description, url, provider, category, tags, created_at")
      .eq("is_public", true)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (data.provider) query = query.eq("provider", data.provider);
    if (data.category) query = query.eq("category", data.category);
    if (data.search) query = query.ilike("name", `%${data.search}%`);

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return rows;
  });

// Authenticated endpoints below.

export const listMyMcpServers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("mcp_servers")
      .select(
        "id, name, description, url, provider, category, tags, is_public, is_approved, created_at",
      )
      .eq("submitted_by", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows;
  });

export const upsertMcpServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => {
    const schema = z.object({
      id: z.string().uuid().optional(),
      ...mcpSchema.shape,
    });
    return schema.parse(d);
  })
  .handler(async ({ data, context }) => {
    const sb = supabaseAdmin();
    const id = data.id;
    const isUpdate = !!id;

    if (isUpdate) {
      const { data: existing } = await sb
        .from("mcp_servers")
        .select("submitted_by")
        .eq("id", id)
        .maybeSingle();
      if (!existing || existing.submitted_by !== context.userId) {
        throw new Error("Not found or not authorized");
      }
    }

    const row = {
      name: data.name,
      description: data.description,
      url: data.url,
      provider: data.provider,
      category: data.category,
      tags: data.tags,
      is_public: data.is_public,
      submitted_by: context.userId,
    };

    const { error } = isUpdate
      ? await sb.from("mcp_servers").update(row).eq("id", id)
      : await sb.from("mcp_servers").insert(row);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMcpServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = supabaseAdmin();
    const { data: existing } = await sb
      .from("mcp_servers")
      .select("submitted_by")
      .eq("id", data.id)
      .maybeSingle();
    if (!existing || existing.submitted_by !== context.userId) {
      throw new Error("Not found or not authorized");
    }
    const { error } = await sb.from("mcp_servers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminApproveMcpServer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const sb = supabaseAdmin();
    const { error } = await sb.from("mcp_servers").update({ is_approved: true }).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
