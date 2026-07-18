import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/integrations/supabase/env";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(getSupabaseUrl()!, getSupabasePublishableKey()!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

const joinSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  product_slug: z.string().trim().min(1).max(120),
  interest: z.string().trim().max(200).optional(),
});

export const joinProductWaitlist = createServerFn({ method: "POST" })
  .validator((d: unknown) => joinSchema.parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { error } = await sb.from("waitlist_signups").insert({
      email: data.email,
      product_slug: data.product_slug,
      source: `product:${data.product_slug}`,
      interest: data.interest ?? null,
    });
    if (error) {
      // unique-ish? just surface a friendly message
      if (error.code === "23505") return { ok: true, alreadyOn: true as const };
      throw new Error(error.message);
    }

    const { enqueueWelcomeEmail } = await import("@/lib/welcome-email.server");
    await enqueueWelcomeEmail(data.email);

    return { ok: true };
  });

export const getProductWaitlistCount = createServerFn({ method: "GET" })
  .validator((d: unknown) => z.object({ product_slug: z.string().trim().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { count, error } = await sb
      .from("waitlist_signups")
      .select("*", { count: "exact", head: true })
      .eq("product_slug", data.product_slug);
    if (error) throw new Error(error.message);
    return { count: count ?? 0 };
  });
