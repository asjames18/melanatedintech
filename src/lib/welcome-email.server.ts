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
    'And if you\'re at the "we need a real plan" stage, the Agent Strategy Sprint is a two-week engagement at a fixed $1,500: ' +
      `${SITE_URL}/strategy-sprint`,
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

    const { error } = await supabaseAdmin.rpc(
      "enqueue_email" as never,
      {
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
      } as never,
    );
    if (error) console.error("Welcome email enqueue failed", error);
  } catch (e) {
    console.error("Welcome email enqueue failed", e);
  }
}

export async function enqueueContactNotification(contact: {
  name: string;
  email: string;
  organization?: string | null;
  topic?: string | null;
  message: string;
}): Promise<void> {
  try {
    const adminEmail =
      process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "melanatedintech@proton.me";
    const messageId = `contact_notification:${Date.now()}:${contact.email}`;

    const textContent = [
      `New contact submission on Melanated In Tech:`,
      ``,
      `Name: ${contact.name}`,
      `Email: ${contact.email}`,
      contact.organization ? `Organization: ${contact.organization}` : null,
      contact.topic ? `Topic: ${contact.topic}` : null,
      ``,
      `Message:`,
      contact.message,
    ]
      .filter(Boolean)
      .join("\n");

    const htmlContent = `
      <div style="font-family:sans-serif;max-width:560px;padding:16px;">
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> <a href="mailto:${contact.email}">${contact.email}</a></p>
        ${contact.organization ? `<p><strong>Organization:</strong> ${contact.organization}</p>` : ""}
        ${contact.topic ? `<p><strong>Topic:</strong> ${contact.topic}</p>` : ""}
        <hr style="margin:16px 0;border:none;border-top:1px solid #ddd;" />
        <p><strong>Message:</strong></p>
        <p style="white-space:pre-wrap;background:#f5f2ee;padding:12px;border-radius:6px;">${contact.message}</p>
      </div>
    `;

    const { error } = await supabaseAdmin.rpc(
      "enqueue_email" as never,
      {
        queue_name: "transactional_emails",
        payload: {
          to: adminEmail,
          from: FROM,
          subject: `[Contact Form] ${contact.name} - ${contact.topic || "Inquiry"}`,
          html: htmlContent,
          text: textContent,
          label: "contact_notification",
          purpose: "transactional",
          message_id: messageId,
          queued_at: new Date().toISOString(),
        },
      } as never,
    );
    if (error) console.error("Contact notification email enqueue failed", error);
  } catch (e) {
    console.error("Contact notification email enqueue failed", e);
  }
}

export async function enqueueServiceLeadNotification(lead: {
  leadId: string;
  contact_name: string;
  email: string;
  phone: string;
  business_name: string;
  website?: string;
  industry: string;
  service_model: string;
  team_size: string;
  locations: number;
  current_tools?: string;
  monthly_volume: string;
  primary_leak: string;
  desired_outcome: string;
  urgency: string;
  budget_range: string;
}): Promise<void> {
  try {
    const safe = (value: unknown) =>
      String(value ?? "").replace(
        /[&<>"']/g,
        (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
      );
    const adminEmail =
      process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "melanatedintech@proton.me";
    const messageId = `service_lead:${lead.leadId}`;
    const rows = [
      ["Contact", lead.contact_name],
      ["Email", lead.email],
      ["Phone", lead.phone],
      ["Business", lead.business_name],
      ["Industry", lead.industry],
      ["System", lead.service_model],
      ["Team", lead.team_size],
      ["Locations", lead.locations],
      ["Monthly volume", lead.monthly_volume],
      ["Primary leak", lead.primary_leak],
      ["Urgency", lead.urgency],
      ["Budget", lead.budget_range],
      ["Current tools", lead.current_tools || "Not provided"],
      ["Website", lead.website || "Not provided"],
      ["Desired outcome", lead.desired_outcome],
    ];
    const textContent = [
      "New recovery system lead",
      "",
      ...rows.map(([label, value]) => `${label}: ${value}`),
    ].join("\n");
    const htmlContent = `<div style="font-family:sans-serif;max-width:620px;padding:20px"><h2>New Recovery System Lead</h2>${rows.map(([label, value]) => `<p><strong>${safe(label)}:</strong> ${safe(value)}</p>`).join("")}<p><a href="https://melanatedintech.com/admin/leads">Open lead pipeline</a></p></div>`;
    const payload = {
      to: adminEmail,
      from: process.env.RESEND_FROM_EMAIL || FROM,
      subject: `[Recovery Lead] ${lead.business_name} — ${lead.service_model}`,
      html: htmlContent,
      text: textContent,
      label: "service_lead_notification",
      purpose: "transactional",
      message_id: messageId,
      idempotency_key: messageId,
      queued_at: new Date().toISOString(),
    };

    // Lead alerts are time-sensitive. Send immediately when Resend is configured;
    // retain the durable pgmq pipeline below as a fallback for provider/network failures.
    const resendApiKey = process.env.RESEND_API_KEY?.trim();
    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": messageId,
          },
          body: JSON.stringify({
            from: payload.from,
            to: payload.to,
            subject: payload.subject,
            html: payload.html,
            text: payload.text,
          }),
        });

        if (!response.ok) {
          throw new Error(`Resend returned HTTP ${response.status}`);
        }

        const { error: logError } = await supabaseAdmin.from("email_send_log" as never).insert({
          message_id: messageId,
          template_name: payload.label,
          recipient_email: adminEmail,
          status: "sent",
        } as never);
        if (logError) console.error("Service lead notification log failed", logError);
        return;
      } catch (directError) {
        console.error("Immediate service lead notification failed; queueing fallback", directError);
      }
    }

    const { error } = await supabaseAdmin.rpc(
      "enqueue_email" as never,
      {
        queue_name: "transactional_emails",
        payload,
      } as never,
    );
    if (error) console.error("Service lead notification enqueue failed", error);
  } catch (error) {
    console.error("Service lead notification enqueue failed", error);
  }
}

export async function sendInvoiceDeliveryEmail(params: {
  invoiceNumber: string;
  publicAccessToken: string;
  clientName: string;
  clientEmail: string;
  clientOrganization?: string | null;
  title: string;
  totalCents: number;
  amountDueCents: number;
  paymentLabel: "50% deposit" | "final balance";
  idempotencyVersion: string;
  dueDate?: string | null;
  customerNote?: string | null;
}): Promise<"sent" | "queued"> {
  const safe = (value: unknown) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]!,
    );
  const money = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
  const invoiceUrl = `${SITE_URL}/invoice/${encodeURIComponent(params.invoiceNumber)}?token=${encodeURIComponent(params.publicAccessToken)}`;
  const messageId = `invoice_delivery:${params.invoiceNumber}:${params.idempotencyVersion}:${Date.now()}`;
  const dueLine = params.dueDate ? `Due date: ${params.dueDate}` : null;
  const subject = `Invoice ${params.invoiceNumber} — ${params.title}`.replace(/[\r\n]+/g, " ");
  const text = [
    `Hi ${params.clientName},`,
    "",
    `Your invoice for ${params.title} is ready to review.`,
    `Invoice: ${params.invoiceNumber}`,
    `Project total: ${money(params.totalCents)}`,
    `${params.paymentLabel === "50% deposit" ? "Deposit due" : "Final balance due"}: ${money(params.amountDueCents)}`,
    dueLine,
    "",
    `Review the invoice and complete payment: ${invoiceUrl}`,
    params.customerNote ? "" : null,
    params.customerNote ? "A note from Melanated In Tech:" : null,
    params.customerNote || null,
    "",
    "Third-party software and usage costs are billed separately unless the invoice states otherwise. No revenue outcome is guaranteed.",
    "",
    "— Melanated In Tech",
  ]
    .filter(Boolean)
    .join("\n");
  const html = `
    <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#2b2118;line-height:1.6">
      <p>Hi ${safe(params.clientName)},</p>
      <h2 style="margin-bottom:8px">Your invoice is ready</h2>
      <p style="margin-top:0">Review the scope and complete your ${safe(params.paymentLabel)} when you are ready.</p>
      <div style="margin:24px 0;padding:18px;border:1px solid #e5dcd2;border-radius:12px;background:#faf8f5">
        <p style="margin:4px 0"><strong>Invoice:</strong> ${safe(params.invoiceNumber)}</p>
        <p style="margin:4px 0"><strong>Project:</strong> ${safe(params.title)}</p>
        ${params.clientOrganization ? `<p style="margin:4px 0"><strong>Business:</strong> ${safe(params.clientOrganization)}</p>` : ""}
        <p style="margin:4px 0"><strong>Project total:</strong> ${safe(money(params.totalCents))}</p>
        <p style="margin:4px 0"><strong>${params.paymentLabel === "50% deposit" ? "Deposit due" : "Final balance due"}:</strong> ${safe(money(params.amountDueCents))}</p>
        ${params.dueDate ? `<p style="margin:4px 0"><strong>Due date:</strong> ${safe(params.dueDate)}</p>` : ""}
      </div>
      <p><a href="${invoiceUrl}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#2b2118;color:#fff;text-decoration:none;font-weight:700">Review invoice and pay ${safe(params.paymentLabel)}</a></p>
      <p style="margin:10px 0 24px;color:#75685c;font-size:12px">If the button does not open, copy this link:<br/><a href="${invoiceUrl}" style="color:#8a5a2b;word-break:break-all">${invoiceUrl}</a></p>
      ${params.customerNote ? `<div style="margin:24px 0;padding:16px;border-left:4px solid #8a5a2b;background:#faf8f5"><strong>Additional note from Melanated In Tech</strong><p style="margin:8px 0 0;white-space:pre-wrap">${safe(params.customerNote)}</p></div>` : ""}
      <p style="margin-top:24px;color:#75685c;font-size:12px">Third-party software and usage costs are billed separately unless the invoice states otherwise. No revenue outcome is guaranteed.</p>
    </div>`;
  const payload = {
    to: params.clientEmail,
    from: process.env.RESEND_FROM_EMAIL || FROM,
    subject,
    html,
    text,
    label: "invoice_delivery",
    purpose: "transactional",
    message_id: messageId,
    idempotency_key: messageId,
    queued_at: new Date().toISOString(),
  };

  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": messageId,
        },
        body: JSON.stringify({
          from: payload.from,
          to: payload.to,
          subject: payload.subject,
          html: payload.html,
          text: payload.text,
        }),
      });
      if (!response.ok) throw new Error(`Resend returned HTTP ${response.status}`);

      const { error: logError } = await supabaseAdmin.from("email_send_log" as never).insert({
        message_id: messageId,
        template_name: payload.label,
        recipient_email: params.clientEmail,
        status: "sent",
      } as never);
      if (logError) console.error("Invoice delivery email log failed", logError);
      return "sent";
    } catch (error) {
      console.error("Immediate invoice delivery failed; queueing fallback", error);
    }
  }

  const { error } = await supabaseAdmin.rpc(
    "enqueue_email" as never,
    { queue_name: "transactional_emails", payload } as never,
  );
  if (error) throw new Error("Invoice email could not be sent or queued.");
  return "queued";
}

export async function enqueueInvoicePaymentNotifications(params: {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  paymentType: "deposit" | "final";
  amountPaidCents: number;
  serviceType: string;
  title: string;
}): Promise<void> {
  try {
    const adminEmail =
      process.env.ADMIN_EMAILS?.split(",")[0]?.trim() || "melanatedintech@proton.me";
    const formattedAmount = (params.amountPaidCents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
    const paymentLabel = params.paymentType === "deposit" ? "50% Deposit" : "Final 50% Balance";

    // 1. Send receipt to Client
    const clientMessageId = `invoice_receipt:${params.invoiceNumber}:${params.paymentType}`;
    const clientSubject = `Payment Confirmation for Invoice ${params.invoiceNumber} (${paymentLabel})`;
    const clientHtml = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#2b2118;line-height:1.6;">
        <h2 style="color:#8a5a2b;margin-bottom:8px;">Melanated in Tech</h2>
        <p style="font-size:16px;font-weight:600;margin-top:0;">Payment Receipt</p>
        <p>Hi ${params.clientName},</p>
        <p>Thank you for your payment! We have received your <strong>${paymentLabel}</strong> of <strong>${formattedAmount}</strong> for <strong>${params.title}</strong> (${params.invoiceNumber}).</p>
        
        <div style="background:#f5f2ee;border-radius:8px;padding:16px;margin:20px 0;">
          <p style="margin:4px 0;"><strong>Invoice Number:</strong> ${params.invoiceNumber}</p>
          <p style="margin:4px 0;"><strong>Service:</strong> ${params.serviceType}</p>
          <p style="margin:4px 0;"><strong>Payment Type:</strong> ${paymentLabel}</p>
          <p style="margin:4px 0;"><strong>Amount Paid:</strong> ${formattedAmount}</p>
        </div>

        <p>${params.paymentType === "deposit" ? "We are now starting work on your project and will keep you updated on progress!" : "Thank you for working with Melanated in Tech — it has been a pleasure partnering with you!"}</p>
        
        <p style="margin-top:24px;">Warm regards,<br/><strong>Antonio</strong><br/><span style="color:#8b7a68;font-size:13px;">Melanated in Tech · melanatedintech.com</span></p>
      </div>
    `;

    await supabaseAdmin.rpc(
      "enqueue_email" as never,
      {
        queue_name: "transactional_emails",
        payload: {
          to: params.clientEmail,
          from: FROM,
          subject: clientSubject,
          html: clientHtml,
          label: "invoice_client_receipt",
          purpose: "transactional",
          message_id: clientMessageId,
          queued_at: new Date().toISOString(),
        },
      } as never,
    );

    // 2. Send alert to Admin (Antonio)
    const adminMessageId = `invoice_admin_alert:${params.invoiceNumber}:${params.paymentType}`;
    const adminSubject = `💰 Payment Received: ${formattedAmount} for ${params.invoiceNumber} (${params.clientName})`;
    const adminHtml = `
      <div style="font-family:sans-serif;max-width:560px;padding:16px;">
        <h2 style="color:#8a5a2b;">💰 Payment Received!</h2>
        <p><strong>Invoice:</strong> ${params.invoiceNumber}</p>
        <p><strong>Client:</strong> ${params.clientName} (&lt;${params.clientEmail}&gt;)</p>
        <p><strong>Service:</strong> ${params.serviceType} — ${params.title}</p>
        <p><strong>Payment:</strong> ${paymentLabel} (${formattedAmount})</p>
        <p style="margin-top:16px;">View invoice details at: <a href="${SITE_URL}/invoice/${params.invoiceNumber}">${SITE_URL}/invoice/${params.invoiceNumber}</a></p>
      </div>
    `;

    await supabaseAdmin.rpc(
      "enqueue_email" as never,
      {
        queue_name: "transactional_emails",
        payload: {
          to: adminEmail,
          from: FROM,
          subject: adminSubject,
          html: adminHtml,
          label: "invoice_admin_alert",
          purpose: "transactional",
          message_id: adminMessageId,
          queued_at: new Date().toISOString(),
        },
      } as never,
    );
  } catch (e) {
    console.error("Invoice payment notification failed", e);
  }
}
