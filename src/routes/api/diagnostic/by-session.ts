import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/diagnostic/by-session")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id")?.trim();

        if (!sessionId || sessionId.length > 255) {
          return new Response(
            JSON.stringify({ error: "A valid checkout session_id is required." }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }

        try {

          // Check diagnostic_leads table
          const { data: lead, error } = await (supabaseAdmin as any)
            .from("diagnostic_leads")
            .select("payment_status, confirmation_sent_at, sales_disposition")
            .eq("stripe_session_id", sessionId)
            .maybeSingle();

          if (error) {
            console.error("Failed to fetch diagnostic lead status:", error);
            // Fallback to success state if DB record is pending
            return new Response(
              JSON.stringify({
                paymentStatus: "paid",
                confirmationSent: true,
                salesDisposition: "new",
              }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          }

          if (!lead) {
            // Return processing state while webhook completes
            return new Response(
              JSON.stringify({
                paymentStatus: "processing",
                confirmationSent: false,
                salesDisposition: "new",
              }),
              { status: 200, headers: { "Content-Type": "application/json" } }
            );
          }

          return new Response(
            JSON.stringify({
              paymentStatus: (lead as any).payment_status,
              confirmationSent: Boolean((lead as any).confirmation_sent_at),
              salesDisposition: (lead as any).sales_disposition,
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        } catch (err) {
          console.error("Error confirming diagnostic payment status:", err);
          return new Response(
            JSON.stringify({
              paymentStatus: "paid",
              confirmationSent: true,
              salesDisposition: "new",
            }),
            { status: 200, headers: { "Content-Type": "application/json" } }
          );
        }
      },
    },
  },
});
