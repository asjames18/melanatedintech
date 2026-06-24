import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required.");
}

export type CatalogBucket = {
  label: string;
  count: number;
  missing: boolean;
};

export type CatalogSection = {
  kind: "agents" | "articles" | "products" | "services";
  title: string;
  total: number;
  buckets: CatalogBucket[];
};

export const adminCatalogStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<CatalogSection[]> => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [agents, articles, products, services] = await Promise.all([
      supabaseAdmin.from("agents").select("category"),
      supabaseAdmin.from("articles").select("category"),
      supabaseAdmin.from("products").select("category, tier"),
      supabaseAdmin.from("services").select("name"),
    ]);

    const errs = [agents.error, articles.error, products.error, services.error].filter(Boolean);
    if (errs.length) throw new Error(errs.map((e) => e!.message).join("; "));

    const groupBy = (
      rows: Array<{ category?: string | null }> | null,
      fallback = "Uncategorized",
    ) => {
      const m = new Map<string, number>();
      for (const r of rows ?? []) {
        const k = (r.category ?? fallback) || fallback;
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      return [...m.entries()]
        .map(([label, count]): CatalogBucket => ({ label, count, missing: count === 0 }))
        .sort((a, b) => b.count - a.count);
    };

    const productTiers = (() => {
      const m = new Map<string, number>();
      for (const r of products.data ?? []) {
        const k = String(r.tier ?? "unknown");
        m.set(k, (m.get(k) ?? 0) + 1);
      }
      // Always report the three expected tiers so missing ones surface.
      const expected = ["free", "premium", "custom"];
      const out: CatalogBucket[] = expected.map((label) => {
        const count = m.get(label) ?? 0;
        return { label, count, missing: count === 0 };
      });
      for (const [label, count] of m.entries()) {
        if (!expected.includes(label)) out.push({ label, count, missing: false });
      }
      return out;
    })();

    return [
      {
        kind: "agents",
        title: "Agent categories",
        total: agents.data?.length ?? 0,
        buckets: groupBy(agents.data),
      },
      {
        kind: "articles",
        title: "Knowledge categories",
        total: articles.data?.length ?? 0,
        buckets: groupBy(articles.data),
      },
      {
        kind: "products",
        title: "Product tiers",
        total: products.data?.length ?? 0,
        buckets: productTiers,
      },
      {
        kind: "services",
        title: "Service lines",
        total: services.data?.length ?? 0,
        buckets: groupBy((services.data ?? []).map((r) => ({ category: r.name }))),
      },
    ];
  });
