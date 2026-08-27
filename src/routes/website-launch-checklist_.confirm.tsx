import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { confirmWebsiteLaunchChecklist } from "@/lib/public.functions";

export const Route = createFileRoute("/website-launch-checklist_/confirm")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: WebsiteLaunchChecklistConfirmationPage,
});

function WebsiteLaunchChecklistConfirmationPage() {
  const { token } = useSearch({ from: "/website-launch-checklist_/confirm" });
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function confirmRequest() {
    if (!token) {
      setState("error");
      return;
    }
    setState("working");
    try {
      await confirmWebsiteLaunchChecklist({ data: { token } });
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <main className="min-h-[70vh] bg-[#f7f3ee] px-5 py-16 text-[#2b2118] sm:px-8">
      <section className="mx-auto max-w-2xl border border-[#ded3c7] bg-white px-6 py-10 sm:px-10">
        {state === "done" ? (
          <>
            <CheckCircle2 className="h-8 w-8 text-[#8a5a2b]" aria-hidden="true" />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-[#8a5a2b]">Request confirmed</p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight">Your checklist is on its way.</h1>
            <p className="mt-5 text-lg leading-8 text-[#64564b]">We have confirmed your request and will send the Website Launch Readiness Checklist to this address. Website Launch Sprint updates remain paused until the campaign is activated and always include an unsubscribe option.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a5a2b]">Email confirmation</p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight">Confirm your checklist request</h1>
            <p className="mt-5 text-lg leading-8 text-[#64564b]">Click the button below to confirm that you requested the Website Launch Readiness Checklist and related Website Launch Sprint updates. This extra step prevents automated mail scanners from enrolling or sending on your behalf.</p>
            {!token && <p className="mt-5 border-l-4 border-[#8a5a2b] bg-[#faf8f5] px-4 py-3 text-sm text-[#64564b]">This link is missing its confirmation token. Please use the link in the email you received.</p>}
            {state === "error" && <p className="mt-5 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900">We could not confirm this request. The link may be invalid or expired. Please request the checklist again.</p>}
            <button type="button" onClick={confirmRequest} disabled={!token || state === "working"} className="mt-8 bg-[#2b2118] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {state === "working" ? "Confirming request…" : "Confirm and send my checklist"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
