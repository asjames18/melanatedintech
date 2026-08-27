import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { getNurtureProcessorSecret, getSupabaseServiceRoleKey, getSupabaseUrl } from "@/integrations/supabase/env";
import {
  buildNurturePayload,
  ensureUnsubscribeToken,
  nextSendAtForStep,
  WEBSITE_LAUNCH_SEQUENCE_KEY,
} from "@/lib/website-launch-nurture.server";

const MAX_BATCH = 10;

type DueEnrollment = {
  id: string;
  waitlist_signup_id: string;
  current_step: number;
  waitlist_signups?: { email?: string; marketing_consent?: boolean; source?: string } | null;
};

async function processDue(supabase: SupabaseClient) {
  const now = new Date().toISOString();
  const { data: settings, error: settingsError } = await supabase
    .from("website_launch_nurture_settings")
    .select("enabled")
    .eq("id", 1)
    .single();
  if (settingsError) throw new Error(settingsError.message);
  if (!settings?.enabled) return { processed: 0, skipped: "paused" as const };

  const { data: due, error: dueError } = await supabase
    .from("website_launch_nurture_enrollments")
    .select("id,waitlist_signup_id,current_step,waitlist_signups!inner(email,marketing_consent,source)")
    .eq("sequence_key", WEBSITE_LAUNCH_SEQUENCE_KEY)
    .eq("status", "active")
    .gte("current_step", 1)
    .lte("next_send_at", now)
    .lt("current_step", 4)
    .or(`lease_until.is.null,lease_until.lt.${now}`)
    .order("next_send_at", { ascending: true })
    .limit(MAX_BATCH);
  if (dueError) throw new Error(dueError.message);

  let processed = 0;
  for (const candidate of (due ?? []) as DueEnrollment[]) {
    const leaseUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { data: claimed, error: claimError } = await supabase
      .from("website_launch_nurture_enrollments")
      .update({ lease_until: leaseUntil, updated_at: now })
      .eq("id", candidate.id)
      .eq("status", "active")
      .eq("current_step", candidate.current_step)
      .or(`lease_until.is.null,lease_until.lt.${now}`)
      .select("id")
      .maybeSingle();
    if (claimError || !claimed) continue;

    const email = candidate.waitlist_signups?.email?.trim().toLowerCase();
    const consented = candidate.waitlist_signups?.marketing_consent === true;
    if (!email || !consented || candidate.waitlist_signups?.source !== "website_launch_checklist") {
      await supabase
        .from("website_launch_nurture_enrollments")
        .update({ status: "suppressed", lease_until: null, next_send_at: null, last_error: "Consent or source no longer valid", updated_at: now })
        .eq("id", candidate.id);
      continue;
    }

    const { data: suppressed } = await supabase
      .from("suppressed_emails")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (suppressed) {
      await supabase
        .from("website_launch_nurture_enrollments")
        .update({ status: "suppressed", lease_until: null, next_send_at: null, updated_at: now })
        .eq("id", candidate.id);
      continue;
    }

    try {
      const token = await ensureUnsubscribeToken(email);
      const payload = buildNurturePayload({
        enrollmentId: candidate.id,
        email,
        step: candidate.current_step,
        unsubscribeToken: token,
      });
      const { error: queueError } = await supabase.rpc("enqueue_email", {
        queue_name: "transactional_emails",
        payload,
      });
      if (queueError) throw new Error(queueError.message);

      const nextStep = candidate.current_step + 1;
      await supabase
        .from("website_launch_nurture_enrollments")
        .update({
          status: nextStep >= 4 ? "completed" : "active",
          current_step: nextStep,
          next_send_at: nextSendAtForStep(candidate.current_step),
          last_sent_at: now,
          completed_at: nextStep >= 4 ? now : null,
          lease_until: null,
          last_error: null,
          updated_at: now,
        })
        .eq("id", candidate.id);
      processed++;
    } catch (error) {
      await supabase
        .from("website_launch_nurture_enrollments")
        .update({ lease_until: null, last_error: String(error).slice(0, 500), updated_at: now })
        .eq("id", candidate.id);
    }
  }
  return { processed };
}

export const Route = createFileRoute("/lovable/email/nurture/process")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const serviceKey = getSupabaseServiceRoleKey();
        const processorSecret = getNurtureProcessorSecret();
        const supabaseUrl = getSupabaseUrl();
        if (!serviceKey || !processorSecret || !supabaseUrl) return Response.json({ error: "Server configuration error" }, { status: 500 });
        const authorization = request.headers.get("Authorization");
        if (authorization !== `Bearer ${processorSecret}`) return Response.json({ error: "Unauthorized" }, { status: 401 });
        const supabase = createClient(supabaseUrl, serviceKey);
        try {
          return Response.json(await processDue(supabase));
        } catch (error) {
          console.error("Website launch nurture processing failed", error);
          return Response.json({ error: "Nurture processing failed" }, { status: 500 });
        }
      },
    },
  },
});
