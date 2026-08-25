import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Interests = {
  categories: string[];
  content_types: string[];
};

const empty: Interests = { categories: [], content_types: [] };

const saveSchema = z.object({
  categories: z.array(z.string().trim().min(1).max(60)).max(40).default([]),
  content_types: z.array(z.string().trim().min(1).max(60)).max(20).default([]),
});

export const getMyInterests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_interests")
      .select("categories, content_types")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) return empty;
    return {
      categories: data.categories ?? [],
      content_types: data.content_types ?? [],
    } satisfies Interests;
  });

export const saveMyInterests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => saveSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("user_interests").upsert(
      {
        user_id: context.userId,
        categories: data.categories,
        content_types: data.content_types,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const resetMyInterests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("user_interests")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
