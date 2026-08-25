import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient, getStripeErrorMessage } from "@/lib/stripe.server";
import { SITE_URL } from "@/lib/site";

const lineItemSchema = z.object({
  description: z.string().trim().min(1).max(200),
  amount_cents: z.number().int().positive(),
});

const addOnSchema = z.object({
  name: z.string().trim().min(1).max(200),
  standard_price: z.string().trim().min(1).max(100),
  community_price: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
});

const createInvoiceSchema = z.object({
  client_name: z.string().trim().min(1).max(100),
  client_email: z.string().trim().email().max(255),
  client_organization: z.string().trim().max(150).optional(),
  service_type: z.string().trim().min(1).max(100),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  line_items: z.array(lineItemSchema).min(1),
  original_total_cents: z.number().int().nonnegative().optional(),
  discount_cents: z.number().int().nonnegative().optional(),
  add_ons: z.array(addOnSchema).optional(),
  due_date: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type ClientInvoiceRecord = {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_organization: string | null;
  service_type: string;
  title: string;
  description: string | null;
  line_items: { description: string; amount_cents: number }[];
  original_total_cents: number | null;
  discount_cents: number | null;
  add_ons:
    | { name: string; standard_price: string; community_price: string; description?: string }[]
    | null;
  selected_add_ons: string[] | null;
  total_cents: number;
  deposit_cents: number;
  final_cents: number;
  status: "draft" | "deposit_pending" | "deposit_paid" | "fully_paid" | "cancelled";
  stripe_deposit_session_id: string | null;
  stripe_final_session_id: string | null;
  deposit_paid_at: string | null;
  final_paid_at: string | null;
  due_date: string | null;
  notes: string | null;
  public_access_token: string;
  created_at: string;
  updated_at: string;
};

export type PublicClientInvoiceRecord = Omit<
  ClientInvoiceRecord,
  | "client_email"
  | "notes"
  | "public_access_token"
  | "stripe_deposit_session_id"
  | "stripe_final_session_id"
>;

const publicInvoiceAccessSchema = z.object({
  invoiceNumber: z.string().trim().min(1).max(80),
  accessToken: z.string().uuid(),
});

function toPublicInvoice(invoice: ClientInvoiceRecord): PublicClientInvoiceRecord {
  const {
    client_email: _clientEmail,
    notes: _notes,
    public_access_token: _publicAccessToken,
    stripe_deposit_session_id: _depositSession,
    stripe_final_session_id: _finalSession,
    ...publicInvoice
  } = invoice;
  return publicInvoice;
}

async function enforcePublicInvoiceRateLimit(
  action: "read" | "checkout" | "addon",
  invoiceNumber: string,
  max: number,
  windowMs: number,
): Promise<void> {
  const [{ getRequest }, { allowRequest, getClientIp }] = await Promise.all([
    import("@tanstack/react-start/server"),
    import("@/lib/request-guard.server"),
  ]);
  const request = getRequest();
  if (!request) return;
  const key = `invoice:${action}:${invoiceNumber}:${getClientIp(request.headers)}`;
  if (!allowRequest(key, max, windowMs)) {
    throw new Error("Too many invoice requests. Please wait and try again.");
  }
}

/** How many invoice numbers to try before giving up. */
const INVOICE_NUMBER_ATTEMPTS = 6;

/**
 * Invoice number: MIT-YYYY-MMDD-NN.
 *
 * Date-scoped, so the random part only has to be unique within one day instead
 * of one year. The previous scheme drew from 900 values per calendar year: at
 * ~40 invoices a year the odds of at least one collision are better than even,
 * and it guarded against that with a single retry. This matches the date-based
 * format already present in the data (MIT-2026-0803-01).
 *
 * Later attempts widen the suffix so repeated collisions always terminate.
 */
function generateInvoiceNumber(attempt: number): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const digits = attempt < 3 ? 2 : 4;
  const seq = String(Math.floor(Math.random() * 10 ** digits)).padStart(digits, "0");
  return `MIT-${now.getFullYear()}-${month}${day}-${seq}`;
}

export const createClientInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => createInvoiceSchema.parse(d))
  .handler(async ({ data, context }) => {
    // Ensure admin user
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      throw new Error("Forbidden: Admin access required.");
    }

    const totalCents = data.line_items.reduce((sum, item) => sum + item.amount_cents, 0);
    if (totalCents <= 0) throw new Error("Total invoice amount must be greater than zero.");

    // 50/50 split
    const depositCents = Math.round(totalCents / 2);
    const finalCents = totalCents - depositCents;

    const newInvoice = {
      client_name: data.client_name,
      client_email: data.client_email.toLowerCase(),
      client_organization: data.client_organization || null,
      service_type: data.service_type,
      title: data.title,
      description: data.description || null,
      line_items: data.line_items,
      original_total_cents: data.original_total_cents ?? null,
      discount_cents: data.discount_cents ?? null,
      add_ons: data.add_ons ?? [],
      total_cents: totalCents,
      deposit_cents: depositCents,
      final_cents: finalCents,
      status: "deposit_pending",
      due_date: data.due_date || null,
      notes: data.notes || null,
    };

    // Let the unique index on invoice_number decide, and retry on conflict.
    // Checking for a collision first and then inserting is a race: two admins
    // creating an invoice in the same moment can both read "free" and one insert
    // then fails. The database is the only authority that cannot be raced.
    for (let attempt = 0; attempt < INVOICE_NUMBER_ATTEMPTS; attempt++) {
      const { data: inserted, error } = await supabaseAdmin
        .from("client_invoices" as never)
        .insert({ ...newInvoice, invoice_number: generateInvoiceNumber(attempt) } as never)
        .select("*")
        .single();

      if (!error) return inserted as unknown as ClientInvoiceRecord;

      // 23505 = unique_violation. Only a number clash is worth retrying; any
      // other error is a real failure and must surface immediately.
      if (error.code !== "23505") {
        console.error("Failed to create invoice", error);
        throw new Error("Database error while creating invoice.");
      }
    }

    console.error("Failed to allocate an invoice number", {
      attempts: INVOICE_NUMBER_ATTEMPTS,
    });
    throw new Error("Could not allocate an invoice number. Please try again.");
  });

export const getPublicClientInvoice = createServerFn({ method: "GET" })
  .validator((d: unknown) => publicInvoiceAccessSchema.parse(d))
  .handler(async ({ data }) => {
    await enforcePublicInvoiceRateLimit("read", data.invoiceNumber, 60, 60_000);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invoice, error } = await supabaseAdmin
      .from("client_invoices" as never)
      .select("*")
      .eq("invoice_number" as never, data.invoiceNumber)
      .eq("public_access_token" as never, data.accessToken)
      .neq("status" as never, "draft")
      .maybeSingle();

    if (error || !invoice) {
      return null;
    }

    return toPublicInvoice(invoice as unknown as ClientInvoiceRecord);
  });

export const listClientInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      throw new Error("Forbidden: Admin access required.");
    }

    const { data: invoices, error } = await supabaseAdmin
      .from("client_invoices" as never)
      .select("*")
      .order("created_at" as never, { ascending: false });

    if (error) {
      console.error("Failed to fetch invoices", error);
      return [];
    }

    return (invoices || []) as unknown as ClientInvoiceRecord[];
  });

export const updateInvoiceStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        invoiceNumber: z.string(),
        status: z.enum(["draft", "deposit_pending", "deposit_paid", "fully_paid", "cancelled"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      throw new Error("Forbidden: Admin access required.");
    }

    const updatePayload: Record<string, unknown> = {
      status: data.status,
      updated_at: new Date().toISOString(),
    };

    if (data.status === "deposit_paid") {
      updatePayload.deposit_paid_at = new Date().toISOString();
    } else if (data.status === "fully_paid") {
      updatePayload.final_paid_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("client_invoices" as never)
      .update(updatePayload as never)
      .eq("invoice_number" as never, data.invoiceNumber);

    if (error) throw new Error("Failed to update invoice status.");
    return { ok: true };
  });

export const sendClientInvoiceEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    z
      .object({
        invoiceNumber: z.string().trim().min(1).max(80),
        note: z.string().trim().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) throw new Error("Forbidden: Admin access required.");

    const { data: invoice, error } = await supabaseAdmin
      .from("client_invoices" as never)
      .select("*")
      .eq("invoice_number" as never, data.invoiceNumber)
      .maybeSingle();
    if (error || !invoice) throw new Error("Invoice not found.");

    const inv = invoice as unknown as ClientInvoiceRecord;
    if (inv.status === "cancelled") throw new Error("A cancelled invoice cannot be emailed.");
    if (inv.status === "fully_paid") throw new Error("This invoice is already paid in full.");
    if (!inv.public_access_token) {
      throw new Error("This invoice needs a secure access link before it can be emailed.");
    }

    const paymentLabel = inv.status === "deposit_paid" ? "final balance" : "50% deposit";
    const amountDueCents = inv.status === "deposit_paid" ? inv.final_cents : inv.deposit_cents;
    const { sendInvoiceDeliveryEmail } = await import("@/lib/welcome-email.server");
    const delivery = await sendInvoiceDeliveryEmail({
      invoiceNumber: inv.invoice_number,
      publicAccessToken: inv.public_access_token,
      clientName: inv.client_name,
      clientEmail: inv.client_email,
      clientOrganization: inv.client_organization,
      title: inv.title,
      totalCents: inv.total_cents,
      amountDueCents,
      paymentLabel,
      idempotencyVersion: inv.updated_at,
      dueDate: inv.due_date,
      customerNote: data.note || null,
    });

    const { data: linkedLead } = await supabaseAdmin
      .from("service_system_leads" as never)
      .select("id")
      .eq("invoice_number" as never, inv.invoice_number)
      .maybeSingle();
    if (linkedLead) {
      await supabaseAdmin.from("service_system_lead_events" as never).insert({
        lead_id: (linkedLead as { id: string }).id,
        event_type: "invoice_emailed",
        metadata: {
          invoice_number: inv.invoice_number,
          delivery,
          payment_label: paymentLabel,
          included_note: !!data.note,
        },
        created_by: context.userId,
      } as never);
    }

    return { ok: true, delivery, email: inv.client_email };
  });

export const updateClientInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) =>
    createInvoiceSchema
      .extend({
        invoiceNumber: z.string().trim().min(1),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      throw new Error("Forbidden: Admin access required.");
    }

    const totalCents = data.line_items.reduce((acc, item) => acc + item.amount_cents, 0);
    const depositCents = Math.round(totalCents / 2);
    const finalCents = totalCents - depositCents;

    const updatePayload = {
      client_name: data.client_name,
      client_email: data.client_email.toLowerCase(),
      client_organization: data.client_organization || null,
      service_type: data.service_type,
      title: data.title,
      description: data.description || null,
      line_items: data.line_items,
      original_total_cents: data.original_total_cents ?? null,
      discount_cents: data.discount_cents ?? null,
      add_ons: data.add_ons ?? [],
      total_cents: totalCents,
      deposit_cents: depositCents,
      final_cents: finalCents,
      due_date: data.due_date || null,
      notes: data.notes || null,
      updated_at: new Date().toISOString(),
    };

    const { data: updated, error } = await supabaseAdmin
      .from("client_invoices" as never)
      .update(updatePayload as never)
      .eq("invoice_number" as never, data.invoiceNumber)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to update invoice", error);
      throw new Error("Database error while updating invoice.");
    }

    return updated as unknown as ClientInvoiceRecord;
  });

export const deleteClientInvoice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: unknown) => z.object({ invoiceNumber: z.string().trim().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleRow) {
      throw new Error("Forbidden: Admin access required.");
    }

    const { error } = await supabaseAdmin
      .from("client_invoices" as never)
      .delete()
      .eq("invoice_number" as never, data.invoiceNumber);

    if (error) {
      console.error("Failed to delete invoice", error);
      throw new Error("Database error while deleting invoice.");
    }

    return { ok: true };
  });

export const createInvoiceCheckoutSession = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        invoiceNumber: z.string().trim().min(1),
        accessToken: z.string().uuid(),
        paymentType: z.enum(["deposit", "final"]),
        // Required on purpose. A default of "sandbox" here meant any caller that
        // omitted it would hand a paying client a test-mode checkout — they enter
        // a card, nothing settles, and the invoice sits unpaid with no error.
        // Better to reject the call than to guess which mode collects real money.
        environment: z.enum(["sandbox", "live"]),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await enforcePublicInvoiceRateLimit("checkout", data.invoiceNumber, 6, 10 * 60_000);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invoice } = await supabaseAdmin
      .from("client_invoices" as never)
      .select("*")
      .eq("invoice_number" as never, data.invoiceNumber)
      .eq("public_access_token" as never, data.accessToken)
      .neq("status" as never, "draft")
      .maybeSingle();

    if (!invoice) throw new Error("Invoice not found.");
    const inv = invoice as unknown as ClientInvoiceRecord;

    if (inv.status === "cancelled") throw new Error("Invoice is cancelled.");

    let amountCents = 0;
    let paymentLabel = "";

    if (data.paymentType === "deposit") {
      if (inv.status !== "deposit_pending") {
        throw new Error("Deposit has already been paid or invoice is invalid.");
      }
      amountCents = inv.deposit_cents;
      paymentLabel = `50% Deposit for Invoice ${inv.invoice_number}`;
    } else {
      if (inv.status !== "deposit_paid") {
        throw new Error("Invoice is not eligible for final balance payment.");
      }
      amountCents = inv.final_cents;
      paymentLabel = `Final 50% Balance for Invoice ${inv.invoice_number}`;
    }

    const stripe = createStripeClient(data.environment as StripeEnv);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: inv.client_email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${inv.title} (${paymentLabel})`,
              description: `Melanated in Tech ${inv.service_type} Service (${paymentLabel})`,
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${SITE_URL}/invoice/${encodeURIComponent(inv.invoice_number)}?token=${encodeURIComponent(inv.public_access_token)}&payment_status=success&payment_type=${data.paymentType}`,
      cancel_url: `${SITE_URL}/invoice/${encodeURIComponent(inv.invoice_number)}?token=${encodeURIComponent(inv.public_access_token)}&payment_status=cancelled`,
      metadata: {
        invoice_number: inv.invoice_number,
        payment_type: data.paymentType,
        client_email: inv.client_email,
        amount_cents: String(amountCents),
      },
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe Checkout session.");
    }

    // Save session ID
    const sessionKey =
      data.paymentType === "deposit" ? "stripe_deposit_session_id" : "stripe_final_session_id";

    await supabaseAdmin
      .from("client_invoices" as never)
      .update({ [sessionKey]: session.id, updated_at: new Date().toISOString() } as never)
      .eq("invoice_number" as never, inv.invoice_number);

    return { checkoutUrl: session.url };
  });

export const toggleInvoiceAddOnFn = createServerFn({ method: "POST" })
  .validator((d: unknown) =>
    z
      .object({
        invoiceNumber: z.string().trim().min(1),
        accessToken: z.string().uuid(),
        addonName: z.string().trim().min(1),
        selected: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    await enforcePublicInvoiceRateLimit("addon", data.invoiceNumber, 30, 10 * 60_000);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invoice } = await supabaseAdmin
      .from("client_invoices" as never)
      .select("*")
      .eq("invoice_number" as never, data.invoiceNumber)
      .eq("public_access_token" as never, data.accessToken)
      .neq("status" as never, "draft")
      .maybeSingle();

    if (!invoice) throw new Error("Invoice not found.");
    const inv = invoice as unknown as ClientInvoiceRecord;
    if (inv.status !== "deposit_pending") {
      throw new Error("Add-ons can only be changed before the deposit is paid.");
    }
    const allowedAddOns = Array.isArray(inv.add_ons) ? inv.add_ons.map((item) => item.name) : [];
    if (!allowedAddOns.includes(data.addonName)) {
      throw new Error("This add-on is not available for the invoice.");
    }
    const currentSelected = Array.isArray(inv.selected_add_ons) ? [...inv.selected_add_ons] : [];

    let updatedSelected: string[] = [];
    if (data.selected) {
      if (!currentSelected.includes(data.addonName)) {
        updatedSelected = [...currentSelected, data.addonName];
      } else {
        updatedSelected = currentSelected;
      }
    } else {
      updatedSelected = currentSelected.filter((item) => item !== data.addonName);
    }

    const { error } = await supabaseAdmin
      .from("client_invoices" as never)
      .update({
        selected_add_ons: updatedSelected,
        updated_at: new Date().toISOString(),
      } as never)
      .eq("invoice_number" as never, data.invoiceNumber);

    if (error) {
      console.error("Failed to update selected add-ons", error);
      throw new Error("Failed to update selected add-ons.");
    }

    return { ok: true, selected_add_ons: updatedSelected };
  });
