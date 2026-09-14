import type { ReactNode } from "react";
import { useLocation } from "@tanstack/react-router";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { PaymentTestModeBanner } from "./payment-test-mode-banner";
import { FunnelAttribution } from "./funnel-attribution";

import { MobileAppDock } from "./mobile-app-dock";

// Conversion landing pages where the bottom app dock would compete with the
// page's single call to action.
const DOCK_HIDDEN_PREFIXES = ["/legal-intake"];

export function SiteLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const hideDock = DOCK_HIDDEN_PREFIXES.some(
    (prefix) =>
      location.pathname === prefix || location.pathname.startsWith(prefix + "/"),
  );
  return (
    <div
      className={`flex min-h-screen flex-col ${
        hideDock ? "" : "pb-[calc(5.5rem+env(safe-area-inset-bottom))]"
      } md:pb-0`}
    >
      <FunnelAttribution />
      <PaymentTestModeBanner />
      <SiteHeader />
      <main className="min-w-0 flex-1 overflow-x-hidden">{children}</main>
      <SiteFooter />
      {!hideDock && <MobileAppDock />}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {eyebrow && (
          <p className="text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</p>
        )}
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{description}</p>
        )}
        {actions && <div className="mt-6">{actions}</div>}
      </div>
    </section>
  );
}



