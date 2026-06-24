import { Link } from "@tanstack/react-router";
import { SITE, NAV } from "@/lib/site";
import { WaitlistForm } from "./waitlist-form";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-1">
          <p className="font-display text-lg font-semibold">{SITE.name}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            The home for AI agents — knowledge, marketplace, products, and services for the people
            putting agents to work.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 text-sm lg:col-span-1">
          <div>
            <p className="font-medium">Platform</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="hover:text-foreground">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-medium">Company</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li>
                <Link to="/about" className="hover:text-foreground">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-foreground">
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-1">
          <p className="text-sm font-medium">Get early access</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New agents, blueprints, and field notes — straight to your inbox.
          </p>
          <div className="mt-3">
            <WaitlistForm source="footer" compact />
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </p>
          <p>Built for the AI agent generation.</p>
        </div>
      </div>
    </footer>
  );
}
