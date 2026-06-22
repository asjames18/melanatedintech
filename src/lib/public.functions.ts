import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
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
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row, error } = await sb
      .from("agents")
      .select("*")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
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
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
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
});
export const joinWaitlist = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => waitlistSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("waitlist_signups").insert({
      email: data.email.toLowerCase(),
      source: data.source ?? "site",
      interest: data.interest ?? null,
    });
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
});
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert({
      name: data.name,
      email: data.email.toLowerCase(),
      organization: data.organization ?? null,
      topic: data.topic ?? null,
      message: data.message,
    });
    if (error) throw new Error("Could not send message. Please try again.");
    return { ok: true };
  });
