import { useState, useEffect } from "react";
import { createFileRoute, useLoaderData, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, Printer, ArrowRight, Loader2, DollarSign, Building2, Calendar, FileText, Check } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { buildSeoMeta } from "@/lib/seo";
import { getPublicClientInvoice, createInvoiceCheckoutSession, toggleInvoiceAddOnFn, type ClientInvoiceRecord } from "@/lib/invoices.functions";

export const Route = createFileRoute("/invoice/$number")({
  head: ({ loaderData }) => {
    const inv = loaderData as ClientInvoiceRecord | null;
    const title = inv ? `Invoice ${inv.invoice_number} — ${inv.client_name}` : "Client Invoice — Melanated in Tech";
    return {
      ...buildSeoMeta({
        title,
        description: inv ? `Invoice for ${inv.service_type} (${inv.title})` : "Melanated in Tech Client Invoice",
        url: `/invoice/${inv?.invoice_number || ""}`,
      }),
    };
  },
  loader: async ({ params }) => {
    try {
      const invoice = await getPublicClientInvoice({ data: { invoiceNumber: params.number } });
      return invoice;
    } catch {
      return null;
    }
  },
  component: InvoicePage,
});

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "Upon Receipt";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

function InvoicePage() {
  const invoice = useLoaderData({ from: "/invoice/$number" }) as ClientInvoiceRecord | null;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>(invoice?.selected_add_ons || []);

  // Check URL params for payment completion status
  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const paymentStatus = searchParams?.get("payment_status");
  const paymentType = searchParams?.get("payment_type");

  const handleToggleAddOn = async (addonName: string) => {
    if (!invoice) return;
    const isSelected = selectedAddOns.includes(addonName);
    const newSelected = isSelected
      ? selectedAddOns.filter((name) => name !== addonName)
      : [...selectedAddOns, addonName];

    setSelectedAddOns(newSelected);

    try {
      await toggleInvoiceAddOnFn({
        data: {
          invoiceNumber: invoice.invoice_number,
          addonName,
          selected: !isSelected,
        },
      });
    } catch {
      // Revert on error
      setSelectedAddOns(selectedAddOns);
    }
  };

  if (!invoice) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-serif text-3xl font-bold text-foreground">Invoice Not Found</h1>
          <p className="mt-3 text-muted-foreground">
            We couldn't find an active invoice with that reference number. Please check the URL or contact us at{" "}
            <a href="mailto:hello@melanatedintech.com" className="text-primary underline">
              hello@melanatedintech.com
            </a>
          </p>
        </div>
      </SiteLayout>
    );
  }

  const handlePay = async (type: "deposit" | "final") => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await createInvoiceCheckoutSession({
        data: {
          invoiceNumber: invoice.invoice_number,
          paymentType: type,
          environment: "live", // Uses live/sandbox as configured
        },
      });
      if (res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      }
    } catch (e: any) {
      setLoading(false);
      setErrorMessage(e.message || "Could not launch checkout. Please try again.");
    }
  };

  return (
    <SiteLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* Payment Confirmation Banner */}
        {paymentStatus === "success" && (
          <div className="mb-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">
                  {paymentType === "deposit" ? "50% Deposit Received!" : "Final Payment Complete!"}
                </h3>
                <p className="text-sm opacity-90">
                  Thank you! Your payment has been received and confirmed. A receipt has been sent to {invoice.client_email}.
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-700 dark:text-red-300 text-sm">
            {errorMessage}
          </div>
        )}

        {/* Invoice Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 sm:p-10 text-card-foreground print:shadow-none print:border-none print:p-0">
          
          {/* Top Bar: Brand Header & Invoice Details */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 border-b border-border/60 pb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
                  Melanated in Tech
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Practical AI, Web Design & Automations</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Email: hello@melanatedintech.com<br />
                Web: melanatedintech.com
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block rounded-full bg-primary/10 px-3 font-mono text-xs font-semibold uppercase tracking-wider text-primary">
                INVOICE #{invoice.invoice_number}
              </span>
              <h1 className="mt-2 font-serif text-2xl font-bold text-foreground">
                {formatCurrency(invoice.total_cents)}
              </h1>

              {/* Status Badge */}
              <div className="mt-3 flex sm:justify-end">
                {invoice.status === "deposit_pending" && (
                  <span className="rounded-md bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-500/20">
                    50% DEPOSIT DUE ($ {formatCurrency(invoice.deposit_cents)})
                  </span>
                )}
                {invoice.status === "deposit_paid" && (
                  <span className="rounded-md bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300 border border-sky-500/20">
                    DEPOSIT PAID — IN PROGRESS
                  </span>
                )}
                {invoice.status === "fully_paid" && (
                  <span className="rounded-md bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                    PAID IN FULL
                  </span>
                )}
                {invoice.status === "cancelled" && (
                  <span className="rounded-md bg-zinc-500/10 px-3 py-1 text-xs font-semibold text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
                    CANCELLED
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Client & Date Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border/60">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Billed To</p>
              <h3 className="mt-1 font-semibold text-foreground text-lg">{invoice.client_name}</h3>
              {invoice.client_organization && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {invoice.client_organization}
                </p>
              )}
              <p className="text-sm text-muted-foreground">{invoice.client_email}</p>
            </div>

            <div className="sm:text-right space-y-1 text-sm">
              <p><span className="text-muted-foreground">Service Category:</span> <strong className="text-foreground">{invoice.service_type}</strong></p>
              <p><span className="text-muted-foreground">Invoice Date:</span> <strong className="text-foreground">{formatDate(invoice.created_at)}</strong></p>
              <p><span className="text-muted-foreground">Due Date:</span> <strong className="text-foreground">{formatDate(invoice.due_date)}</strong></p>
            </div>
          </div>

          {/* Original Professional Value & Community Discount Callout */}
          {(invoice.original_total_cents || invoice.discount_cents) && (
            <div className="py-6 border-b border-border/60">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-primary/25 bg-primary/5 p-4 text-center">
                <div className="p-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Standard Professional Value</p>
                  <p className="mt-1 font-serif text-xl font-bold line-through text-muted-foreground/80">
                    {formatCurrency(invoice.original_total_cents || invoice.total_cents + (invoice.discount_cents || 0))}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Full market-value scope</p>
                </div>

                <div className="p-2 border-t sm:border-t-0 sm:border-l border-border/40">
                  <p className="text-xs uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300">Special Community Discount</p>
                  <p className="mt-1 font-serif text-xl font-bold text-amber-600 dark:text-amber-400">
                    -{formatCurrency(invoice.discount_cents || (invoice.original_total_cents ? invoice.original_total_cents - invoice.total_cents : 0))}
                  </p>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-300/80">Relationship savings applied</p>
                </div>

                <div className="p-2 border-t sm:border-t-0 sm:border-l border-border/40">
                  <p className="text-xs uppercase tracking-wider font-semibold text-primary">Client Net Investment</p>
                  <p className="mt-1 font-serif text-2xl font-bold text-primary">
                    {formatCurrency(invoice.total_cents)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Two payments of {formatCurrency(invoice.deposit_cents)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Title & Description */}
          <div className="py-6 border-b border-border/60">
            <h2 className="font-semibold text-foreground text-lg">{invoice.title}</h2>
            {invoice.description && (
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{invoice.description}</p>
            )}
          </div>

          {/* Itemized Line Items Table */}
          <div className="py-6 border-b border-border/60">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Project Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground font-medium text-xs uppercase">
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {invoice.line_items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-3 text-foreground font-medium">{item.description}</td>
                      <td className="py-3 text-right font-mono text-foreground font-medium">
                        {formatCurrency(item.amount_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 50/50 Payment Terms Breakdown */}
          <div className="py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
            <div className="space-y-2 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground text-sm">Payment Policy & Terms</p>
              <p>• <strong>50% Initial Deposit</strong> is required before project kickoff and asset development.</p>
              <p>• <strong>50% Final Balance</strong> is due upon completion and review prior to final deployment/handoff.</p>
              <p>• Payments are securely processed via Stripe (Credit Card, Apple Pay, Google Pay).</p>
            </div>

            <div className="rounded-xl bg-muted/40 p-4 space-y-3 font-mono text-sm border border-border/40">
              <div className="flex justify-between text-muted-foreground text-xs font-sans">
                <span>Subtotal (Total Project Value)</span>
                <span className="font-mono text-foreground font-semibold">{formatCurrency(invoice.total_cents)}</span>
              </div>
              <div className="border-t border-border/40 pt-2 flex justify-between">
                <span>50% Initial Deposit:</span>
                <span className="font-bold text-foreground">{formatCurrency(invoice.deposit_cents)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Deposit Status:</span>
                <span className={invoice.deposit_paid_at ? "text-emerald-600 font-bold dark:text-emerald-400 font-sans" : "text-amber-600 font-bold dark:text-amber-400 font-sans"}>
                  {invoice.deposit_paid_at ? `Paid (${formatDate(invoice.deposit_paid_at)})` : "Due Now"}
                </span>
              </div>

              <div className="border-t border-border/40 pt-2 flex justify-between">
                <span>50% Final Balance:</span>
                <span className="font-bold text-foreground">{formatCurrency(invoice.final_cents)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Final Balance Status:</span>
                <span className={invoice.final_paid_at ? "text-emerald-600 font-bold dark:text-emerald-400 font-sans" : "text-zinc-500 font-sans"}>
                  {invoice.final_paid_at ? `Paid (${formatDate(invoice.final_paid_at)})` : "Due Upon Completion"}
                </span>
              </div>
            </div>
          </div>

          {/* Optional Monthly Add-Ons & Ongoing Growth Services */}
          {invoice.add_ons && invoice.add_ons.length > 0 && (
            <div className="py-6 border-b border-border/60">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Optional Monthly Retainers & Growth Add-Ons</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Click any optional service below to select and include it with your proposal.</p>
                </div>
                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full uppercase">Interactive Selection</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {invoice.add_ons.map((addon, idx) => {
                  const isSelected = selectedAddOns.includes(addon.name);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleAddOn(addon.name)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all space-y-3 relative ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 shadow-sm ring-1 ring-emerald-500/30"
                          : "border-border/60 bg-muted/20 hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm text-foreground">{addon.name}</p>
                        <div
                          className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-border/80 bg-background text-transparent"
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {addon.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{addon.description}</p>
                      )}

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground line-through font-mono">{addon.standard_price}</span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-mono">{addon.community_price}</span>
                          {isSelected && <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Selected</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Box: Pay Buttons & Print */}
          <div className="mt-6 rounded-2xl bg-card border border-primary/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">Secure 256-Bit Encrypted Payment</p>
                <p className="text-xs text-muted-foreground">Powered by Stripe • Credit Card, Apple Pay & Google Pay</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="gap-2 shrink-0"
              >
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>

              {invoice.status === "deposit_pending" && (
                <Button
                  size="lg"
                  onClick={() => handlePay("deposit")}
                  disabled={loading}
                  className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-md w-full sm:w-auto"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                  Pay 50% Deposit ({formatCurrency(invoice.deposit_cents)})
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}

              {invoice.status === "deposit_paid" && (
                <Button
                  size="lg"
                  onClick={() => handlePay("final")}
                  disabled={loading}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md w-full sm:w-auto"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Pay Final Balance ({formatCurrency(invoice.final_cents)})
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}

              {invoice.status === "fully_paid" && (
                <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm dark:text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Paid in Full — Thank you!
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </SiteLayout>
  );
}
