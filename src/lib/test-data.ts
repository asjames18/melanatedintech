/**
 * Single source of truth helper for identifying test records in Melanated In Tech admin dashboard.
 */

export function isTestEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (
    normalized.endsWith("@example.com") ||
    normalized.endsWith("@example.org") ||
    normalized.endsWith("@example.net")
  ) {
    return true;
  }
  const localPart = normalized.split("@")[0] || "";
  if (
    localPart.startsWith("codex-") ||
    localPart.startsWith("mit.audit") ||
    localPart.startsWith("mit.qa") ||
    localPart.includes("firsttimer") ||
    localPart.includes("battletest")
  ) {
    return true;
  }
  return false;
}

export function isTestStripeSession(sessionId?: string | null): boolean {
  if (!sessionId) return false;
  return sessionId.trim().startsWith("cs_test_");
}

export function isTestPurchase(purchase: {
  stripe_session_id?: string | null;
  customer_email?: string | null;
}): boolean {
  if (isTestStripeSession(purchase.stripe_session_id)) return true;
  if (isTestEmail(purchase.customer_email)) return true;
  return false;
}

export function isTestLead(lead: {
  email?: string | null;
  name?: string | null;
  notes?: string | null;
}): boolean {
  if (isTestEmail(lead.email)) return true;
  if (lead.name && (lead.name.toLowerCase().includes("test") || lead.name.toLowerCase().includes("audit"))) {
    return true;
  }
  return false;
}

export function isTestInvoice(invoice: {
  client_email?: string | null;
  client_name?: string | null;
  title?: string | null;
}): boolean {
  if (isTestEmail(invoice.client_email)) return true;
  if (invoice.client_name && invoice.client_name.toLowerCase().includes("test")) return true;
  if (invoice.title && invoice.title.toLowerCase().includes("test")) return true;
  return false;
}
