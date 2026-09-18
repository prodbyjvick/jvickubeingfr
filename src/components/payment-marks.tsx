export function PaymentMarks() {
  return (
    <div className="mt-4 space-y-2 text-center">
      <p className="text-xs text-muted">
        Pay securely with Stripe. Apple Pay appears at checkout on supported devices and browsers.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold tracking-wide text-ink">
        <span className="rounded-md border border-line bg-bg px-2 py-1">Apple Pay</span>
        <span className="rounded-md border border-line bg-bg px-2 py-1">Stripe</span>
        <span className="rounded-md border border-line bg-bg px-2 py-1">Visa</span>
        <span className="rounded-md border border-line bg-bg px-2 py-1">Mastercard</span>
      </div>
    </div>
  );
}
