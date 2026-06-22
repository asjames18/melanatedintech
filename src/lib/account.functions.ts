import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

const profileSchema = z.object({
  display_name: z.string().trim().min(1, "Required").max(60),
  bio: z.string().trim().max(280).nullable().optional(),
  avatar_url: z.string().trim().max(500).nullable().optional(),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => profileSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({
        display_name: data.display_name,
        bio: data.bio ?? null,
        avatar_url: data.avatar_url ?? null,
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMySavedAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_agents")
      .select("agent_id, created_at, agents(id, slug, name, tagline, category, tier)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listMySavedAgentIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_agents")
      .select("agent_id");
    if (error) throw new Error(error.message);
    return (data ?? []).map((r) => r.agent_id);
  });

export const toggleSavedAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ agentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const existing = await context.supabase
      .from("saved_agents")
      .select("id")
      .eq("user_id", context.userId)
      .eq("agent_id", data.agentId)
      .maybeSingle();
    if (existing.data) {
      await context.supabase.from("saved_agents").delete().eq("id", existing.data.id);
      return { saved: false };
    }
    const { error } = await context.supabase
      .from("saved_agents")
      .insert({ user_id: context.userId, agent_id: data.agentId });
    if (error) throw new Error(error.message);
    return { saved: true };
  });
