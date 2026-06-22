import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const listMySavedAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_agents")
      .select("agent_id, agents(id, slug, name, tagline, category, tier)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
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
