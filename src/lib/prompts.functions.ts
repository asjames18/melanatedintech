import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Prompt categories ----------

export const PROMPT_CATEGORIES = [
  "Agent Templates",
  "Security",
  "Evaluation",
  "Writing",
  "Research",
  "Marketing",
  "Operations",
  "Education",
  "Ministry",
  "Templates",
  "Other",
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

// ---------- List prompts ----------

export const listMyPrompts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("user_id", context.userId)
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const listPublicPrompts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("prompts")
      .select("id, title, content, category, tags, usage_count, created_at")
      .eq("is_public", true)
      .order("usage_count", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getPrompt = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prompt, error } = await supabaseAdmin
      .from("prompts")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!prompt) throw new Error("Prompt not found.");
    if (prompt.user_id !== context.userId && !prompt.is_public) {
      throw new Error("This prompt is private.");
    }
    return prompt;
  });

// ---------- Upsert prompt ----------

const promptSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(120),
  content: z.string().trim().min(1).max(10000),
  category: z.enum(PROMPT_CATEGORIES).default("Other"),
  tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]),
  is_public: z.boolean().default(false),
});

export const upsertPrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => promptSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const row = {
      ...data,
      user_id: context.userId,
    };

    if (!row.id) {
      delete (row as Record<string, unknown>).id;
    }

    const { error } = await supabaseAdmin
      .from("prompts")
      .upsert(row as never, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Delete prompt ----------

export const deletePrompt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existing } = await supabaseAdmin
      .from("prompts")
      .select("user_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!existing) throw new Error("Prompt not found.");
    if (existing.user_id !== context.userId) throw new Error("Not your prompt.");

    const { error } = await supabaseAdmin.from("prompts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
