import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { SITE_URL } from "@/lib/site";

export const WEBSITE_LAUNCH_SEQUENCE_KEY = "website_launch_sprint_v1";
export const WEBSITE_LAUNCH_NURTURE_STEPS = [0, 1, 2, 3] as const;

const FROM = "Antonio at Melanated In Tech <hello@melanatedintech.com>";
const DAY_MS = 24 * 60 * 60 * 1000;

type NurtureEmail = {
  subject: string;
  preheader: string;
  text: string;
  html: string;
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char] ?? char);
}

function emailLayout(email: NurtureEmail, unsubscribeUrl: string) {
  const link = (href: string, label: string) =>
    `<a href="${escapeHtml(href)}" style="color:#8a5a2b;font-weight:700;">${escapeHtml(label)}</a>`;
  const body = email.html;
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#2b2118;line-height:1.6"><p style="color:#8b7a68;font-size:12px">${escapeHtml(email.preheader)}</p>${body}<p style="margin-top:28px">— Antonio<br><span style="color:#8b7a68;font-size:13px">Melanated In Tech · melanatedintech.com</span></p><p style="margin-top:24px;border-top:1px solid #e5dcd2;padding-top:12px;color:#8b7a68;font-size:12px">You received this because you requested the Website Launch Readiness Checklist. <a href="${escapeHtml(unsubscribeUrl)}" style="color:#8a5a2b">Unsubscribe</a> from these updates.</p></div>`;
}

function stepEmail(step: number): NurtureEmail {
  if (step === 0) {
    return {
      subject: "Your one-page website launch checklist",
      preheader: "Four things to prepare before you pay for a website.",
      text: `Thanks for requesting the Website Launch Readiness Checklist.\n\nA credible small-business website does not need to be complicated. It does need to make three things easy: understand what you do, trust that you are real, and take the next step on a phone.\n\n1. Write one clear sentence explaining who you help and what you help them do.\n2. Choose one primary action—call, request a quote, schedule, or send an inquiry.\n3. Gather your final logo, photos, service details, hours, contact information, and domain access.\n4. Confirm who can approve the copy and visual direction in one revision round.\n\nThe $997 Website Launch Sprint is a focused, mobile-first one-page landing page with an inquiry path, basic metadata, one consolidated revision, and a publish-ready handoff. Extra pages, custom functionality, third-party services, and unfinished copy are scoped separately.\n\nReview the Website Launch Sprint: ${SITE_URL}/work-with-us`,
      html: `<p style="font-size:18px;font-weight:700">Thanks for requesting the Website Launch Readiness Checklist.</p><p>A credible small-business website does not need to be complicated. It does need to make three things easy: understand what you do, trust that you are real, and take the next step on a phone.</p><ol><li>Write one clear sentence explaining who you help and what you help them do.</li><li>Choose one primary action—call, request a quote, schedule, or send an inquiry.</li><li>Gather your final logo, photos, service details, hours, contact information, and domain access.</li><li>Confirm who can approve the copy and visual direction in one revision round.</li></ol><p>The <strong>$997 Website Launch Sprint</strong> is a focused, mobile-first <strong>one-page landing page</strong> with an inquiry path, basic metadata, one consolidated revision, and a publish-ready handoff. Extra pages, custom functionality, third-party services, and unfinished copy are scoped separately.</p><p><a href="${SITE_URL}/work-with-us" style="display:inline-block;padding:12px 18px;background:#2b2118;color:#fff;text-decoration:none;font-weight:700">Review the Website Launch Sprint</a></p>`,
    };
  }
  if (step === 1) {
    return {
      subject: "What the $997 Website Launch Sprint is—and is not",
      preheader: "Clear scope is how a small website project stays on track.",
      text: `A low fixed price only works when the scope is honest.\n\nIncluded at $997:\n- One mobile-first landing page.\n- Your final copy, logo, and imagery placed into a clear page structure.\n- An inquiry form and basic page metadata.\n- One consolidated revision round.\n- A publish-ready handoff.\n\nScoped separately: additional pages, booking, payments, portals, databases, custom integrations, ongoing search marketing, content writing, third-party subscriptions, and additional revision cycles.\n\nSee whether your project is a fit: ${SITE_URL}/contact?topic=Website%20Launch%20Sprint%20inquiry`,
      html: `<p style="font-size:18px;font-weight:700">A low fixed price only works when the scope is honest.</p><p>The Website Launch Sprint is a focused route for a business that needs one clear, mobile-first page and a simple way for the right person to get in touch.</p><p><strong>Included at $997:</strong></p><ul><li>One mobile-first landing page.</li><li>Your final copy, logo, and imagery placed into a clear page structure.</li><li>An inquiry form and basic page metadata.</li><li>One consolidated revision round.</li><li>A publish-ready handoff.</li></ul><p><strong>Scoped separately:</strong> additional pages; booking, payments, portals, databases, custom integrations; ongoing search marketing; content writing; third-party subscriptions; and additional revision cycles.</p><p><a href="${SITE_URL}/contact?topic=Website%20Launch%20Sprint%20inquiry" style="display:inline-block;padding:12px 18px;background:#2b2118;color:#fff;text-decoration:none;font-weight:700">See whether your project is a fit</a></p>`,
    };
  }
  if (step === 2) {
    return {
      subject: "Can someone contact your business from a phone in 10 seconds?",
      preheader: "A simple self-check for your current website.",
      text: `Try this on a phone: open your current website and ask a first-time visitor to answer these questions quickly.\n\nWhat does this business do? Who is it for? What should I do next? How do I call, request a quote, or send an inquiry?\n\nA good launch page does not guarantee sales. It makes the basics easier: a clear value statement, useful service detail, visible trust signals, and one primary next step.\n\nRequest a Website Launch Sprint inquiry: ${SITE_URL}/contact?topic=Website%20Launch%20Sprint%20inquiry`,
      html: `<p style="font-size:18px;font-weight:700">Try this on a phone: open your current website and ask a first-time visitor to answer four questions quickly.</p><ul><li>What does this business do?</li><li>Who is it for?</li><li>What should I do next?</li><li>How do I call, request a quote, or send an inquiry?</li></ul><p>If the answers are not obvious without pinching, scrolling, or guessing, the site may be creating uncertainty before you speak with the prospect.</p><p>A good launch page does not guarantee sales. It makes the basics easier: a clear value statement, useful service detail, visible trust signals, and one primary next step.</p><p><a href="${SITE_URL}/contact?topic=Website%20Launch%20Sprint%20inquiry" style="display:inline-block;padding:12px 18px;background:#2b2118;color:#fff;text-decoration:none;font-weight:700">Request a Website Launch Sprint inquiry</a></p>`,
    };
  }
  return {
    subject: "Ready for a focused website launch plan?",
    preheader: "Tell us what you need to make clearer online.",
    text: `If your business needs one clear, mobile-friendly place where people can understand your work and contact you, the $997 Website Launch Sprint may be the right starting point.\n\nSend a short inquiry with what you do, who you serve, the action you want visitors to take, whether your final copy/logo/imagery/domain access are ready, and anything that makes the project more complex.\n\nWe will respond within two business days with fit and next steps. Larger work is scoped separately before implementation begins.\n\nAsk about the sprint: ${SITE_URL}/contact?topic=Website%20Launch%20Sprint%20inquiry`,
    html: `<p style="font-size:18px;font-weight:700">If your business needs one clear, mobile-friendly place where people can understand your work and contact you, the <strong>$997 Website Launch Sprint</strong> may be the right starting point.</p><p>Send a short inquiry with what you do, who you serve, the action you want visitors to take, whether your final copy, logo, imagery, and domain access are ready, and anything that makes the project more complex.</p><p>We will respond within two business days with fit and next steps. Larger work is scoped separately before implementation begins.</p><p><a href="${SITE_URL}/contact?topic=Website%20Launch%20Sprint%20inquiry" style="display:inline-block;padding:12px 18px;background:#2b2118;color:#fff;text-decoration:none;font-weight:700">Ask about the Website Launch Sprint</a></p>`,
  };
}

function unsubscribeToken(): string {
  return `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function ensureUnsubscribeToken(email: string): Promise<string> {
  const normalized = email.trim().toLowerCase();
  const existing = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", normalized)
    .maybeSingle();
  if (existing.data?.token) return existing.data.token;
  const token = unsubscribeToken();
  const { error } = await supabaseAdmin.from("email_unsubscribe_tokens").insert({
    email: normalized,
    token,
  });
  if (error && !/duplicate|unique/i.test(error.message)) throw new Error(error.message);
  if (error) {
    const retry = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalized)
      .single();
    if (retry.data?.token) return retry.data.token;
    throw new Error(error.message);
  }
  return token;
}

export async function enrollWebsiteLaunchNurture(waitlistSignupId: string): Promise<void> {
  const { error } = await supabaseAdmin.from("website_launch_nurture_enrollments").upsert(
    {
      waitlist_signup_id: waitlistSignupId,
      sequence_key: WEBSITE_LAUNCH_SEQUENCE_KEY,
      status: "paused",
      current_step: 0,
      next_send_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "waitlist_signup_id,sequence_key", ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}

export function buildNurturePayload(params: {
  enrollmentId: string;
  email: string;
  step: number;
  unsubscribeToken: string;
}) {
  const content = stepEmail(params.step);
  const unsubscribeUrl = `${SITE_URL}/unsubscribe?token=${encodeURIComponent(params.unsubscribeToken)}`;
  const messageId = `website_launch_nurture:${params.enrollmentId}:step:${params.step}`;
  return {
    to: params.email,
    from: FROM,
    subject: content.subject,
    html: emailLayout(content, unsubscribeUrl),
    text: `${content.text}\n\nUnsubscribe: ${unsubscribeUrl}`,
    label: `website_launch_nurture_${params.step + 1}`,
    purpose: "marketing",
    message_id: messageId,
    idempotency_key: messageId,
    nurture_enrollment_id: params.enrollmentId,
    unsubscribe_token: params.unsubscribeToken,
    queued_at: new Date().toISOString(),
  };
}

export function nextSendAtForStep(step: number, now = new Date()): string | null {
  if (step >= 3) return null;
  const offsets = [0, 3, 7, 12];
  return new Date(now.getTime() + offsets[step + 1] * DAY_MS).toISOString();
}
