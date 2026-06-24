import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const urlOrEmpty = z
  .string()
  .trim()
  .max(500)
  .url("Must be a valid URL")
  .or(z.literal(""))
  .optional()
  .transform((v) => (v ? v : null));

const submissionSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80, "Max 80 characters"),
  tagline: z.string().trim().min(5, "Tagline is required").max(140, "Max 140 characters"),
  description: z
    .string()
    .trim()
    .min(20, "Add at least 20 characters")
    .max(2000, "Max 2000 characters"),
  category: z.string().trim().min(2).max(40),
  capabilities: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  website_url: urlOrEmpty,
  demo_url: urlOrEmpty,
  repo_url: urlOrEmpty,
  image_url: urlOrEmpty,
  contact_email: z.string().trim().email("Enter a valid email").max(255),
  pricing_notes: z.string().trim().max(280).nullable().optional(),
});

export type AgentSubmissionInput = z.input<typeof submissionSchema>;

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .trim()
      .replace(/['"`]+/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || `agent-${Date.now().toString(36)}`
  );
}

export const submitAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => submissionSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { error, data: row } = await context.supabase
      .from("agent_submissions")
      .insert({
        submitter_id: context.userId,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        category: data.category,
        capabilities: data.capabilities ?? [],
        website_url: data.website_url ?? null,
        demo_url: data.demo_url ?? null,
        repo_url: data.repo_url ?? null,
        image_url: data.image_url ?? null,
        contact_email: data.contact_email,
        pricing_notes: data.pricing_notes ?? null,
      } as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: row.id };
  });

export const listMySubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("agent_submissions")
      .select(
        "id, name, category, status, created_at, updated_at, review_notes, reviewed_at, published_agent_id",
      )
      .eq("submitter_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMySubmission = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("agent_submissions")
      .select("*")
      .eq("id", data.id)
      .eq("submitter_id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

const updateSchema = submissionSchema.extend({ id: z.string().uuid() });

export const updateMySubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ data, context }) => {
    // Only allow edits to pending or rejected submissions you own.
    const { data: existing, error: readErr } = await context.supabase
      .from("agent_submissions")
      .select("status, submitter_id")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!existing) throw new Error("Submission not found.");
    if (existing.submitter_id !== context.userId) throw new Error("Not your submission.");
    if (existing.status === "approved") {
      throw new Error("Approved submissions cannot be edited.");
    }

    const { error } = await context.supabase
      .from("agent_submissions")
      .update({
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        category: data.category,
        capabilities: data.capabilities ?? [],
        website_url: data.website_url ?? null,
        demo_url: data.demo_url ?? null,
        repo_url: data.repo_url ?? null,
        image_url: data.image_url ?? null,
        contact_email: data.contact_email,
        pricing_notes: data.pricing_notes ?? null,
        // Resubmission flips back to pending and clears reviewer state.
        status: "pending",
        review_notes: null,
        reviewed_at: null,
        reviewed_by: null,
      } as never)
      .eq("id", data.id)
      .eq("submitter_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Admin review queue ----------

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

export const adminListSubmissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("agent_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const reviewSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "approved", "rejected"]),
  review_notes: z.string().trim().max(1000).nullable().optional(),
});

export const adminReviewSubmission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => reviewSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Load the submission so we can publish it if approving.
    const { data: sub, error: readErr } = await supabaseAdmin
      .from("agent_submissions")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!sub) throw new Error("Submission not found.");

    let publishedAgentId: string | null = sub.published_agent_id ?? null;
    let publishedSlug: string | null = null;

    if (data.status === "approved") {
      if (publishedAgentId) {
        // Already published — fetch slug for the response.
        const { data: existing } = await supabaseAdmin
          .from("agents")
          .select("slug")
          .eq("id", publishedAgentId)
          .maybeSingle();
        publishedSlug = existing?.slug ?? null;
      } else {
        // Find a unique slug.
        const base = slugify(sub.name);
        let slug = base;
        for (let i = 2; i < 50; i++) {
          const { data: clash } = await supabaseAdmin
            .from("agents")
            .select("id")
            .eq("slug", slug)
            .maybeSingle();
          if (!clash) break;
          slug = `${base}-${i}`;
        }
        const { data: created, error: insErr } = await supabaseAdmin
          .from("agents")
          .insert({
            slug,
            name: sub.name,
            tagline: sub.tagline,
            description: sub.description,
            category: sub.category,
            capabilities: sub.capabilities ?? [],
            // Carry the submitter's screenshot/logo through to the live listing.
            image_url: (sub as { image_url?: string | null }).image_url ?? null,
            tier: "free",
            featured: false,
            active: true,
            status: "published",
          } as never)
          .select("id, slug")
          .single();
        if (insErr) throw new Error(insErr.message);
        publishedAgentId = created.id;
        publishedSlug = created.slug;
      }
    }

    const { error } = await supabaseAdmin
      .from("agent_submissions")
      .update({
        status: data.status,
        review_notes: data.review_notes ?? null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: context.userId,
        published_agent_id: publishedAgentId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true, publishedAgentId, publishedSlug };
  });
