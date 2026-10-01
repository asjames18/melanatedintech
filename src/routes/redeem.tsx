import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { SiteLayout, PageHeader } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { buildSeoMeta, breadcrumbLd, ldScript } from "@/lib/seo";
import { redeemBundleCode, getBundleStatus } from "@/lib/redeem.functions";
import { BUNDLE_AGENT_SLUGS } from "@/lib/redeem";

const AGENT_NAMES: Record<string, string> = {
  "personal-chief-of-staff": "Personal Chief of Staff",
  "pa-inbox-zero": "Inbox Zero Assistant",
  "marketing-campaign-strategist": "Marketing Campaign Strategist",
  "marketing-seo-researcher": "SEO Researcher",
  "customer-support-agent": "Customer Support Agent",
};

export const Route = createFileRoute("/redeem")({
  head: () => ({
    ...buildSeoMeta({
      title: "Redeem your bundle code | Melanated in Tech",
      description:
        "Redeem your AppSumo bundle code to unlock all five Melanated in Tech AI agents — lifetime access with a 200-conversation weekly allowance.",
      url: "/redeem",
    }),
    scripts: [
      ldScript(
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Redeem", path: "/redeem" },
        ]),
      ),
    ],
  }),
  component: Redeem,
});

function BundleActiveCard({ headline, sub }: { headline: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-8 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
      <h2 className="mt-4 font-display text-2xl font-semibold">{headline}</h2>
      <p className="mt-2 text-muted-foreground">{sub}</p>
      <ul className="mt-6 space-y-2 text-left">
        {BUNDLE_AGENT_SLUGS.map((slug) => (
          <li key={slug}>
            <Link
              to="/agents/$slug"
              params={{ slug }}
              className="flex items-center justify-between rounded-xl border border-border px-4 py-3 transition-colors hover:border-primary"
            >
              <span className="font-medium">{AGENT_NAMES[slug] ?? slug}</span>
              <span className="text-sm text-primary">Open →</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Redeem() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Already redeemed? Skip the code box and show bundle status instead.
  const getBundleStatusFn = useServerFn(getBundleStatus);
  const { data: bundleStatus } = useQuery({
    queryKey: ["bundle-status"],
    queryFn: () => getBundleStatusFn(),
    enabled: signedIn === true && !done,
    staleTime: 30_000,
  });
  const alreadyRedeemed = signedIn === true && bundleStatus?.isRedeemer === true;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !code.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await redeemBundleCode({ data: { code } });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="AppSumo bundle"
        title="Redeem your code."
        description="One code unlocks all five agents for life — with 200 conversations per week, refilled every Monday."
      />
      <section className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
        {done ? (
          <BundleActiveCard
            headline="All five agents unlocked."
            sub="Your bundle is active. Start with any agent below."
          />
        ) : alreadyRedeemed ? (
          <BundleActiveCard
            headline="Your bundle is active."
            sub={`${bundleStatus?.remaining ?? 0} of ${bundleStatus?.allowance ?? 200} conversations left this week · resets Monday. Start with any agent below.`}
          />
        ) : signedIn === false ? (
          <div className="rounded-3xl border border-border bg-card p-8 text-center">
            <KeyRound className="mx-auto h-10 w-10 text-primary" />
            <h2 className="mt-4 font-display text-xl font-semibold">Sign in first.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your bundle is tied to your Melanated in Tech account. Sign in (or create one), then
              come back here to redeem your code.
            </p>
            <Button asChild className="mt-6">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="rounded-3xl border border-border bg-card p-8"
          >
            <label htmlFor="redeem-code" className="text-sm font-medium">
              Bundle code
            </label>
            <input
              id="redeem-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="MITB-XXXXXX-XXXXXX"
              autoComplete="off"
              spellCheck={false}
              className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-lg tracking-wider uppercase placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none"
            />
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={busy || !code.trim()} className="mt-5 w-full">
              {busy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Redeeming…
                </>
              ) : (
                "Redeem code"
              )}
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">
              One code per account. Your weekly allowance of 200 agent conversations refills every
              Monday; if you ever use it up, you keep chatting on the free tier until the reset.
            </p>
          </form>
        )}
      </section>
    </SiteLayout>
  );
}
