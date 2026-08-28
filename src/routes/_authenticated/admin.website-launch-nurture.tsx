import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2, PauseCircle, PlayCircle, ShieldCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { adminGetWebsiteLaunchNurture, adminSetWebsiteLaunchNurture } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/website-launch-nurture")({
  head: () => ({ meta: [{ title: "Website Launch Nurture — Admin" }] }),
  component: WebsiteLaunchNurtureAdmin,
});

function WebsiteLaunchNurtureAdmin() {
  const list = useServerFn(adminGetWebsiteLaunchNurture);
  const update = useServerFn(adminSetWebsiteLaunchNurture);
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const query = useQuery({ queryKey: ["admin-website-launch-nurture"], queryFn: () => list(), retry: false });
  const mutation = useMutation({
    mutationFn: (enabled: boolean) => update({ data: { enabled } }),
    onSuccess: (_, enabled) => {
      toast.success(enabled ? "Website Launch nurture activated." : "Website Launch nurture paused.");
      void queryClient.invalidateQueries({ queryKey: ["admin-website-launch-nurture"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Could not update nurture state."),
  });

  if (query.error) {
    return <SiteLayout><div className="mx-auto max-w-xl px-4 py-24 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-primary" /><h1 className="mt-4 font-display text-2xl font-semibold">Admin access required</h1><p className="mt-2 text-sm text-muted-foreground">{(query.error as Error).message}</p><Button asChild variant="outline" className="mt-6"><Link to="/admin">Open admin</Link></Button></div></SiteLayout>;
  }
  if (query.isLoading || !query.data) return <SiteLayout><div className="mx-auto flex max-w-xl justify-center px-4 py-24"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div></SiteLayout>;

  const enabled = query.data.settings?.enabled ?? false;
  const enrollments = query.data.enrollments ?? [];
  const counts = enrollments.reduce<Record<string, number>>((summary, enrollment) => {
    summary[enrollment.status] = (summary[enrollment.status] ?? 0) + 1;
    return summary;
  }, {});

  async function toggle() {
    setBusy(true);
    try {
      await mutation.mutateAsync(!enabled);
    } finally {
      setBusy(false);
    }
  }

  return <SiteLayout>
    <PageHeader eyebrow="Protected marketing operations" title="Website Launch nurture" description="Checklist delivery requires an explicit opt-in and human confirmation. The three marketing follow-ups are paused by default and require first-send approval." actions={<Button asChild variant="outline"><Link to="/admin"><ArrowLeft className="h-4 w-4" /> Admin dashboard</Link></Button>} />
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">Campaign status</p><p className="mt-2 text-2xl font-semibold">{enabled ? "Active" : "Paused"}</p><p className="mt-1 text-sm text-muted-foreground">Only already confirmed checklist requests can receive the paused three-email follow-up. The checklist itself is delivered only after a recipient confirms their email. No external list is used.</p></div>
          <Button onClick={toggle} disabled={busy || mutation.isPending} className="gap-2">{busy || mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : enabled ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}{enabled ? "Pause nurture" : "Activate nurture"}</Button>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-4"><Metric label="Total requests" value={String(enrollments.length)} /><Metric label="Awaiting confirmation" value={String(counts.pending_confirmation ?? 0)} /><Metric label="Active follow-up" value={String(counts.active ?? 0)} /><Metric label="Completed / stopped" value={String((counts.completed ?? 0) + (counts.unsubscribed ?? 0) + (counts.suppressed ?? 0))} /></div>
      </div>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6"><h2 className="text-lg font-semibold">Safety rules</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">A contact must first opt in, then click a human-confirmation button before the checklist is delivered or an enrollment becomes eligible. Activation never adds historical signups or releases pending confirmations. Every due marketing message rechecks consent and the authoritative suppression table before entering the email queue, while the queue processor repeats the suppression check immediately before delivery. Activation is blocked until the commercial-email mailing address is configured. Operational contact notifications remain separate.</p></div>
    </section>
  </SiteLayout>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-muted/40 p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>; }
