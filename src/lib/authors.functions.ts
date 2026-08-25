import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(getSupabaseUrl()!, getSupabasePublishableKey()!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const getAuthor = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [{ data: author, error }, { data: articles }] = await Promise.all([
      sb.from("authors").select("*").eq("slug", data.slug).maybeSingle(),
      sb
        .from("articles")
        .select("id, slug, title, excerpt, category, read_minutes, published_at, author_id")
        .order("published_at", { ascending: false }),
    ]);
    if (error) throw new Error(error.message);
    if (!author) return null;
    const theirs = (articles ?? []).filter((a) => a.author_id === author.id);
    return { author, articles: theirs };
  });

export const getArticleAuthor = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ author_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: author, error } = await sb
      .from("authors")
      .select("*")
      .eq("id", data.author_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return author;
  });

export const listAuthors = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("authors")
    .select("id, slug, name, avatar_url, bio")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});
