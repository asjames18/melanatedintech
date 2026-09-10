import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const joinSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  product_slug: z.string().trim().min(1).max(120),
  interest: z.string().trim().max(200).optional(),
  // Honeypot: real users never fill this hidden field; bots do.
  hp: z.string().trim().max(200).optional(),
});

export const joinProductWaitlist = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => joinSchema.parse(d))
  .handler(async ({ data }) => {
    // Silently accept honeypot hits so bots can't distinguish a rejection.
    if (data.hp) return { ok: true };

    const { getClientIpHash, tooManyRecent } = await import("@/lib/rate-limit.server");
    const ipHash = await getClientIpHash();
    if (ipHash && (await tooManyRecent("waitlist_signups", ipHash, 60, 10))) {
      throw new Error("Too many signups from this network. Please try again later.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const base = {
      email: data.email.toLowerCase(),
      product_slug: data.product_slug,
      source: `product:${data.product_slug}`,
      interest: data.interest ?? null,
    };
    // Try with ip_hash; degrade to the bare row if the column isn't there yet.
    let { error } = await supabaseAdmin
      .from("waitlist_signups")
      .insert({ ...base, ip_hash: ipHash } as never);
    if (error && /ip_hash|column/i.test(error.message)) {
      ({ error } = await supabaseAdmin.from("waitlist_signups").insert(base));
    }
    if (error) {
      if (error.code === "23505" || error.message.toLowerCase().includes("duplicate")) {
        return { ok: true, alreadyOn: true as const };
      }
      throw new Error("Could not join waitlist. Please try again.");
    }

    const { enqueueWelcomeEmail } = await import("@/lib/welcome-email.server");
    await enqueueWelcomeEmail(data.email);

    return { ok: true };
  });

export const getProductWaitlistCount = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ product_slug: z.string().trim().min(1).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error } = await supabaseAdmin
      .from("waitlist_signups")
      .select("id", { count: "exact", head: true })
      .eq("product_slug", data.product_slug);
    if (error) throw new Error("Could not load waitlist count.");
    return { count: count ?? 0 };
  });
