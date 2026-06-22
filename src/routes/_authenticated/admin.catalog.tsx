import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { adminCatalogStats } from "@/lib/catalog.functions";
import { AlertTriangle, CheckCircle2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/catalog")({
  head: () => ({ meta: [{ title: "Catalog verification — Admin" }] }),
  component: CatalogPage,
});

function CatalogPage() {
  const get = useServerFn(adminCatalogStats);
  const q = useQuery({ queryKey: ["admin-catalog"], queryFn: () => get() });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Admin"
        title="Catalog verification"
        description="Counts of agent categories, knowledge topics, product tiers, and service lines — with flags for empty buckets."
      />
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin"><ArrowLeft className="mr-1 h-4 w-4" /> Back to admin</Link>
          </Button>
        </div>
        {q.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
        {q.error && <p className="text-sm text-destructive">{(q.error as Error).message}</p>}
        {q.data && (
          <div className="grid gap-6 md:grid-cols-2">
            {q.data.map((section) => (
              <div key={section.kind} className="rounded-2xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">{section.title}</h2>
                  <Badge variant="outline">{section.total} total</Badge>
                </div>
                <ul className="mt-4 divide-y divide-border">
                  {section.buckets.length === 0 && (
                    <li className="py-3 text-sm text-muted-foreground">No data yet.</li>
                  )}
                  {section.buckets.map((b) => (
                    <li key={b.label} className="flex items-center justify-between py-2 text-sm">
                      <span className="flex items-center gap-2">
                        {b.missing ? (
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        )}
                        {b.label}
                      </span>
                      <span className={b.missing ? "text-muted-foreground" : "font-medium"}>{b.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </SiteLayout>
  );
}
