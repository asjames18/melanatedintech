import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const serviceModelSchema = z.enum([
  "revenue-recovery",
  "estimate-recovery",
  "route-retention",
  "client-recovery",
]);
export const leadStatusSchema = z.enum([
  "new",
  "reviewing",
  "qualified",
  "demo_sent",
  "proposal_sent",
  "deposit_pending",
  "won",
  "lost",
]);

const optionalText = (max: number) => z.string().trim().max(max).optional();
const serviceLeadSchema = z.object({
  contact_name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(30),
  business_name: z.string().trim().min(2).max(150),
  website: z.union([z.string().trim().url().max(300), z.literal("")]).optional(),
  industry: z.string().trim().min(2).max(100),
  service_model: serviceModelSchema,
  team_size: z.enum(["2-5", "6-10", "11-20", "outside-range"]),
  locations: z.number().int().min(1).max(100),
  current_tools: optionalText(300),
  monthly_volume: z.enum(["under-50", "50-149", "150-499", "500-plus", "unsure"]),
  primary_leak: z.string().trim().min(3).max(200),
  desired_outcome: z.string().trim().min(10).max(1000),
  urgency: z.enum(["within-30-days", "1-3-months", "researching"]),
  budget_range: z.enum(["1500-2499", "2500-4999", "5000-plus", "not-sure"]),
  consent: z.literal(true),
  source: optionalText(80),
  campaign: optionalText(120),
  landing_path: optionalText(200),
  hp: optionalText(200),
});

export type ServiceLeadInput = z.infer<typeof serviceLeadSchema>;
export type ServiceLeadStatus = z.infer<typeof leadStatusSchema>;

export type ServiceLeadRecord = Omit<ServiceLeadInput, "consent" | "hp" | "website"> & {
  id: string;
  website: string | null;
  consent_at: string;
  status: ServiceLeadStatus;
  assigned_owner: string | null;
  admin_notes: string | null;
  invoice_number: string | null;
  created_at: string;
  updated_at: string;
};

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin role required.");
}

export const submitServiceLead = createServerFn({ method: "POST" })
  .inputValidator((value: unknown) => serviceLeadSchema.parse(value))
  .handler(async ({ data }) => {
    if (data.hp) return { ok: true, serviceModel: data.service_model };
    const { getClientIpHash, tooManyRecent } = await import("@/lib/rate-limit.server");
    const ipHash = await getClientIpHash();
    if (ipHash && (await tooManyRecent("service_system_leads", ipHash, 30, 4))) {
      throw new Error("Too many requests from this network. Please try again later.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const duplicateSince = new Date(Date.now() - 10 * 60_000).toISOString();
    const { data: duplicate } = await supabaseAdmin
      .from("service_system_leads" as never)
      .select("id")
      .eq("email" as never, data.email.toLowerCase())
      .gte("created_at" as never, duplicateSince)
      .maybeSingle();
    if (duplicate) return { ok: true, serviceModel: data.service_model };

    const row = {
      contact_name: data.contact_name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      business_name: data.business_name,
      website: data.website || null,
      industry: data.industry,
      service_model: data.service_model,
      team_size: data.team_size,
      locations: data.locations,
      current_tools: data.current_tools || null,
      monthly_volume: data.monthly_volume,
      primary_leak: data.primary_leak,
      desired_outcome: data.desired_outcome,
      urgency: data.urgency,
      budget_range: data.budget_range,
      consent_at: now,
      source: data.source || "direct_or_other",
      campaign: data.campaign || null,
      landing_path: data.landing_path || "/get-a-demo",
      ip_hash: ipHash,
      status: "new",
    };
    const { data: inserted, error } = await supabaseAdmin
      .from("service_system_leads" as never)
      .insert(row as never)
      .select("id")
      .single();
    if (error) {
      console.error("Service lead insert failed", error);
      throw new Error("We could not save your request. Please try again.");
    }

    await supabaseAdmin.from("service_system_lead_events" as never).insert({
      lead_id: (inserted as { id: string }).id,
      event_type: "submitted",
      metadata: { service_model: data.service_model, source: row.source },
    } as never);
    const { enqueueServiceLeadNotification } = await import("@/lib/welcome-email.server");
    await enqueueServiceLeadNotification({ ...data, leadId: (inserted as { id: string }).id });
    return { ok: true, serviceModel: data.service_model };
  });

// ---------- Paid diagnostic intake ----------

/**
 * The diagnostic is a fifth service_model on this pipeline rather than a table of
 * its own. Kept out of `serviceModelSchema` on purpose: the public /get-a-demo
 * form must not be able to file a lead as an already-paid diagnostic.
 */
export const DIAGNOSTIC_SERVICE_MODEL = "revenue-leak-diagnostic";

const diagnosticIntakeSchema = z.object({
  contact_name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(30),
  business_name: z.string().trim().min(2).max(150),
  website: z.union([z.string().trim().url().max(300), z.literal("")]).optional(),
  industry: z.string().trim().min(2).max(100),
  monthly_volume: z.enum(["under-50", "50-149", "150-499", "500-plus", "unsure"]),
  current_tools: optionalText(300),
  primary_leak: z.string().trim().min(3).max(200),
  desired_outcome: z.string().trim().min(10).max(1000),
});

/**
 * Qualification intake collected on /diagnostic/success, after payment clears.
 *
 * Gated on the caller actually owning the diagnostic — this runs post-purchase,
 * so entitlement is the authorization, not a rate limit. Idempotent: re-submitting
 * updates the existing lead rather than creating a second one, because the buyer
 * can revisit the success page from their email at any time.
 */
export const submitDiagnosticIntake = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => diagnosticIntakeSchema.parse(value))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Only a buyer may file diagnostic intake. Environment is not constrained:
    // a sandbox purchase should still produce a lead while testing the funnel.
    const { data: entitlement } = await supabaseAdmin
      .from("user_entitlements")
      .select("id")
      .eq("user_id", context.userId)
      .eq("kind", "product")
      .eq("slug", DIAGNOSTIC_SERVICE_MODEL)
      .limit(1)
      .maybeSingle();
    if (!entitlement) {
      throw new Error("We could not find your diagnostic purchase on this account.");
    }

    const {
      data: { user },
    } = await context.supabase.auth.getUser();
    const email = user?.email?.toLowerCase();
    if (!email) throw new Error("Your account has no email address on file.");

    const now = new Date().toISOString();
    const row = {
      contact_name: data.contact_name,
      email,
      phone: data.phone,
      business_name: data.business_name,
      website: data.website || null,
      industry: data.industry,
      service_model: DIAGNOSTIC_SERVICE_MODEL,
      monthly_volume: data.monthly_volume,
      current_tools: data.current_tools || null,
      primary_leak: data.primary_leak,
      desired_outcome: data.desired_outcome,
      consent_at: now,
      updated_at: now,
      // Sales-qualification fields are NOT NULL on this table but meaningless for
      // someone who has already paid. Fixed, honest values rather than questions
      // we make a paying customer answer.
      team_size: "2-5",
      locations: 1,
      urgency: "within-30-days",
      budget_range: "not-sure",
      // They bought. This lead enters the pipeline already won.
      status: "won",
      source: "diagnostic_purchase",
      landing_path: "/diagnostic/success",
    };

    const { data: existing } = await supabaseAdmin
      .from("service_system_leads" as never)
      .select("id")
      .eq("email" as never, email)
      .eq("service_model" as never, DIAGNOSTIC_SERVICE_MODEL)
      .maybeSingle();

    let leadId: string;
    if (existing) {
      leadId = (existing as { id: string }).id;
      const { error } = await supabaseAdmin
        .from("service_system_leads" as never)
        .update(row as never)
        .eq("id" as never, leadId);
      if (error) {
        console.error("[diagnostic-intake] update failed", error);
        throw new Error("We could not save your details. Please try again.");
      }
    } else {
      const { data: inserted, error } = await supabaseAdmin
        .from("service_system_leads" as never)
        .insert(row as never)
        .select("id")
        .single();
      if (error) {
        console.error("[diagnostic-intake] insert failed", error);
        throw new Error("We could not save your details. Please try again.");
      }
      leadId = (inserted as { id: string }).id;
    }

    try {
      await supabaseAdmin.from("service_system_lead_events" as never).insert({
        lead_id: leadId,
        event_type: "diagnostic_intake_submitted",
        metadata: { industry: data.industry, monthly_volume: data.monthly_volume },
      } as never);
    } catch (error) {
      // The lead is saved; event-log telemetry must never fail the submission a
      // paying customer just made.
      console.error("[diagnostic-intake] event log failed", error);
    }

    return { ok: true };
  });

export const adminListServiceLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("service_system_leads" as never)
      .select("*")
      .order("created_at" as never, { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as ServiceLeadRecord[];
  });

const updateLeadSchema = z.object({
  id: z.string().uuid(),
  status: leadStatusSchema,
  assigned_owner: optionalText(120),
  admin_notes: optionalText(2000),
  invoice_number: optionalText(80),
});

export const adminUpdateServiceLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((value: unknown) => updateLeadSchema.parse(value))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.invoice_number) {
      const { data: invoice } = await supabaseAdmin
        .from("client_invoices" as never)
        .select("invoice_number")
        .eq("invoice_number" as never, data.invoice_number)
        .maybeSingle();
      if (!invoice) throw new Error("Invoice number was not found.");
    }
    const update = {
      status: data.status,
      assigned_owner: data.assigned_owner || null,
      admin_notes: data.admin_notes || null,
      invoice_number: data.invoice_number || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin
      .from("service_system_leads" as never)
      .update(update as never)
      .eq("id" as never, data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("service_system_lead_events" as never).insert({
      lead_id: data.id,
      event_type: "status_changed",
      metadata: { status: data.status, has_invoice: !!data.invoice_number },
      created_by: context.userId,
    } as never);
    return { ok: true };
  });
