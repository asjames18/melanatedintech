import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ClipboardCheck, Smartphone, Sparkles } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { joinWebsiteLaunchChecklist } from "@/lib/public.functions";
import { trackEvent } from "@/lib/analytics";
import { funnelAttribution } from "@/components/funnel-attribution";
import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/website-launch-checklist")({
  head: () => ({
    ...buildSeoMeta({
      title: "Website Launch Readiness Checklist - Melanated In Tech",
      description:
        "Get a practical checklist for deciding whether your small-business website is ready to help the right people find and contact you.",
      url: "/website-launch-checklist",
    }),
  }),
  component: WebsiteLaunchChecklist,
});

function WebsiteLaunchChecklist() {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const join = useServerFn(joinWebsiteLaunchChecklist);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!z.string().email().safeParse(email).success) {
      toast.error("Please enter a valid email.");
      return;
    }
    if (!consent) {
      toast.error("Please confirm that you want the checklist and related updates.");
      return;
    }

    setLoading(true);
    try {
      const attribution = funnelAttribution();
      await join({
        data: {
          email,
          consent,
          hp: hp || undefined,
          source: typeof attribution.source === "string" ? attribution.source : undefined,
        },
      });
      setDone(true);
      setEmail("");
      trackEvent("website_launch_checklist_opted_in", {
        source: typeof attribution.source === "string" ? attribution.source : "direct_or_other",
        campaign: typeof attribution.campaign === "string" ? attribution.campaign : undefined,
      });
      toast.success("Check your inbox to confirm your request.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Free website readiness checklist"
        title="Is your website ready for the people you want to reach?"
        description="Get a practical, plain-language checklist for spotting the gaps that make a small-business website harder to trust, use, or act on."
      />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div>
            <div className="grid gap-4 sm:grid-cols-3">
              <ChecklistBenefit icon={<Smartphone className="h-5 w-5" />} title="Mobile first" text="Check whether your most important information works on a phone." />
              <ChecklistBenefit icon={<ClipboardCheck className="h-5 w-5" />} title="Clear next step" text="Make it obvious how the right visitor can contact or choose you." />
              <ChecklistBenefit icon={<Sparkles className="h-5 w-5" />} title="Credible basics" text="Review the trust, copy, and handoff details people notice first." />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Inside the checklist</p>
              <h2 className="mt-3 font-display text-2xl font-semibold">A useful review before you spend on a rebuild.</h2>
              <ul className="mt-6 space-y-4 text-sm text-muted-foreground">
                {[
                  "The first-screen test: can a visitor understand what you do and who you help?",
                  "The contact test: can the right person take the next step without hunting?",
                  "The mobile and accessibility basics that make a page easier to use.",
                  "A short decision guide: fix the basics, improve the current site, or scope a focused launch.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Already know you need a one-page launch?</span>
              <Link className="font-medium text-primary underline-offset-4 hover:underline" to="/work-with-us">
                See the $997 Website Launch Sprint <ArrowRight className="ml-1 inline h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
            {done ? (
              <div role="status" aria-live="polite">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <h2 className="mt-4 font-display text-2xl font-semibold">Your request is recorded.</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Check your inbox and confirm your request. We&apos;ll send the checklist only after you confirm the email address. Website Launch Sprint updates remain paused until the campaign is activated, and every marketing email includes an unsubscribe option.
                </p>
                <Button asChild className="mt-6">
                  <Link to="/work-with-us">Explore the Website Launch Sprint</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Get the checklist</p>
                <h2 className="mt-3 font-display text-2xl font-semibold">Make the next website decision with more clarity.</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Enter your email and we&apos;ll send a confirmation link. After you confirm, we&apos;ll deliver the checklist and, only if the paused campaign is activated later, a short series of practical Website Launch Sprint notes. No hype. No invented results.
                </p>

                <div className="absolute left-[-9999px] h-0 w-0 opacity-0" aria-hidden="true">
                  <label htmlFor="website-checklist-company">Company website</label>
                  <input id="website-checklist-company" name="company_website" tabIndex={-1} autoComplete="off" value={hp} onChange={(event) => setHp(event.target.value)} />
                </div>

                <div className="mt-6">
                  <label className="text-sm font-medium" htmlFor="website-checklist-email">Email address</label>
                  <Input id="website-checklist-email" className="mt-2" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
                </div>

                <label className="mt-5 flex items-start gap-3 text-sm leading-5 text-muted-foreground" htmlFor="website-checklist-consent">
                  <input id="website-checklist-consent" className="mt-1 h-4 w-4 shrink-0 accent-primary" type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} />
                  <span>I want the Website Launch Readiness Checklist and related Website Launch Sprint updates by email. I understand I can unsubscribe at any time.</span>
                </label>

                <Button className="mt-6 w-full" type="submit" disabled={loading}>
                  {loading ? "Saving your request…" : "Email me a confirmation link"}
                </Button>
                <p className="mt-4 text-xs leading-5 text-muted-foreground">We store your email and consent record to deliver this request and honor your communication choice. See our <Link className="underline underline-offset-4" to="/privacy">Privacy Policy</Link>.</p>
              </form>
            )}
          </div>
        </section>
      </main>
    </SiteLayout>
  );
}

function ChecklistBenefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <h2 className="mt-4 font-display text-base font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-5 text-muted-foreground">{text}</p>
    </div>
  );
}
