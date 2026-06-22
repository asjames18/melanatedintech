import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ---------- Public reads (anyone) ----------

type AuthorMap = Map<string, { display_name: string | null; avatar_url: string | null }>;

async function getAuthorMap(userIds: string[]): Promise<AuthorMap> {
  const map: AuthorMap = new Map();
  const ids = Array.from(new Set(userIds.filter(Boolean)));
  if (ids.length === 0) return map;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, display_name, avatar_url")
    .in("id", ids);
  if (error) throw new Error(error.message);
  for (const p of data ?? []) {
    map.set(p.id, { display_name: p.display_name, avatar_url: p.avatar_url });
  }
  return map;
}

export const listDiscussionPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("discussion_posts")
    .select("id, user_id, title, body, category, comment_count, last_activity_at, created_at")
    .order("last_activity_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const authors = await getAuthorMap(rows.map((r) => r.user_id));
  return rows.map((r) => ({ ...r, author: authors.get(r.user_id) ?? null }));
});

export const getDiscussionThread = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [postRes, commentsRes] = await Promise.all([
      supabaseAdmin
        .from("discussion_posts")
        .select("id, user_id, title, body, category, comment_count, last_activity_at, created_at, updated_at")
        .eq("id", data.id)
        .maybeSingle(),
      supabaseAdmin
        .from("discussion_comments")
        .select("id, user_id, body, created_at, updated_at")
        .eq("post_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (postRes.error) throw new Error(postRes.error.message);
    if (commentsRes.error) throw new Error(commentsRes.error.message);
    if (!postRes.data) return null;

    const authors = await getAuthorMap([
      postRes.data.user_id,
      ...(commentsRes.data ?? []).map((c) => c.user_id),
    ]);
    return {
      post: { ...postRes.data, author: authors.get(postRes.data.user_id) ?? null },
      comments: (commentsRes.data ?? []).map((c) => ({
        ...c,
        author: authors.get(c.user_id) ?? null,
      })),
    };
  });

// ---------- Authenticated writes ----------

const createPostSchema = z.object({
  title: z.string().trim().min(3).max(140),
  body: z.string().trim().min(1).max(4000),
  category: z.string().trim().min(1).max(40).default("general"),
});

export const createDiscussionPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createPostSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("discussion_posts")
      .insert({
        user_id: context.userId,
        title: data.title,
        body: data.body,
        category: data.category,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

const createCommentSchema = z.object({
  post_id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
});

export const createDiscussionComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => createCommentSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("discussion_comments")
      .insert({ post_id: data.post_id, user_id: context.userId, body: data.body });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const deleteSchema = z.object({ id: z.string().uuid(), kind: z.enum(["post", "comment"]) });

export const deleteDiscussionItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => deleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    const table = data.kind === "post" ? "discussion_posts" : "discussion_comments";
    const { error } = await context.supabase.from(table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
