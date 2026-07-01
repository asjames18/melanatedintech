import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  COMMUNITY_CATEGORIES,
  REACTION_KINDS,
  type Author,
  type FeedPage,
  type FeedPost,
  type FeedReply,
  type FeedThread,
  type PublicProfile,
  type ReactionKind,
  type TrendingTag,
} from "@/lib/community";

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

type AuthorMap = Map<string, Author>;

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asRow<T = any>(r: any): T {
  return r as T;
}

const POST_COLS =
  "id, user_id, title, body, category, media_urls, reply_count, reaction_count, locked, last_activity_at, created_at, updated_at";
const REPLY_COLS =
  "id, post_id, user_id, parent_reply_id, body, path, depth, reaction_count, created_at, updated_at";

async function resolvePostMetrics(
  userId: string | undefined,
  postIds: string[],
): Promise<{
  reactionsByMe: Map<string, string[]>;
  reactionCounts: Map<string, Record<string, number>>;
  replyCounts: Map<string, number>;
}> {
  const reactionsByMe = new Map<string, string[]>();
  const reactionCounts = new Map<string, Record<string, number>>();
  const replyCounts = new Map<string, number>();

  if (postIds.length === 0) return { reactionsByMe, reactionCounts, replyCounts };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // 1. Fetch all reactions for these posts
  const { data: allReactions } = await supabaseAdmin
    .from("post_reactions")
    .select("post_id, user_id, kind")
    .in("post_id", postIds);

  for (const r of allReactions ?? []) {
    const currentCounts = reactionCounts.get(r.post_id) ?? {};
    currentCounts[r.kind] = (currentCounts[r.kind] ?? 0) + 1;
    reactionCounts.set(r.post_id, currentCounts);

    if (userId && r.user_id === userId) {
      reactionsByMe.set(r.post_id, [...(reactionsByMe.get(r.post_id) ?? []), r.kind]);
    }
  }

  // 2. Fetch all comments for these posts
  const { data: allComments } = await supabaseAdmin
    .from("discussion_comments")
    .select("post_id")
    .in("post_id", postIds);

  for (const c of allComments ?? []) {
    replyCounts.set(c.post_id, (replyCounts.get(c.post_id) ?? 0) + 1);
  }

  return { reactionsByMe, reactionCounts, replyCounts };
}

async function resolveReplyMetrics(
  userId: string | undefined,
  replyIds: string[],
): Promise<{
  reactionsByMe: Map<string, string[]>;
  reactionCounts: Map<string, Record<string, number>>;
}> {
  const reactionsByMe = new Map<string, string[]>();
  const reactionCounts = new Map<string, Record<string, number>>();

  if (replyIds.length === 0) return { reactionsByMe, reactionCounts };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: allReactions } = await supabaseAdmin
    .from("reply_reactions")
    .select("reply_id, user_id, kind")
    .in("reply_id", replyIds);

  for (const r of allReactions ?? []) {
    const currentCounts = reactionCounts.get(r.reply_id) ?? {};
    currentCounts[r.kind] = (currentCounts[r.kind] ?? 0) + 1;
    reactionCounts.set(r.reply_id, currentCounts);

    if (userId && r.user_id === userId) {
      reactionsByMe.set(r.reply_id, [...(reactionsByMe.get(r.reply_id) ?? []), r.kind]);
    }
  }

  return { reactionsByMe, reactionCounts };
}

function normalizeReactionCount(c: unknown): Record<string, number> {
  return c && typeof c === "object" ? (c as Record<string, number>) : {};
}

// ---------------------------------------------------------------------------
// Feed reads (anyone — viewer's reactions require auth, resolved server-side)
// ---------------------------------------------------------------------------

const listFeedSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(20),
  tab: z.enum(["for-you", "following"]).default("for-you"),
  tag: z.string().optional(),
});

export const listFeed = createServerFn({ method: "GET" })
  .validator((d: unknown) => listFeedSchema.parse(d))
  .handler(async ({ data }) => {
    const supabaseAdmin = (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin as any;
    const supabase = (await import("@/integrations/supabase/client")).supabase as any;

    // Best-effort viewer id (optional — drives reactions_by_me).
    let viewerId: string | undefined;
    try {
      const req = (await import("@tanstack/react-start/server")).getRequest();
      const authHeader = req?.headers?.get?.("authorization") ?? null;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        if (token.split(".").length === 3) {
          const { supabase: authed } = await import("@/integrations/supabase/client");
          const { data: claims } = await authed.auth.getClaims(token);
          viewerId = claims?.claims?.sub;
        }
      }
    } catch {
      // not authenticated — fine for a public read
    }
    void supabase;

    let q = supabaseAdmin
      .from("discussion_posts")
      .select(POST_COLS)
      .order("created_at", { ascending: false })
      .limit(data.limit + 1);

    if (data.cursor) q = q.lt("created_at", data.cursor);
    if (data.tab === "following" && viewerId) {
      // Posts from users this viewer follows.
      q = q.in(
        "user_id",
        supabaseAdmin.from("user_follows").select("followee_id").eq("follower_id", viewerId),
      );
    }

    if (data.tag) {
      q = q.in(
        "id",
        supabaseAdmin
          .from("post_hashtags")
          .select("post_id")
          .in(
            "hashtag_id",
            supabaseAdmin.from("hashtags").select("id").eq("tag", data.tag.toLowerCase()),
          ),
      );
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const hasMore = (rows?.length ?? 0) > data.limit;
    const slice = (rows ?? []).slice(0, data.limit);
    const next_cursor = hasMore && slice.length > 0 ? slice[slice.length - 1].created_at : null;

    const authors = await getAuthorMap(slice.map((r: any) => r.user_id));
    const postIds = slice.map((r: any) => r.id);
    const { reactionsByMe, reactionCounts, replyCounts } = await resolvePostMetrics(
      viewerId,
      postIds,
    );

    const posts: FeedPost[] = slice.map((r: any) => {
      const row = asRow(r);
      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title ?? null,
        body: row.body,
        category: row.category,
        media_urls: (row.media_urls ?? []) as string[],
        reply_count: replyCounts.get(row.id) ?? 0,
        reaction_count: reactionCounts.get(row.id) ?? {},
        reactions_by_me: reactionsByMe.get(row.id) ?? [],
        locked: !!row.locked,
        last_activity_at: row.last_activity_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author: authors.get(row.user_id) ?? null,
      };
    });

    const result: FeedPage = { posts, next_cursor };
    return result;
  });

const listUserPostsSchema = z.object({
  user_id: z.string().uuid(),
  cursor: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(50).default(20),
});

export const listUserPosts = createServerFn({ method: "GET" })
  .validator((d: unknown) => listUserPostsSchema.parse(d))
  .handler(async ({ data }) => {
    const supabaseAdmin = (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin as any;

    let viewerId: string | undefined;
    try {
      const req = (await import("@tanstack/react-start/server")).getRequest();
      const authHeader = req?.headers?.get?.("authorization") ?? null;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        if (token.split(".").length === 3) {
          const { supabase: authed } = await import("@/integrations/supabase/client");
          const { data: claims } = await authed.auth.getClaims(token);
          viewerId = claims?.claims?.sub;
        }
      }
    } catch {
      // public read
    }

    let q = supabaseAdmin
      .from("discussion_posts")
      .select(POST_COLS)
      .eq("user_id", data.user_id)
      .order("created_at", { ascending: false })
      .limit(data.limit + 1);

    if (data.cursor) q = q.lt("created_at", data.cursor);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const hasMore = (rows?.length ?? 0) > data.limit;
    const slice = (rows ?? []).slice(0, data.limit);
    const next_cursor = hasMore && slice.length > 0 ? slice[slice.length - 1].created_at : null;

    const authors = await getAuthorMap(slice.map((r: any) => r.user_id));
    const postIds = slice.map((r: any) => r.id);
    const { reactionsByMe, reactionCounts, replyCounts } = await resolvePostMetrics(
      viewerId,
      postIds,
    );

    const posts: FeedPost[] = slice.map((r: any) => {
      const row = asRow(r);
      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title ?? null,
        body: row.body,
        category: row.category,
        media_urls: (row.media_urls ?? []) as string[],
        reply_count: replyCounts.get(row.id) ?? 0,
        reaction_count: reactionCounts.get(row.id) ?? {},
        reactions_by_me: reactionsByMe.get(row.id) ?? [],
        locked: !!row.locked,
        last_activity_at: row.last_activity_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        author: authors.get(row.user_id) ?? null,
      };
    });

    const result: FeedPage = { posts, next_cursor };
    return result;
  });

const getThreadSchema = z.object({ id: z.string().uuid() });

export const getThread = createServerFn({ method: "GET" })
  .validator((d: unknown) => getThreadSchema.parse(d))
  .handler(async ({ data }) => {
    const supabaseAdmin = (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin as any;

    let viewerId: string | undefined;
    try {
      const req = (await import("@tanstack/react-start/server")).getRequest();
      const authHeader = req?.headers?.get?.("authorization") ?? null;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        if (token.split(".").length === 3) {
          const { supabase: authed } = await import("@/integrations/supabase/client");
          const { data: claims } = await authed.auth.getClaims(token);
          viewerId = claims?.claims?.sub;
        }
      }
    } catch {
      // public read; viewer optional
    }

    const [postRes, repliesRes] = await Promise.all([
      supabaseAdmin.from("discussion_posts").select(POST_COLS).eq("id", data.id).maybeSingle(),
      supabaseAdmin
        .from("discussion_comments")
        .select(REPLY_COLS)
        .eq("post_id", data.id)
        .order("path", { ascending: true }),
    ]);
    if (postRes.error) throw new Error(postRes.error.message);
    if (repliesRes.error) throw new Error(repliesRes.error.message);
    if (!postRes.data) return null;

    const authors = await getAuthorMap([
      postRes.data.user_id,
      ...(repliesRes.data ?? []).map((c: any) => c.user_id),
    ]);
    const postIds = [postRes.data.id];
    const replyIds = (repliesRes.data ?? []).map((c: any) => c.id);

    const [postMetrics, replyMetrics] = await Promise.all([
      resolvePostMetrics(viewerId, postIds),
      resolveReplyMetrics(viewerId, replyIds),
    ]);

    const prow = asRow(postRes.data);
    const post: FeedPost = {
      id: prow.id,
      user_id: prow.user_id,
      title: prow.title ?? null,
      body: prow.body,
      category: prow.category,
      media_urls: (prow.media_urls ?? []) as string[],
      reply_count: postMetrics.replyCounts.get(prow.id) ?? 0,
      reaction_count: postMetrics.reactionCounts.get(prow.id) ?? {},
      reactions_by_me: postMetrics.reactionsByMe.get(prow.id) ?? [],
      locked: !!prow.locked,
      last_activity_at: prow.last_activity_at,
      created_at: prow.created_at,
      updated_at: prow.updated_at,
      author: authors.get(prow.user_id) ?? null,
    };

    const replies: FeedReply[] = (repliesRes.data ?? []).map((c: any) => {
      const row = asRow(c);
      return {
        id: row.id,
        post_id: row.post_id,
        user_id: row.user_id,
        parent_reply_id: row.parent_reply_id ?? null,
        body: row.body,
        path: row.path ?? row.id,
        depth: row.depth ?? 0,
        reaction_count: replyMetrics.reactionCounts.get(row.id) ?? {},
        reactions_by_me: replyMetrics.reactionsByMe.get(row.id) ?? [],
        created_at: row.created_at,
        updated_at: row.updated_at,
        author: authors.get(row.user_id) ?? null,
      };
    });

    const thread: FeedThread = { post, replies };
    return thread;
  });

// ---------------------------------------------------------------------------
// Authenticated writes — posts + replies
// ---------------------------------------------------------------------------

const createPostSchema = z.object({
  title: z.string().trim().max(140).optional(),
  body: z.string().trim().min(1).max(1000),
  category: z.enum(COMMUNITY_CATEGORIES).default("general"),
  media_urls: z.array(z.string()).max(4).default([]),
});

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => createPostSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await (context.supabase as any)
      .from("discussion_posts")
      .insert({
        user_id: context.userId,
        title: data.title || null,
        body: data.body,
        category: data.category,
        media_urls: data.media_urls,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

const replySchema = z.object({
  post_id: z.string().uuid(),
  body: z.string().trim().min(1).max(2000),
  parent_reply_id: z.string().uuid().nullable().optional(),
});

export const replyToPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => replySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { data: post } = await (context.supabase as any)
      .from("discussion_posts")
      .select("locked")
      .eq("id", data.post_id)
      .maybeSingle();
    if (post?.locked) throw new Error("This thread is locked.");

    const { data: row, error } = await (context.supabase as any)
      .from("discussion_comments")
      .insert({
        post_id: data.post_id,
        user_id: context.userId,
        body: data.body,
        parent_reply_id: data.parent_reply_id ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

// ---------------------------------------------------------------------------
// Reactions
// ---------------------------------------------------------------------------

const REACTION_KIND_TUPLE: [ReactionKind, ...ReactionKind[]] = [...REACTION_KINDS] as [
  ReactionKind,
  ...ReactionKind[],
];

const reactSchema = z.object({
  post_id: z.string().uuid(),
  kind: z.enum(REACTION_KIND_TUPLE),
});

export const reactPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => reactSchema.parse(d))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    // 1. Delete any existing reactions by this user on this post first
    await supabase
      .from("post_reactions")
      .delete()
      .eq("user_id", context.userId)
      .eq("post_id", data.post_id);

    // 2. Insert the new reaction kind
    const { error } = await supabase.from("post_reactions").insert({
      user_id: context.userId,
      post_id: data.post_id,
      kind: data.kind,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unreactPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => reactSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("post_reactions")
      .delete()
      .eq("user_id", context.userId)
      .eq("post_id", data.post_id)
      .eq("kind", data.kind);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const replyReactSchema = z.object({
  reply_id: z.string().uuid(),
  kind: z.enum(REACTION_KIND_TUPLE),
});

export const reactReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => replyReactSchema.parse(d))
  .handler(async ({ data, context }) => {
    const supabase = context.supabase as any;
    // 1. Delete any existing reactions by this user on this reply first
    await supabase
      .from("reply_reactions")
      .delete()
      .eq("user_id", context.userId)
      .eq("reply_id", data.reply_id);

    // 2. Insert the new reaction kind
    const { error } = await supabase.from("reply_reactions").insert({
      user_id: context.userId,
      reply_id: data.reply_id,
      kind: data.kind,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const unreactReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => replyReactSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("reply_reactions")
      .delete()
      .eq("user_id", context.userId)
      .eq("reply_id", data.reply_id)
      .eq("kind", data.kind);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Follows
// ---------------------------------------------------------------------------

const followSchema = z.object({ followee_id: z.string().uuid() });

export const toggleFollow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => followSchema.parse(d))
  .handler(async ({ data, context }) => {
    if (data.followee_id === context.userId) throw new Error("You can't follow yourself.");
    // Try delete first (toggle off); if no row matched, insert (toggle on).
    const { count: deleted } = await (context.supabase as any)
      .from("user_follows")
      .delete({ count: "exact" })
      .eq("follower_id", context.userId)
      .eq("followee_id", data.followee_id);
    if ((deleted ?? 0) > 0) return { ok: true, following: false };
    const { error } = await (context.supabase as any).from("user_follows").insert({
      follower_id: context.userId,
      followee_id: data.followee_id,
    });
    if (error) throw new Error(error.message);
    return { ok: true, following: true };
  });

// ---------------------------------------------------------------------------
// Public profile + author posts
// ---------------------------------------------------------------------------

const publicProfileSchema = z.object({ user_id: z.string().uuid() });

export const getPublicProfile = createServerFn({ method: "GET" })
  .validator((d: unknown) => publicProfileSchema.parse(d))
  .handler(async ({ data }) => {
    const supabaseAdmin = (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin as any;

    let viewerId: string | undefined;
    try {
      const req = (await import("@tanstack/react-start/server")).getRequest();
      const authHeader = req?.headers?.get?.("authorization") ?? null;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        if (token.split(".").length === 3) {
          const { supabase: authed } = await import("@/integrations/supabase/client");
          const { data: claims } = await authed.auth.getClaims(token);
          viewerId = claims?.claims?.sub;
        }
      }
    } catch {
      // public read
    }

    const [profRes, countRes, followRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, display_name, avatar_url, bio, followers_count, following_count")
        .eq("id", data.user_id)
        .maybeSingle(),
      supabaseAdmin
        .from("discussion_posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", data.user_id),
      viewerId
        ? (supabaseAdmin as any)
            .from("user_follows")
            .select("id", { count: "exact", head: true })
            .eq("follower_id", viewerId)
            .eq("followee_id", data.user_id)
        : Promise.resolve({ count: 0 }),
    ]);
    if (profRes.error) throw new Error(profRes.error.message);
    if (!profRes.data) return null;

    const p = asRow(profRes.data);
    const profile: PublicProfile = {
      id: p.id,
      display_name: p.display_name ?? null,
      avatar_url: p.avatar_url ?? null,
      bio: p.bio ?? null,
      followers_count: p.followers_count ?? 0,
      following_count: p.following_count ?? 0,
      post_count: countRes.count ?? 0,
      is_following: (followRes.count ?? 0) > 0,
    };
    return profile;
  });

// ---------------------------------------------------------------------------
// Trending hashtags
// ---------------------------------------------------------------------------

const trendingSchema = z.object({ limit: z.number().int().min(1).max(20).default(8) });

export const listTrending = createServerFn({ method: "GET" })
  .validator((d: unknown) => trendingSchema.parse(d))
  .handler(async ({ data }) => {
    const supabaseAdmin = (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin as any;
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("hashtags")
      .select("tag, usage_count")
      .order("usage_count", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return (rows ?? []) as TrendingTag[];
  });

// ---------------------------------------------------------------------------
// Deletes + moderation (owner-scoped via RLS, admin via service role)
// ---------------------------------------------------------------------------

const deleteSchema = z.object({ id: z.string().uuid(), kind: z.enum(["post", "reply"]) });

export const deleteItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => deleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    const table = data.kind === "post" ? "discussion_posts" : "discussion_comments";
    const { error } = await context.supabase.from(table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminDeleteItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => deleteSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const table = data.kind === "post" ? "discussion_posts" : "discussion_comments";
    const { error } = await supabaseAdmin.from(table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const moderateSchema = z.object({ id: z.string().uuid(), locked: z.boolean() });

export const moderateThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => moderateSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("discussion_posts")
      .update({ locked: data.locked } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------------------------------------------------------------------------
// Admin: community moderation views (posts / replies / hashtags / stats)
// ---------------------------------------------------------------------------

const adminListPostsSchema = z.object({
  cursor: z.string().datetime().optional(),
  limit: z.number().int().min(1).max(100).default(50),
  locked: z.enum(["all", "locked", "open"]).default("all"),
  category: z.string().optional(),
  user_id: z.string().uuid().optional(),
});

export type AdminPostRow = {
  id: string;
  user_id: string;
  title: string | null;
  body: string;
  category: string;
  media_urls: string[];
  reply_count: number;
  reaction_count: Record<string, number>;
  locked: boolean;
  created_at: string;
  last_activity_at: string;
  author: Author | null;
};

export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => adminListPostsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin as any;

    let q = (supabaseAdmin as any)
      .from("discussion_posts")
      .select(POST_COLS)
      .order("created_at", { ascending: false })
      .limit(data.limit + 1);

    if (data.cursor) q = q.lt("created_at", data.cursor);
    if (data.locked === "locked") q = q.eq("locked", true);
    if (data.locked === "open") q = q.eq("locked", false);
    if (data.category) q = q.eq("category", data.category);
    if (data.user_id) q = q.eq("user_id", data.user_id);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const slice = (rows ?? []).slice(0, data.limit);
    const authors = await getAuthorMap(slice.map((r: any) => r.user_id));

    const posts: AdminPostRow[] = slice.map((r: any) => {
      const row = asRow(r);
      return {
        id: row.id,
        user_id: row.user_id,
        title: row.title ?? null,
        body: row.body,
        category: row.category,
        media_urls: (row.media_urls ?? []) as string[],
        reply_count: row.reply_count ?? 0,
        reaction_count: normalizeReactionCount(row.reaction_count),
        locked: !!row.locked,
        created_at: row.created_at,
        last_activity_at: row.last_activity_at,
        author: authors.get(row.user_id) ?? null,
      };
    });
    return posts;
  });

export type AdminReplyRow = {
  id: string;
  post_id: string;
  user_id: string;
  parent_reply_id: string | null;
  body: string;
  depth: number;
  reaction_count: Record<string, number>;
  created_at: string;
  author: Author | null;
  post_title: string | null;
};

const adminListRepliesSchema = z.object({
  post_id: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export const adminListReplies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => adminListRepliesSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin as any;

    let q = (supabaseAdmin as any)
      .from("discussion_comments")
      .select(REPLY_COLS)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.post_id) q = q.eq("post_id", data.post_id);

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);

    const slice = rows ?? [];
    const authorIds = slice.map((r: any) => r.user_id);
    const postIds = Array.from(new Set(slice.map((r: any) => r.post_id)));
    const [authors, posts] = await Promise.all([
      getAuthorMap(authorIds),
      (async () => {
        if (postIds.length === 0) return new Map<string, string | null>();
        const { data: p } = await (supabaseAdmin as any)
          .from("discussion_posts")
          .select("id, title")
          .in("id", postIds);
        const m = new Map<string, string | null>();
        for (const x of p ?? []) m.set(x.id, x.title ?? null);
        return m;
      })(),
    ]);

    const replies: AdminReplyRow[] = slice.map((r: any) => {
      const row = asRow(r);
      return {
        id: row.id,
        post_id: row.post_id,
        user_id: row.user_id,
        parent_reply_id: row.parent_reply_id ?? null,
        body: row.body,
        depth: row.depth ?? 0,
        reaction_count: normalizeReactionCount(row.reaction_count),
        created_at: row.created_at,
        author: authors.get(row.user_id) ?? null,
        post_title: posts.get(row.post_id) ?? null,
      };
    });
    return replies;
  });

export type AdminHashtagRow = {
  id: string;
  tag: string;
  usage_count: number;
  suppressed: boolean;
  created_at: string;
};

const adminListHashtagsSchema = z.object({
  limit: z.number().int().min(1).max(200).default(100),
});

export const adminListHashtags = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => adminListHashtagsSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await (supabaseAdmin as any)
      .from("hashtags")
      .select("id, tag, usage_count, suppressed, created_at")
      .order("usage_count", { ascending: false })
      .limit(data.limit);
    if (error) throw new Error(error.message);
    return (rows ?? []) as AdminHashtagRow[];
  });

const suppressSchema = z.object({ id: z.string().uuid(), suppressed: z.boolean() });

export const adminSuppressHashtag = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => suppressSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const supabaseAdmin = (await import("@/integrations/supabase/client.server"))
      .supabaseAdmin as any;
    const { error } = await (supabaseAdmin as any)
      .from("hashtags")
      .update({ suppressed: data.suppressed } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type CommunityStats = {
  posts_7d: number;
  replies_7d: number;
  reactions_7d: number;
  follows_7d: number;
  total_posts: number;
  total_replies: number;
  total_users: number;
};

export const adminCommunityStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [
      posts7,
      replies7,
      postReactions7,
      replyReactions7,
      follows7,
      totalPosts,
      totalReplies,
      totalUsers,
    ] = await Promise.all([
      supabaseAdmin
        .from("discussion_posts")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabaseAdmin
        .from("discussion_comments")
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabaseAdmin
        .from("post_reactions" as any)
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabaseAdmin
        .from("reply_reactions" as any)
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabaseAdmin
        .from("user_follows" as any)
        .select("id", { count: "exact", head: true })
        .gte("created_at", since),
      supabaseAdmin.from("discussion_posts").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("discussion_comments").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
    ]);

    const stats: CommunityStats = {
      posts_7d: posts7.count ?? 0,
      replies_7d: replies7.count ?? 0,
      reactions_7d: (postReactions7.count ?? 0) + (replyReactions7.count ?? 0),
      follows_7d: follows7.count ?? 0,
      total_posts: totalPosts.count ?? 0,
      total_replies: totalReplies.count ?? 0,
      total_users: totalUsers.count ?? 0,
    };
    return stats;
  });

// ---------------------------------------------------------------------------
// Legacy exports — kept so the previous community routes keep compiling while
// we migrate them to the new feed UI. These simply proxy to the new fns.
// ---------------------------------------------------------------------------

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
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const t = await getThread({ data: { id: data.id } });
    if (!t) return null;
    return {
      post: {
        ...t.post,
        comment_count: t.post.reply_count,
      },
      comments: t.replies.map((r) => ({
        id: r.id,
        post_id: r.post_id,
        user_id: r.user_id,
        body: r.body,
        created_at: r.created_at,
        updated_at: r.updated_at,
        author: r.author,
      })),
    };
  });

export const createDiscussionPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        title: z.string().trim().min(3).max(140),
        body: z.string().trim().min(1).max(4000),
        category: z.enum(COMMUNITY_CATEGORIES).default("general"),
      })
      .parse(d),
  )
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

export const createDiscussionComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z.object({ post_id: z.string().uuid(), body: z.string().trim().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const r = await replyToPost({ data: { post_id: data.post_id, body: data.body } });
    return r;
  });

export const deleteDiscussionItem = deleteItem;
export const adminDeleteDiscussionItem = adminDeleteItem;
export const moderateDiscussionThread = moderateThread;
