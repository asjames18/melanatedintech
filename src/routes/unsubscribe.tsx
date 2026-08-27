import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { unsubscribeFromMarketing } from "@/lib/public.functions";

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const { token } = useSearch({ from: "/unsubscribe" });
  const [state, setState] = useState<"idle" | "working" | "done" | "error">("idle");

  async function confirmUnsubscribe() {
    if (!token) {
      setState("error");
      return;
    }
    setState("working");
    try {
      await unsubscribeFromMarketing({ data: { token } });
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a5a2b]">Preference updated</p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight">You’re unsubscribed.</h1>
            <p className="mt-5 text-lg leading-8 text-[#64564b]">You will no longer receive Website Launch Sprint marketing updates from this sequence. You may still receive a direct response to an inquiry you submitted.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a5a2b]">Email preferences</p>
            <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight">Unsubscribe from Website Launch updates</h1>
            <p className="mt-5 text-lg leading-8 text-[#64564b]">Click the button below to stop the Website Launch Sprint nurture sequence. This confirmation step helps prevent automated mail scanners from unsubscribing you by accident.</p>
            {!token && <p className="mt-5 border-l-4 border-[#8a5a2b] bg-[#faf8f5] px-4 py-3 text-sm text-[#64564b]">This link is missing its verification token. Please use the unsubscribe link from the email you received.</p>}
            {state === "error" && <p className="mt-5 border-l-4 border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900">We could not complete the request. The link may be invalid or expired. Please try the link again or contact us.</p>}
            <button type="button" onClick={confirmUnsubscribe} disabled={!token || state === "working"} className="mt-8 bg-[#2b2118] px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {state === "working" ? "Updating preferences…" : "Confirm unsubscribe"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
