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

export const listAgents = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("agents")
    .select("id,slug,name,tagline,category,capabilities,tier,price_cents,image_url,featured")
    .order("featured", { ascending: false })
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getAgent = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const baseCols =
      "id,slug,name,tagline,description,category,capabilities,tier,price_cents,image_url,featured";
    // Never select unlock_content here — RLS is row-level, so select("*") would
    // hand the paid pack to anyone. Fetch the gated fields only to derive a
    // boolean, then strip them. Degrade gracefully if the columns aren't there
    // yet (code deployed ahead of the migration). Mirrors getProduct below.
    let { data: row, error } = await sb
      .from("agents")
      .select(`${baseCols},unlock_content,asset_path`)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error && /unlock_content|asset_path|column/i.test(error.message)) {
      ({ data: row, error } = await sb
        .from("agents")
        .select(baseCols)
        .eq("slug", data.slug)
        .maybeSingle());
    }
    if (error) throw new Error(error.message);
    if (!row) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { unlock_content, asset_path, ...rest } = row as any;
    // Agent packs are owner-only; only expose whether a deliverable exists.
    return { ...rest, has_fulfillment: !!unlock_content || !!asset_path };
  });

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("articles")
    .select("id,slug,title,excerpt,category,read_minutes,published_at")
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getArticle = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("articles")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("products")
    .select("id,slug,name,tagline,category,tier,price_cents,image_url")
    .eq("active", true)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProduct = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const baseCols =
      "id,slug,name,tagline,description,category,tier,price_cents,image_url,active,created_at,updated_at";
    // Never select unlock_content here — RLS is row-level, so select("*") would
    // hand the paid pack to anyone. Fetch the gated fields only to derive a
    // boolean, then strip them. Degrade gracefully if the columns aren't there
    // yet (code deployed ahead of the migration).
    let { data: row, error } = await sb
      .from("products")
      .select(`${baseCols},unlock_content,asset_path`)
      .eq("slug", data.slug)
      .eq("active", true)
      .maybeSingle();
    if (error && /unlock_content|asset_path|column/i.test(error.message)) {
      ({ data: row, error } = await sb
        .from("products")
        .select(baseCols)
        .eq("slug", data.slug)
        .eq("active", true)
        .maybeSingle());
    }
    if (error) throw new Error(error.message);
    if (!row) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { unlock_content, asset_path, ...rest } = row as any;
    // Free packs are public — return their content. Premium content stays gated
    // and is only served by getProductFulfillment to a verified owner.
    const isFree = rest.tier === "free";
    return {
      ...rest,
      has_fulfillment: !!unlock_content || !!asset_path,
      unlock_content: isFree ? (unlock_content ?? null) : undefined,
    };
  });

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("services")
    .select("id,slug,name,tagline,description,outcomes,starting_price_cents")
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

const waitlistSchema = z.object({
  email: z.string().trim().email().max(255),
  source: z.string().trim().max(80).optional(),
  interest: z.string().trim().max(200).optional(),
  // Honeypot: real users never fill this hidden field; bots do.
  hp: z.string().trim().max(200).optional(),
});
export const joinWaitlist = createServerFn({ method: "POST" })
  .validator((d: unknown) => waitlistSchema.parse(d))
  .handler(async ({ data }) => {
    // Silently accept honeypot hits so bots can't distinguish a rejection.
    if (data.hp) return { ok: true };

    const { getClientIpHash, tooManyRecent } = await import("@/lib/rate-limit.server");
    const ipHash = await getClientIpHash();
    if (ipHash && (await tooManyRecent("waitlist_signups", ipHash, 60, 10))) {
      throw new Error("Too many signups from this network. Please try again later.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base = {
      email: data.email.toLowerCase(),
      source: data.source ?? "site",
      interest: data.interest ?? null,
    };
    // Try with ip_hash; degrade to the bare row if the column isn't there yet.
    let { error } = await supabaseAdmin
      .from("waitlist_signups")
      .insert({ ...base, ip_hash: ipHash } as never);
    if (error && /ip_hash|column/i.test(error.message)) {
      ({ error } = await supabaseAdmin.from("waitlist_signups").insert(base));
    }
    if (error && !error.message.toLowerCase().includes("duplicate")) {
      throw new Error("Could not join waitlist. Please try again.");
    }
    return { ok: true };
  });

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  organization: z.string().trim().max(120).optional(),
  topic: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(2000),
  // Honeypot: real users never fill this hidden field; bots do.
  hp: z.string().trim().max(200).optional(),
});
export const submitContact = createServerFn({ method: "POST" })
  .validator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    // Silently accept honeypot hits so bots can't distinguish a rejection.
    if (data.hp) return { ok: true };

    const { getClientIpHash, tooManyRecent } = await import("@/lib/rate-limit.server");
    const ipHash = await getClientIpHash();
    if (ipHash && (await tooManyRecent("contact_messages", ipHash, 10, 5))) {
      throw new Error("Too many messages from this network. Please try again later.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base = {
      name: data.name,
      email: data.email.toLowerCase(),
      organization: data.organization ?? null,
      topic: data.topic ?? null,
      message: data.message,
    };
    // Try with ip_hash; degrade to the bare row if the column isn't there yet.
    let { error } = await supabaseAdmin
      .from("contact_messages")
      .insert({ ...base, ip_hash: ipHash } as never);
    if (error && /ip_hash|column/i.test(error.message)) {
      ({ error } = await supabaseAdmin.from("contact_messages").insert(base));
    }
    if (error) throw new Error("Could not send message. Please try again.");
    return { ok: true };
  });
