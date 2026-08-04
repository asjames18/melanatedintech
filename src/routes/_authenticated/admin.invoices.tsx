import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  FileText,
  Plus,
  Copy,
  ExternalLink,
  Check,
  Calendar,
  Building2,
  DollarSign,
  Loader2,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createClientInvoice,
  listClientInvoices,
  updateInvoiceStatus,
  type ClientInvoiceRecord,
} from "@/lib/invoices.functions";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/invoices")({
  component: AdminInvoices,
});

const SERVICE_TYPES = [
  "Web Design",
  "AI Agent Development",
  "Marketing & SEO",
  "Automation & Workflow",
  "Custom Strategy",
];

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

function formatDate(dateString?: string | null) {
  if (!dateString) return "—";
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

function AdminInvoices() {
  const queryClient = useQueryClient();
  const getInvoicesFn = useServerFn(listClientInvoices);
  const createInvoiceFn = useServerFn(createClientInvoice);
  const updateStatusFn = useServerFn(updateInvoiceStatus);

  const [isOpen, setIsOpen] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientOrg, setClientOrg] = useState("");
  const [serviceType, setServiceType] = useState("Web Design");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [originalTotal, setOriginalTotal] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [lineItems, setLineItems] = useState<{ description: string; amount: string }[]>([
    { description: "50% Initial Deposit (Web Design / AI Agent / Automation)", amount: "150" },
    { description: "50% Final Balance Upon Completion", amount: "150" },
  ]);
  const [addOns, setAddOns] = useState<{ name: string; standard_price: string; community_price: string; description?: string }[]>([
    { name: "Website care & minor updates", standard_price: "$200/mo", community_price: "$125/mo", description: "Ongoing security, backups, & monthly content updates" },
    { name: "Local SEO growth plan", standard_price: "$750/mo", community_price: "$450/mo", description: "Keyword optimization & Google Business Profile management" },
    { name: "SEO + Website care package", standard_price: "$900/mo", community_price: "$550/mo", description: "Complete technical SEO, care & search growth package" },
  ]);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["admin_client_invoices"],
    queryFn: () => getInvoicesFn(),
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(null);
      const parsedItems = lineItems.map((item) => {
        const num = parseFloat(item.amount);
        if (isNaN(num) || num <= 0) throw new Error("Line item amounts must be positive numbers.");
        return {
          description: item.description,
          amount_cents: Math.round(num * 100),
        };
      });

      const origNum = originalTotal ? parseFloat(originalTotal) : undefined;
      const discNum = discountAmount ? parseFloat(discountAmount) : undefined;
      const filteredAddOns = addOns.filter((a) => a.name.trim().length > 0);

      return await createInvoiceFn({
        data: {
          client_name: clientName,
          client_email: clientEmail,
          client_organization: clientOrg,
          service_type: serviceType,
          title,
          description,
          line_items: parsedItems,
          original_total_cents: origNum && !isNaN(origNum) ? Math.round(origNum * 100) : undefined,
          discount_cents: discNum && !isNaN(discNum) ? Math.round(discNum * 100) : undefined,
          add_ons: filteredAddOns,
          due_date: dueDate,
          notes,
        },
      });
    },
    onSuccess: (newInv) => {
      queryClient.invalidateQueries({ queryKey: ["admin_client_invoices"] });
      setIsOpen(false);
      resetForm();
    },
    onError: (e: any) => {
      setErrorMsg(e.message || "Failed to create invoice.");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      invoiceNumber,
      status,
    }: {
      invoiceNumber: string;
      status: ClientInvoiceRecord["status"];
    }) => {
      await updateStatusFn({ data: { invoiceNumber, status } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_client_invoices"] });
    },
  });

  const resetForm = () => {
    setClientName("");
    setClientEmail("");
    setClientOrg("");
    setServiceType("Web Design");
    setTitle("");
    setDescription("");
    setOriginalTotal("");
    setDiscountAmount("");
    setDueDate("");
    setNotes("");
    setLineItems([
      { description: "Project Kickoff & Deposit", amount: "150" },
      { description: "Final Delivery & Handoff", amount: "150" },
    ]);
    setAddOns([
      { name: "Website care & minor updates", standard_price: "$200/mo", community_price: "$125/mo", description: "Ongoing security, backups, & monthly content updates" },
      { name: "Local SEO growth plan", standard_price: "$750/mo", community_price: "$450/mo", description: "Keyword optimization & Google Business Profile management" },
      { name: "SEO + Website care package", standard_price: "$900/mo", community_price: "$550/mo", description: "Complete technical SEO, care & search growth package" },
    ]);
  };

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", amount: "" }]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: "description" | "amount", value: string) => {
    const next = [...lineItems];
    next[index][field] = value;
    setLineItems(next);
  };

  const totalCalculatedCents = lineItems.reduce((sum, item) => {
    const val = parseFloat(item.amount);
    return sum + (isNaN(val) ? 0 : Math.round(val * 100));
  }, 0);

  const copyInvoiceLink = (invoiceNumber: string) => {
    const url = `${SITE_URL}/invoice/${invoiceNumber}`;
    navigator.clipboard.writeText(url);
    setCopiedNumber(invoiceNumber);
    setTimeout(() => setCopiedNumber(null), 2500);
  };

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin Invoicing"
        title="Client Invoice Manager"
        description="Create, send, and manage custom 50/50 deposit invoices for Web Design, AI Agents, Marketing, SEO, and Automations."
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Main Admin
          </Link>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground font-semibold">
                <Plus className="h-4 w-4" /> Create New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 font-serif text-xl">
                  <Sparkles className="h-5 w-5 text-primary" /> Create Client Invoice
                </DialogTitle>
              </DialogHeader>

              {errorMsg && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-600 dark:text-red-300">
                  {errorMsg}
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate();
                }}
                className="space-y-4 text-sm mt-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      required
                      placeholder="e.g. Sarah Johnson"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Client Email *</Label>
                    <Input
                      id="clientEmail"
                      type="email"
                      required
                      placeholder="sarah@example.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientOrg">Client Organization (Optional)</Label>
                    <Input
                      id="clientOrg"
                      placeholder="e.g. Apex Media Group"
                      value={clientOrg}
                      onChange={(e) => setClientOrg(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceType">Service Category *</Label>
                    <Select value={serviceType} onValueChange={setServiceType}>
                      <SelectTrigger id="serviceType">
                        <SelectValue placeholder="Select Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    required
                    placeholder="e.g. Custom AI Customer Support Agent & Web Automation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Scope / Description (Optional)</Label>
                  <Textarea
                    id="description"
                    rows={2}
                    placeholder="Brief summary of deliverables..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="originalTotal">Original Value ($) (Optional)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">$</span>
                      <Input
                        id="originalTotal"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 3900"
                        value={originalTotal}
                        onChange={(e) => setOriginalTotal(e.target.value)}
                        className="pl-6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="discountAmount">Community Discount ($) (Optional)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">$</span>
                      <Input
                        id="discountAmount"
                        type="number"
                        step="0.01"
                        placeholder="e.g. 3600"
                        value={discountAmount}
                        onChange={(e) => setDiscountAmount(e.target.value)}
                        className="pl-6"
                      />
                    </div>
                  </div>
                </div>

                {/* Line Items */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label>Line Items (Breakdown)</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddLineItem}
                      className="gap-1 text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Item
                    </Button>
                  </div>

                  {lineItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                        className="flex-1"
                        required
                      />
                      <div className="relative w-32">
                        <span className="absolute left-2.5 top-2.5 text-xs text-muted-foreground">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => handleLineItemChange(idx, "amount", e.target.value)}
                          className="pl-6"
                          required
                        />
                      </div>
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="text-muted-foreground hover:text-red-500 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Calculated Totals Box */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-1.5 font-mono text-xs border border-border/60">
                  <div className="flex justify-between font-sans text-sm font-semibold">
                    <span>Total Project Amount:</span>
                    <span>{formatCurrency(totalCalculatedCents)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>50% Required Initial Deposit:</span>
                    <span className="font-bold text-foreground">{formatCurrency(Math.round(totalCalculatedCents / 2))}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>50% Final Balance Upon Completion:</span>
                    <span className="font-bold text-foreground">{formatCurrency(totalCalculatedCents - Math.round(totalCalculatedCents / 2))}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dueDate">Due Date (Optional)</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes / Special Instructions</Label>
                    <Input
                      id="notes"
                      placeholder="e.g. Includes 30 days of post-launch support"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || totalCalculatedCents <= 0}
                    className="gap-2 bg-primary text-primary-foreground font-semibold"
                  >
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Create Invoice
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Invoices List Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
            <h2 className="font-serif font-semibold text-lg text-foreground">All Invoices</h2>
            <span className="text-xs text-muted-foreground font-mono">{invoices.length} Total</span>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground flex justify-center items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading invoices...
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <FileText className="mx-auto h-8 w-8 opacity-40 mb-2" />
              <p>No client invoices generated yet.</p>
              <p className="text-xs mt-1">Click "Create New Invoice" to generate your first 50/50 deposit invoice.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-muted-foreground text-xs uppercase bg-muted/30">
                    <th className="py-3 px-6">Invoice #</th>
                    <th className="py-3 px-6">Client</th>
                    <th className="py-3 px-6">Service</th>
                    <th className="py-3 px-6">Total Amount</th>
                    <th className="py-3 px-6">50% Deposit</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-muted/20">
                      <td className="py-4 px-6 font-mono font-semibold text-foreground">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-foreground">{inv.client_name}</div>
                        <div className="text-xs text-muted-foreground">{inv.client_email}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-block rounded-full bg-secondary/20 px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                          {inv.service_type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-foreground">
                        {formatCurrency(inv.total_cents)}
                      </td>
                      <td className="py-4 px-6 font-mono text-muted-foreground">
                        {formatCurrency(inv.deposit_cents)}
                      </td>
                      <td className="py-4 px-6">
                        <Select
                          value={inv.status}
                          onValueChange={(val: any) =>
                            updateStatusMutation.mutate({ invoiceNumber: inv.invoice_number, status: val })
                          }
                        >
                          <SelectTrigger className="h-7 text-xs w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deposit_pending">Deposit Pending</SelectItem>
                            <SelectItem value="deposit_paid">Deposit Paid</SelectItem>
                            <SelectItem value="fully_paid">Paid in Full</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyInvoiceLink(inv.invoice_number)}
                          className="gap-1 text-xs"
                        >
                          {copiedNumber === inv.invoice_number ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Link
                            </>
                          )}
                        </Button>
                        <Link to={`/invoice/${inv.invoice_number}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
