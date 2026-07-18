// Enqueues the one-time welcome email for new waitlist signups.
// Rides the existing pgmq -> /lovable/email/queue/process -> Resend pipeline.
// Fire-and-forget: a failure here must never break the signup itself.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SITE_URL } from "@/lib/site";

const FROM = "Antonio at Melanated In Tech <hello@melanatedintech.com>";

function welcomeText() {
  return [
    "Hey — Antonio here, founder of Melanated In Tech.",
    "",
    "You're on the list. Here's what that means: when something genuinely worth your time drops — a new agent, a playbook, an early price — you hear about it first. No spam, no daily blasts.",
    "",
    "While you're here, three free things people get the most out of:",
    "",
    `1. Your personalized AI Playbook — type what you do, get prompts built for your business: ${SITE_URL}/tools/ai-playbook`,
    `2. The Knowledge Hub — plain-English guides for putting AI agents to work: ${SITE_URL}/knowledge`,
    `3. The Fit Finder — five questions to find your first useful agent: ${SITE_URL}/fit-finder`,
    "",
    "And if you're at the \"we need a real plan\" stage, the Agent Strategy Sprint is a two-week engagement at a fixed $1,500: " + `${SITE_URL}/strategy-sprint`,
    "",
    "Got a question or a workflow you're wrestling with? Just reply — I read these.",
    "",
    "— Antonio",
    "Melanated In Tech · melanatedintech.com",
    "",
    "Don't want emails from us? Reply with \"unsubscribe\" and you're out, no hard feelings.",
  ].join("\n");
}

function welcomeHtml() {
  const link = (href: string, label: string) =>
    `<a href="${href}" style="color:#8a5a2b;font-weight:600;">${label}</a>`;
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#2b2118;line-height:1.6;">
    <p style="font-size:18px;font-weight:700;">Hey — Antonio here, founder of Melanated In Tech.</p>
    <p>You're on the list. Here's what that means: when something genuinely worth your time drops — a new agent, a playbook, an early price — you hear about it first. No spam, no daily blasts.</p>
    <p style="font-weight:600;">While you're here, three free things people get the most out of:</p>
    <ol style="padding-left:20px;">
      <li style="margin-bottom:8px;">${link(`${SITE_URL}/tools/ai-playbook`, "Your personalized AI Playbook")} — type what you do, get prompts built for your business.</li>
      <li style="margin-bottom:8px;">${link(`${SITE_URL}/knowledge`, "The Knowledge Hub")} — plain-English guides for putting AI agents to work.</li>
      <li style="margin-bottom:8px;">${link(`${SITE_URL}/fit-finder`, "The Fit Finder")} — five questions to find your first useful agent.</li>
    </ol>
    <p>And if you're at the "we need a real plan" stage, the ${link(`${SITE_URL}/strategy-sprint`, "Agent Strategy Sprint")} is a two-week engagement at a fixed $1,500.</p>
    <p>Got a question or a workflow you're wrestling with? Just reply — I read these.</p>
    <p style="margin-top:24px;">— Antonio<br/><span style="color:#8b7a68;font-size:13px;">Melanated In Tech · melanatedintech.com</span></p>
    <p style="margin-top:24px;border-top:1px solid #e5dcd2;padding-top:12px;color:#8b7a68;font-size:12px;">Don't want emails from us? Reply with "unsubscribe" and you're out, no hard feelings.</p>
  </div>`;
}

export async function enqueueWelcomeEmail(rawEmail: string): Promise<void> {
  try {
    const email = rawEmail.trim().toLowerCase();
    if (!email) return;
    const messageId = `waitlist_welcome:${email}`;

    // One welcome per address, ever — skip if we've already sent (or queued) it.
    const { data: existing } = await supabaseAdmin
      .from("email_send_log" as never)
      .select("id")
      .eq("message_id" as never, messageId)
      .limit(1)
      .maybeSingle();
    if (existing) return;

    const { error } = await supabaseAdmin.rpc("enqueue_email" as never, {
      queue_name: "transactional_emails",
      payload: {
        to: email,
        from: FROM,
        subject: "You're in — start with your free AI Playbook",
        html: welcomeHtml(),
        text: welcomeText(),
        label: "waitlist_welcome",
        purpose: "transactional",
        message_id: messageId,
        idempotency_key: messageId,
        queued_at: new Date().toISOString(),
      },
    } as never);
    if (error) console.error("Welcome email enqueue failed", error);
  } catch (e) {
    console.error("Welcome email enqueue failed", e);
  }
}
