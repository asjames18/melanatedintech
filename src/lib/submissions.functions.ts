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
  name: z.string().trim().min(2, "Required").max(80),
  tagline: z.string().trim().min(5, "Required").max(140),
  description: z.string().trim().min(20, "Tell us more").max(2000),
  category: z.string().trim().min(2).max(40),
  capabilities: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
  website_url: urlOrEmpty,
  demo_url: urlOrEmpty,
  repo_url: urlOrEmpty,
  contact_email: z.string().trim().email("Invalid email").max(255),
  pricing_notes: z.string().trim().max(280).nullable().optional(),
});

export type AgentSubmissionInput = z.input<typeof submissionSchema>;

export const submitAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => submissionSchema.parse(d))
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
        contact_email: data.contact_email,
        pricing_notes: data.pricing_notes ?? null,
      })
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
      .select("id, name, category, status, created_at, review_notes")
      .eq("submitter_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
