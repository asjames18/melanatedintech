const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

export function PaymentTestModeBanner() {
  if (!clientToken) return null;
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-accent2/30 bg-accent2/10 px-4 py-2 text-center text-xs text-foreground/80">
        Payments are in <strong>test mode</strong>. Use card{" "}
        <code className="rounded bg-background/60 px-1 py-0.5 font-mono">4242 4242 4242 4242</code>{" "}
        with any future expiry &amp; CVC.
      </div>
    );
  }
  return null;
}
