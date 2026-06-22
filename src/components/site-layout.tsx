import type { ReactNode } from "react";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { PaymentTestModeBanner } from "./payment-test-mode-banner";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PaymentTestModeBanner />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

export function PageHeader({
  eyebrow, title, description,
}: { eyebrow?: string; title: string; description?: string }) {
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
      </div>
    </section>
  );
}
