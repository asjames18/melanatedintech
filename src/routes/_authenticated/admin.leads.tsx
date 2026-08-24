import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Loader2,
  ReceiptText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminListServiceLeads,
  adminUpdateServiceLead,
  type ServiceLeadRecord,
  type ServiceLeadStatus,
} from "@/lib/service-leads.functions";
import { trackEvent } from "@/lib/analytics";
import { createClientInvoice } from "@/lib/invoices.functions";
import { InvoiceEmailDialog } from "@/components/invoice-email-dialog";

import { isTestLead } from "@/lib/test-data";

const statuses: ServiceLeadStatus[] = [
  "new",
  "reviewing",
  "qualified",
  "demo_sent",
  "proposal_sent",
  "deposit_pending",
  "won",
  "lost",
];
const selectClass = "h-10 rounded-md border border-input bg-background px-3 text-sm";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({ meta: [{ title: "Recovery Leads — Admin" }] }),
  component: AdminLeads,
});

function AdminLeads() {
  const list = useServerFn(adminListServiceLeads);
  const query = useQuery({
    queryKey: ["admin-service-leads"],
    queryFn: () => list(),
    retry: false,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showTest, setShowTest] = useState(false);

  if (query.error)
    return (
      <SiteLayout>
        <div className="mx-auto max-w-xl px-4 py-24 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-primary" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">{(query.error as Error).message}</p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/admin">Open admin</Link>
          </Button>
        </div>
      </SiteLayout>
    );

  const rawLeads = query.data ?? [];
  const liveLeads = rawLeads.filter((l) => !isTestLead(l));
  const leadsToFilter = showTest ? rawLeads : liveLeads;

  const filteredLeads = leadsToFilter.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const match =
        l.contact_name?.toLowerCase().includes(q) ||
        l.email?.toLowerCase().includes(q) ||
        l.business_name?.toLowerCase().includes(q) ||
        l.industry?.toLowerCase().includes(q) ||
        l.admin_notes?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const active = liveLeads.filter((lead) => !["won", "lost"].includes(lead.status)).length;

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Commercial pipeline"
        title="Recovery system leads"
        description={`${active} active opportunities · ${liveLeads.length} total live qualified submissions`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/admin">
                <ArrowLeft className="h-4 w-4" /> Admin dashboard
              </Link>
            </Button>
            <Button asChild>
              <Link to="/admin/invoices">
                <FileText className="h-4 w-4" /> Invoice manager
              </Link>
            </Button>
          </div>
        }
      />
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Customer contact details stay in this authenticated view and are never sent to
              analytics.
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={showTest ? "secondary" : "outline"}
                size="sm"
                onClick={() => setShowTest(!showTest)}
              >
                {showTest ? "Showing All (Incl. Test)" : "Live Mode Only"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
              >
                <RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} /> Refresh
              </Button>
            </div>
          </div>

          {/* Search and Status Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-2xl border border-border bg-card p-4 shadow-2xs">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setStatusFilter("all")}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                  statusFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All ({leadsToFilter.length})
              </button>
              {statuses.map((st) => {
                const count = leadsToFilter.filter((l) => l.status === st).length;
                return (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${
                      statusFilter === st
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {st.replace(/_/g, " ")} ({count})
                  </button>
                );
              })}
            </div>

            <div className="w-full md:w-72">
              <Input
                placeholder="Search leads by name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </div>

        {query.isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading leads…</p>
        ) : filteredLeads.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center">
            <h2 className="font-display text-xl font-semibold">No matching recovery leads</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {search || statusFilter !== "all"
                ? "Try adjusting your search query or status filter."
                : "Qualified submissions from the demo form will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}

function LeadCard({ lead }: { lead: ServiceLeadRecord }) {
  const [status, setStatus] = useState(lead.status);
  const [owner, setOwner] = useState(lead.assigned_owner ?? "");
  const [notes, setNotes] = useState(lead.admin_notes ?? "");
  const [invoice, setInvoice] = useState(lead.invoice_number ?? "");
  const update = useServerFn(adminUpdateServiceLead);
  const createInvoice = useServerFn(createClientInvoice);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      update({
        data: {
          id: lead.id,
          status,
          assigned_owner: owner || undefined,
          admin_notes: notes || undefined,
          invoice_number: invoice || undefined,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-service-leads"] });
      const eventByStatus: Partial<Record<ServiceLeadStatus, string>> = {
        qualified: "lead_qualified",
        demo_sent: "demo_completed",
        proposal_sent: "proposal_sent",
        deposit_pending: "deposit_started",
        won: "pilot_launched",
      };
      const event = eventByStatus[status];
      if (event) trackEvent(event, { service_model: lead.service_model, funnel_stage: status });
      toast.success("Lead updated.");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not update lead."),
  });
  const invoiceMutation = useMutation({
    mutationFn: async () => {
      const created = await createInvoice({
        data: {
          client_name: lead.contact_name,
          client_email: lead.email,
          client_organization: lead.business_name,
          service_type: "Automation",
          title: `30-Day ${lead.service_model.replace(/-/g, " ")} Pilot`,
          description: `Fixed-scope recovery pilot for ${lead.business_name}, focused on: ${lead.primary_leak}`,
          line_items: [
            {
              description: "30-Day Recovery Pilot",
              amount_cents: 150000,
            },
          ],
          notes: `Created from recovery lead ${lead.id}. Third-party software and usage costs are billed separately. No revenue outcome is guaranteed.`,
        },
      });

      await update({
        data: {
          id: lead.id,
          status: "deposit_pending",
          assigned_owner: owner || undefined,
          admin_notes: notes || undefined,
          invoice_number: created.invoice_number,
        },
      });
      return created;
    },
    onSuccess: async (created) => {
      setInvoice(created.invoice_number);
      setStatus("deposit_pending");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin-service-leads"] }),
        queryClient.invalidateQueries({ queryKey: ["admin_client_invoices"] }),
      ]);
      trackEvent("proposal_sent", {
        service_model: lead.service_model,
        funnel_stage: "deposit_pending",
      });
      toast.success(`Pilot invoice ${created.invoice_number} created and linked.`);
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not create the pilot invoice."),
  });
  return (
    <article className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-xl font-semibold">{lead.business_name}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {lead.service_model.replace(/-/g, " ")}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground">
              {lead.status.replace(/_/g, " ")}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {lead.industry} · {lead.team_size} staff · {lead.locations} location
            {lead.locations === 1 ? "" : "s"} · {lead.monthly_volume} monthly volume
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            <a className="font-medium text-primary hover:underline" href={`mailto:${lead.email}`}>
              {lead.contact_name} · {lead.email}
            </a>
            <a className="font-medium text-primary hover:underline" href={`tel:${lead.phone}`}>
              {lead.phone}
            </a>
            {lead.website && (
              <a
                className="inline-flex items-center gap-1 text-primary hover:underline"
                href={lead.website}
                target="_blank"
                rel="noreferrer"
              >
                Website <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          Submitted {new Date(lead.created_at).toLocaleString()} ({Intl.DateTimeFormat().resolvedOptions().timeZone || "local"})
        </p>
      </div>
      <div className="mt-5 grid gap-4 rounded-2xl bg-muted/35 p-5 lg:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Primary leak
          </p>
          <p className="mt-2 text-sm">{lead.primary_leak}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Desired outcome
          </p>
          <p className="mt-2 text-sm">{lead.desired_outcome}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Fit signals
          </p>
          <p className="mt-2 text-sm">
            Timing: {lead.urgency.replace(/-/g, " ")}
            <br />
            Budget: {lead.budget_range.replace(/-/g, "–")}
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-[0.7fr_0.8fr_1.5fr_auto] lg:items-end">
        <label className="space-y-1.5 text-sm font-medium">
          Pipeline status
          <select
            className={`${selectClass} block w-full`}
            value={status}
            onChange={(event) => setStatus(event.target.value as ServiceLeadStatus)}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Assigned owner
          <Input value={owner} maxLength={120} onChange={(event) => setOwner(event.target.value)} />
        </label>
        <label className="space-y-1.5 text-sm font-medium">
          Invoice number
          <Input
            value={invoice}
            maxLength={80}
            placeholder="MIT-2026-123"
            onChange={(event) => setInvoice(event.target.value)}
          />
        </label>
        <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
      <label className="mt-4 block space-y-1.5 text-sm font-medium">
        Private admin notes
        <Textarea
          value={notes}
          maxLength={2000}
          rows={3}
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
        {lead.invoice_number || invoice ? (
          <>
            <Button asChild variant="outline">
              <Link to="/admin/invoices">
                <ReceiptText className="h-4 w-4" /> Manage linked invoice
              </Link>
            </Button>
            <InvoiceEmailDialog
              invoiceNumber={lead.invoice_number || invoice}
              clientEmail={lead.email}
            />
          </>
        ) : (
          <Button
            type="button"
            onClick={() => invoiceMutation.mutate()}
            disabled={invoiceMutation.isPending}
          >
            {invoiceMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ReceiptText className="h-4 w-4" />
            )}
            {invoiceMutation.isPending ? "Creating invoice…" : "Create $1,500 pilot invoice"}
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          Creates a 50% deposit / 50% final-payment invoice. It is not emailed automatically.
        </p>
      </div>
    </article>
  );
}
