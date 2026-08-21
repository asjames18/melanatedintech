import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

/** Map raw Supabase/OAuth error text to something a person can act on. */
function friendlyAuthError(raw: string, mode: "signin" | "signup"): string {
  const m = raw.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "That email already has an account. Try signing in instead.";
  }
  if (m.includes("invalid login credentials")) {
    return "Email or password doesn't match. Check both, or reset your password.";
  }
  if (m.includes("email not confirmed")) {
    return "Confirm your email first — check your inbox for the link we sent.";
  }
  if (m.includes("token already in use") || m.includes("already in use")) {
    return "That Google account is already linked elsewhere. Try signing in with email and password.";
  }
  if (m.includes("rate") && m.includes("limit")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return raw || (mode === "signup" ? "Could not create your account." : "Authentication failed.");
}

import { buildSeoMeta } from "@/lib/seo";

export const Route = createFileRoute("/auth")({
  head: () => {
    const seo = buildSeoMeta({
      title: "Sign in — Melanated In Tech",
      description: "Sign in or create your Melanated In Tech account to save agents and access the builder community.",
      url: "/auth",
    });
    return {
      meta: [
        ...seo.meta,
        { name: "robots", content: "noindex, nofollow" },
      ],
      links: seo.links,
    };
  },
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signedUp, setSignedUp] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/community", replace: true });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        setSignedUp(true);
        toast.success("Account created — welcome to Melanated In Tech.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/community" });
      }
    } catch (err) {
      toast.error(friendlyAuthError(err instanceof Error ? err.message : "", mode));
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    try {
      setLoading(true);
      const redirectTo = new URL("/auth", window.location.origin).toString();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });
      if (error) throw error;
      if (!data.url) throw new Error("Google sign-in could not be started.");

      window.location.assign(data.url);
    } catch (err) {
      setLoading(false);
      toast.error(friendlyAuthError(err instanceof Error ? err.message : "", mode));
    }
  }

  return (
    <SiteLayout>
      <section className="mx-auto flex max-w-md flex-col items-stretch px-4 py-20 sm:px-6">
        {signedUp ? (
          <div className="text-center">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="mt-4 font-display text-3xl font-semibold">Check your email</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and sign in.
            </p>
            <p className="mt-6 text-sm text-muted-foreground">
              Already confirmed?{" "}
              <button
                type="button"
                onClick={() => { setSignedUp(false); setMode("signin"); }}
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </button>
            </p>
          </div>
        ) : (
          <>
            <div className="text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-foreground text-background">
                <Sparkles className="h-5 w-5" />
              </span>
              <h1 className="mt-4 font-display text-3xl font-semibold">
                {mode === "signin" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to save agents and access your account."
                  : "Save agents, get early access, and join the builder community."}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-6">
              <Button type="button" variant="outline" className="w-full" onClick={onGoogle} disabled={loading}>
                {loading ? "Opening Google…" : "Continue with Google"}
              </Button>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
              </div>
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="font-medium text-primary hover:underline"
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">
                Back home
              </Link>
            </p>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
