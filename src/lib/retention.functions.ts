import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database, Json } from "@/integrations/supabase/types";

export type LearningPathItemType = "article" | "agent" | "product" | "community_prompt";

export type ResolvedLearningPathItem = {
  id: string;
  item_type: LearningPathItemType;
  item_slug: string;
  sort_order: number;
  title: string | null;
  excerpt: string | null;
  resource:
    | Pick<
        Database["public"]["Tables"]["articles"]["Row"],
        "id" | "slug" | "title" | "excerpt" | "category" | "read_minutes"
      >
    | Pick<
        Database["public"]["Tables"]["agents"]["Row"],
        "id" | "slug" | "name" | "tagline" | "category" | "tier" | "capabilities" | "featured"
      >
    | Pick<
        Database["public"]["Tables"]["products"]["Row"],
        "id" | "slug" | "name" | "tagline" | "category" | "tier"
      >
    | null;
};

export type ResolvedLearningPath = Database["public"]["Tables"]["learning_paths"]["Row"] & {
  items: ResolvedLearningPathItem[];
};

function publicClient() {
  return createClient<Database>(getSupabaseUrl()!, getSupabasePublishableKey()!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

async function resolvePath(
  sb: ReturnType<typeof publicClient>,
  path: Database["public"]["Tables"]["learning_paths"]["Row"],
): Promise<ResolvedLearningPath> {
  const { data: items, error: itemsError } = await sb
    .from("learning_path_items")
    .select("id,item_type,item_slug,title,excerpt,sort_order")
    .eq("path_id", path.id)
    .order("sort_order");
  if (itemsError) throw new Error(itemsError.message);

  const safeItems = (items ?? []) as Array<
    Omit<ResolvedLearningPathItem, "resource" | "item_type"> & { item_type: LearningPathItemType }
  >;
  const articleSlugs = safeItems.filter((i) => i.item_type === "article").map((i) => i.item_slug);
  const agentSlugs = safeItems.filter((i) => i.item_type === "agent").map((i) => i.item_slug);
  const productSlugs = safeItems.filter((i) => i.item_type === "product").map((i) => i.item_slug);

  const now = new Date().toISOString();
  const [articles, agents, products] = await Promise.all([
    articleSlugs.length
      ? sb
          .from("articles")
          .select("id,slug,title,excerpt,category,read_minutes")
          .in("slug", articleSlugs)
          .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      : Promise.resolve({ data: [], error: null }),
    agentSlugs.length
      ? sb
          .from("agents")
          .select("id,slug,name,tagline,category,tier,capabilities,featured")
          .in("slug", agentSlugs)
          .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      : Promise.resolve({ data: [], error: null }),
    productSlugs.length
      ? sb
          .from("products")
          .select("id,slug,name,tagline,category,tier")
          .in("slug", productSlugs)
          .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (articles.error) throw new Error(articles.error.message);
  if (agents.error) throw new Error(agents.error.message);
  if (products.error) throw new Error(products.error.message);

  const articleMap = new Map((articles.data ?? []).map((row) => [row.slug, row]));
  const agentMap = new Map((agents.data ?? []).map((row) => [row.slug, row]));
  const productMap = new Map((products.data ?? []).map((row) => [row.slug, row]));

  return {
    ...path,
    items: safeItems.map((item) => ({
      ...item,
      resource:
        item.item_type === "article"
          ? (articleMap.get(item.item_slug) ?? null)
          : item.item_type === "agent"
            ? (agentMap.get(item.item_slug) ?? null)
            : item.item_type === "product"
              ? (productMap.get(item.item_slug) ?? null)
              : null,
    })),
  };
}

export const listLearningPaths = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("learning_paths")
    .select("*")
    .eq("published", true)
    .order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getLearningPath = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: path, error } = await sb
      .from("learning_paths")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!path) return null;
    return resolvePath(sb, path);
  });

export const listBuilderChallenges = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("builder_challenges")
    .select("*")
    .eq("published", true)
    .order("starts_at", { ascending: false });
  if (error) throw new Error(error.message);

  const now = Date.now();
  const list = data ?? [];
  return list.map((c, idx) => {
    if (idx === 0) {
      return {
        ...c,
        starts_at: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
        ends_at: new Date(now + 23 * 24 * 60 * 60 * 1000).toISOString(),
      };
    }
    return c;
  });
});

export const getBuilderChallenge = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: challenge, error } = await sb
      .from("builder_challenges")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return challenge;
  });

export const listMyLearningProgress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_learning_progress")
      .select(
        "id,path_id,current_item_id,completed_item_ids,completed_at,updated_at,learning_paths(id,slug,title,excerpt,audience,difficulty,sort_order)",
      )
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const pathProgressSchema = z.object({
  pathSlug: z.string().min(1),
  itemId: z.string().uuid().optional(),
  completed: z.boolean().optional(),
});

export const updateLearningPathProgress = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pathProgressSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: path, error: pathError } = await context.supabase
      .from("learning_paths")
      .select("id")
      .eq("slug", data.pathSlug)
      .eq("published", true)
      .maybeSingle();
    if (pathError) throw new Error(pathError.message);
    if (!path) throw new Error("Learning path not found.");

    const { data: items, error: itemsError } = await context.supabase
      .from("learning_path_items")
      .select("id")
      .eq("path_id", path.id)
      .order("sort_order");
    if (itemsError) throw new Error(itemsError.message);

    const itemIds = (items ?? []).map((item) => item.id);
    const requestedItem = data.itemId ?? itemIds[0] ?? null;
    if (requestedItem && !itemIds.includes(requestedItem)) {
      throw new Error("That item is not part of this learning path.");
    }

    const { data: existing, error: existingError } = await context.supabase
      .from("user_learning_progress")
      .select("completed_item_ids")
      .eq("user_id", context.userId)
      .eq("path_id", path.id)
      .maybeSingle();
    if (existingError) throw new Error(existingError.message);

    const completed = new Set(existing?.completed_item_ids ?? []);
    if (requestedItem && typeof data.completed === "boolean") {
      if (data.completed) completed.add(requestedItem);
      else completed.delete(requestedItem);
    }

    const completedItemIds = itemIds.filter((id) => completed.has(id));
    const nextItemId = itemIds.find((id) => !completed.has(id)) ?? null;
    const isComplete = itemIds.length > 0 && completedItemIds.length === itemIds.length;

    const { error: upsertError } = await context.supabase.from("user_learning_progress").upsert({
      user_id: context.userId,
      path_id: path.id,
      current_item_id: nextItemId ?? requestedItem,
      completed_item_ids: completedItemIds,
      completed_at: isComplete ? new Date().toISOString() : null,
    });
    if (upsertError) throw new Error(upsertError.message);
    return { ok: true, completed_item_ids: completedItemIds, current_item_id: nextItemId };
  });

const fitFinderResultSchema = z.record(z.string(), z.unknown());

export const getMyFitFinderResult = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("fit_finder_result")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data?.fit_finder_result ?? null;
  });

export const saveMyFitFinderResult = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ result: fitFinderResultSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .update({ fit_finder_result: data.result as Json })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
