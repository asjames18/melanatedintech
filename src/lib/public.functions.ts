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
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("agents")
    .select("id,slug,name,tagline,category,capabilities,tier,price_cents,image_url,featured")
    .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
    .order("featured", { ascending: false })
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getAgent = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const baseCols =
      "id,slug,name,tagline,description,category,capabilities,tier,price_cents,image_url,featured,model";
    // unlock_content / asset_path are revoked from anon and authenticated at the
    // column level, so this read goes through the service role and the status
    // filter below stands in for the row policy. The gated fields are used only
    // to derive has_fulfillment and are stripped before returning. Mirrors
    // getProduct below.
    const { data: row, error } = await supabaseAdmin
      .from("agents")
      .select(`${baseCols},unlock_content,asset_path,seller_profiles(id, display_name, slug)`)
      .eq("slug", data.slug)
      .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { unlock_content, asset_path, ...rest } = row as any;
    // Agent packs are owner-only; only expose whether a deliverable exists.
    return { ...rest, has_fulfillment: !!unlock_content || !!asset_path };
  });

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("articles")
    .select("id,slug,title,excerpt,category,read_minutes,published_at")
    .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
    .order("published_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const now = new Date().toISOString();
    const { data: row, error } = await sb
      .from("articles")
      .select("*")
      .eq("slug", data.slug)
      .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id,slug,name,tagline,category,tier,price_cents,image_url")
    .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const baseCols =
      "id,slug,name,tagline,description,category,tier,price_cents,image_url,active,created_at,updated_at";
    // unlock_content / asset_path are revoked from anon and authenticated at the
    // column level, so this read goes through the service role and the status
    // filter below stands in for the row policy. Free packs are returned to
    // everyone; premium content is stripped and only ever served by
    // getProductFulfillment to a verified owner.
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select(`${baseCols},unlock_content,asset_path,seller_profiles(id, display_name, slug)`)
      .eq("slug", data.slug)
      .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { unlock_content, asset_path, ...rest } = row as any;
    // The full pack is never returned from this public endpoint. Claiming one
    // requires an account (claimFreePack) so the library produces a named lead,
    // and delivery is getProductFulfillment's job — it checks the entitlement.
    // A public excerpt still ships, so the page has real content to index.
    const { buildPackPreview } = await import("@/lib/pack-preview");
    const { preview, truncated } = buildPackPreview(unlock_content);
    return {
      ...rest,
      has_fulfillment: !!unlock_content || !!asset_path,
      unlock_preview: preview || null,
      unlock_preview_truncated: truncated,
    };
  });

export const listServices = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const now = new Date().toISOString();
  const { data, error } = await sb
    .from("services")
    .select("id,slug,name,tagline,description,outcomes,starting_price_cents")
    .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
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
  .inputValidator((d: unknown) => waitlistSchema.parse(d))
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

    const { enqueueWelcomeEmail } = await import("@/lib/welcome-email.server");
    await enqueueWelcomeEmail(data.email);

    return { ok: true };
  });

const websiteChecklistSchema = z.object({
  email: z.string().trim().email().max(255),
  consent: z.literal(true),
  source: z.string().trim().max(80).optional(),
  // Honeypot: real users never fill this hidden field; bots do.
  hp: z.string().trim().max(200).optional(),
});

export const joinWebsiteLaunchChecklist = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => websiteChecklistSchema.parse(d))
  .handler(async ({ data }) => {
    if (data.hp) return { ok: true };

    const { getClientIpHash, tooManyRecent } = await import("@/lib/rate-limit.server");
    const ipHash = await getClientIpHash();
    if (ipHash && (await tooManyRecent("waitlist_signups", ipHash, 60, 10))) {
      throw new Error("Too many signups from this network. Please try again later.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const normalizedEmail = data.email.toLowerCase();
    const source = "website_launch_checklist";
    const row = {
      email: normalizedEmail,
      source,
      interest: "Website Launch Readiness Checklist",
      ip_hash: ipHash,
      marketing_consent: true,
      marketing_consent_at: new Date().toISOString(),
      marketing_consent_source: source,
      marketing_consent_version: "v1",
    };

    const { error } = await supabaseAdmin
      .from("waitlist_signups")
      .upsert(row, { onConflict: "email,source" });
    if (error) throw new Error("Could not save your checklist request. Please try again.");

    return { ok: true };
  });

const campaignValue = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9._-]+$/, "Campaign values may use letters, numbers, dots, underscores, and hyphens.")
  .optional();

const contactSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  organization: z.string().trim().max(120).optional(),
  topic: z.string().trim().max(80).optional(),
  message: z.string().trim().min(10).max(2000),
  // Store only short allowlisted campaign labels—not raw URLs or customer data.
  utm_source: campaignValue,
  utm_medium: campaignValue,
  utm_campaign: campaignValue,
  // Honeypot: real users never fill this hidden field; bots do.
  hp: z.string().trim().max(200).optional(),
});

export type ServiceInquiryType =
  | "general"
  | "ai_training"
  | "workflow_diagnostic"
  | "website_launch_sprint"
  | "custom_ai_system"
  | "custom_website_application"
  | "presentation_support";

export function classifyServiceInquiry(topic?: string): ServiceInquiryType {
  switch (topic) {
    case "AI Clarity Session inquiry":
      return "ai_training";
    case "AI Workflow Diagnostic inquiry":
      return "workflow_diagnostic";
    case "Website Launch Sprint inquiry":
      return "website_launch_sprint";
    case "Custom AI system inquiry":
      return "custom_ai_system";
    case "Custom website or application inquiry":
      return "custom_website_application";
    case "Presentation support inquiry":
      return "presentation_support";
    default:
      return "general";
  }
}

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => contactSchema.parse(d))
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
      inquiry_type: classifyServiceInquiry(data.topic),
      utm_source: data.utm_source ?? null,
      utm_medium: data.utm_medium ?? null,
      utm_campaign: data.utm_campaign ?? null,
    };
    // Try with ip_hash; degrade to the bare row if the column isn't there yet.
    let { error } = await supabaseAdmin.from("contact_messages").insert({ ...base, ip_hash: ipHash });
    if (error && /ip_hash|column/i.test(error.message)) {
      ({ error } = await supabaseAdmin.from("contact_messages").insert(base));
    }
    if (error) throw new Error("Could not send message. Please try again.");

    const { enqueueContactNotification } = await import("@/lib/welcome-email.server");
    await enqueueContactNotification({
      name: data.name,
      email: data.email,
      organization: data.organization,
      topic: data.topic,
      message: data.message,
    });

    return { ok: true, inquiryType: classifyServiceInquiry(data.topic) };
  });

export const getPublicSeller = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();

    const { data: seller, error: sellerError } = await supabaseAdmin
      .from("seller_profiles")
      .select("id, display_name, slug, bio, avatar_url, website_url")
      .eq("slug", data.slug)
      .maybeSingle();

    if (sellerError) throw new Error(sellerError.message);
    if (!seller) return null;

    const { data: agents, error: agentsError } = await supabaseAdmin
      .from("agents")
      .select("id, slug, name, tagline, category, capabilities, tier, price_cents, image_url, featured")
      .eq("seller_id", seller.id)
      .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      .order("name");

    if (agentsError) throw new Error(agentsError.message);

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, slug, name, tagline, category, tier, price_cents, image_url")
      .eq("seller_id", seller.id)
      .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      .order("name");

    if (productsError) throw new Error(productsError.message);

    const { data: services, error: servicesError } = await supabaseAdmin
      .from("services")
      .select("id, slug, name, tagline, description, outcomes, starting_price_cents")
      .eq("seller_id", seller.id)
      .or(`status.eq.published,and(status.eq.scheduled,scheduled_at.lte.${now})`)
      .order("name");

    if (servicesError) throw new Error(servicesError.message);

    return {
      seller,
      agents: agents ?? [],
      products: products ?? [],
      services: services ?? [],
    };
  });

