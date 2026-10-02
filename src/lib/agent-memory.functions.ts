import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type MemorySettings = {
  isRedeemer: boolean;
  /** False until the agent_memories migration is applied. */
  provisioned: boolean;
  enabled: boolean;
  memoryCount: number;
};

/**
 * Memory settings for the signed-in user. Free-tier callers get
 * isRedeemer: false and no memory UI. Tolerant of the migration not being
 * applied yet (provisioned: false).
 */
export const getMemorySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MemorySettings> => {
    // Server-only imports inside the handler: this module ships to the
    // client bundle, so top-level server imports would break rendering.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { isMissingTable } = await import("@/lib/agent-memory.server");

    const { data: codeRow } = await supabaseAdmin
      .from("redeem_codes")
      .select("code")
      .eq("redeemed_by", context.userId)
      .limit(1)
      .maybeSingle();
    if (!codeRow) {
      return { isRedeemer: false, provisioned: false, enabled: false, memoryCount: 0 };
    }

    // Provisioned? A missing table means the migration hasn't landed.
    const { error: probeErr } = await supabaseAdmin
      .from("agent_memories")
      .select("id")
      .limit(1);
    if (probeErr && isMissingTable(probeErr)) {
      return { isRedeemer: true, provisioned: false, enabled: false, memoryCount: 0 };
    }

    const { getMemoryState } = await import("@/lib/agent-memory.server");
    const state = await getMemoryState(supabaseAdmin, context.userId);
    const { count } = await supabaseAdmin
      .from("agent_memories")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    return {
      isRedeemer: true,
      provisioned: true,
      enabled: state ? state.memory_enabled : true,
      memoryCount: count ?? 0,
    };
  });

export const setAgentMemoryEnabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ enabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { setMemoryEnabled } = await import("@/lib/agent-memory.server");
    const ok = await setMemoryEnabled(supabaseAdmin, context.userId, data.enabled);
    if (!ok) throw new Error("Could not save the memory setting — please try again.");
    return { ok: true, enabled: data.enabled };
  });

export const clearAgentMemories = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { clearAllMemories } = await import("@/lib/agent-memory.server");
    const deleted = await clearAllMemories(supabaseAdmin, context.userId);
    return { ok: true, deleted };
  });
