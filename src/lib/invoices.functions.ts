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
  add_ons: { name: string; standard_price: string; community_price: string; description?: string }[] | null;
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
  created_at: string;
  updated_at: string;
};

// Generate unique invoice number: MIT-YYYY-XXX
function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `MIT-${year}-${randomSuffix}`;
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

    let invoiceNumber = generateInvoiceNumber();
    // Check collision
    const { data: existing } = await supabaseAdmin
      .from("client_invoices" as never)
      .select("id")
      .eq("invoice_number" as never, invoiceNumber)
      .maybeSingle();

    if (existing) {
      invoiceNumber = `${generateInvoiceNumber()}-${Math.floor(Math.random() * 90 + 10)}`;
    }

    const newInvoice = {
      invoice_number: invoiceNumber,
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

    const { data: inserted, error } = await supabaseAdmin
      .from("client_invoices" as never)
      .insert(newInvoice as never)
      .select("*")
      .single();

    if (error) {
      console.error("Failed to create invoice", error);
      throw new Error("Database error while creating invoice.");
    }

    return inserted as unknown as ClientInvoiceRecord;
  });

export const getPublicClientInvoice = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ invoiceNumber: z.string().trim().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invoice, error } = await supabaseAdmin
      .from("client_invoices" as never)
      .select("*")
      .eq("invoice_number" as never, data.invoiceNumber)
      .maybeSingle();

    if (error || !invoice) {
      return null;
    }

    return invoice as unknown as ClientInvoiceRecord;
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
  .validator(
    (d: unknown) =>
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

export const createInvoiceCheckoutSession = createServerFn({ method: "POST" })
  .validator(
    (d: unknown) =>
      z
        .object({
          invoiceNumber: z.string().trim().min(1),
          paymentType: z.enum(["deposit", "final"]),
          environment: z.enum(["sandbox", "live"]).optional().default("sandbox"),
        })
        .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invoice } = await supabaseAdmin
      .from("client_invoices" as never)
      .select("*")
      .eq("invoice_number" as never, data.invoiceNumber)
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
      success_url: `${SITE_URL}/invoice/${inv.invoice_number}?payment_status=success&payment_type=${data.paymentType}`,
      cancel_url: `${SITE_URL}/invoice/${inv.invoice_number}?payment_status=cancelled`,
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
