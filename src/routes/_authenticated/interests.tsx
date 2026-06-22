import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getMyInterests, saveMyInterests, resetMyInterests } from "@/lib/interests.functions";
import { listAgents, listArticles, listProducts } from "@/lib/public.functions";
import { useInterests } from "@/hooks/use-interests";

const CONTENT_TYPES = ["Article", "Tutorial", "Framework", "Research", "Best Practice", "Implementation Guide"];

export const Route = createFileRoute("/_authenticated/interests")({
  head: () => ({ meta: [{ title: "Interests — Melanated In Tech" }] }),
  component: InterestsPage,
});

function InterestsPage() {
  const qc = useQueryClient();
  const fetch = useServerFn(getMyInterests);
  const save = useServerFn(saveMyInterests);
  const reset = useServerFn(resetMyInterests);
  const fetchAgents = useServerFn(listAgents);
  const fetchArticles = useServerFn(listArticles);
  const fetchProducts = useServerFn(listProducts);

  const me = useQuery({ queryKey: ["my-interests"], queryFn: () => fetch() });
  const agents = useQuery({ queryKey: ["agents"], queryFn: () => fetchAgents() });
  const articles = useQuery({ queryKey: ["articles"], queryFn: () => fetchArticles() });
  const products = useQuery({ queryKey: ["products"], queryFn: () => fetchProducts() });

  const { clear: clearArticles } = useInterests("article");
  const { clear: clearAgents } = useInterests("agent");
  const { clear: clearProducts } = useInterests("product");

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    for (const a of agents.data ?? []) set.add(a.category);
    for (const a of articles.data ?? []) set.add(a.category);
    for (const p of products.data ?? []) set.add(p.category);
    return [...set].sort();
  }, [agents.data, articles.data, products.data]);

  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (me.data) {
      setSelectedCats(me.data.categories ?? []);
      setSelectedTypes(me.data.content_types ?? []);
    }
  }, [me.data]);

  function toggle<T>(arr: T[], v: T): T[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
  }

  async function onSave() {
    setSaving(true);
    try {
      await save({ data: { categories: selectedCats, content_types: selectedTypes } });
      toast.success("Interests saved.");
      qc.invalidateQueries({ queryKey: ["my-interests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onReset() {
    setSaving(true);
    try {
      await reset();
      clearArticles();
      clearAgents();
      clearProducts();
      setSelectedCats([]);
      setSelectedTypes([]);
      toast.success("Recommendations reset.");
      qc.invalidateQueries({ queryKey: ["my-interests"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Account"
        title="Your interests"
        description="Tell us what to prioritize. Your picks sync across devices when you're signed in and shape every recommendation we show."
      />
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link to="/account"><ArrowLeft className="mr-1 h-4 w-4" /> Back to account</Link>
          </Button>
        </div>

        <div className="space-y-8 rounded-2xl border bg-card p-6">
          <div>
            <h2 className="font-display text-lg font-semibold">Categories</h2>
            <p className="mt-1 text-sm text-muted-foreground">Pick any topics you want surfaced first across agents, knowledge, and products.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {allCategories.length === 0 && <p className="text-sm text-muted-foreground">Loading categories…</p>}
              {allCategories.map((c) => {
                const on = selectedCats.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCats((arr) => toggle(arr, c))}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-foreground/30"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold">Content types</h2>
            <p className="mt-1 text-sm text-muted-foreground">What format do you reach for most?</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {CONTENT_TYPES.map((c) => {
                const on = selectedTypes.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedTypes((arr) => toggle(arr, c))}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-foreground/30"
                    }`}
                  >
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <Button variant="outline" size="sm" onClick={onReset} disabled={saving}>
              <RotateCcw className="mr-1 h-3 w-3" /> Reset my recommendations
            </Button>
            <Button onClick={onSave} disabled={saving || me.isLoading}>
              {saving ? "Saving…" : "Save interests"}
            </Button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border bg-card/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Currently saved</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1"><Sparkles className="h-3 w-3" /> {selectedCats.length} categories</Badge>
            <Badge variant="secondary">{selectedTypes.length} content types</Badge>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
