"use client";

import { useState } from "react";
import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import { useCart } from "@/components/cart-provider";
import { PaymentMarks } from "@/components/payment-marks";
import { formatGBP } from "@/lib/money";

export function CartView() {
  const cart = useCart();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function checkout() {
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          items: cart.items.map((item) => ({
            beatId: item.beatId,
            licenceId: item.licenceId,
          })),
        }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Checkout failed.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setPending(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="rounded-3xl border border-line bg-card px-6 py-16 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <p className="mt-3 text-muted">Browse the catalog and pick a licence.</p>
        <Link
          href="/catalog"
          className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-ink"
        >
          Browse beats
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div key={`${item.beatId}-${item.licenceId}`} className="flex gap-4 rounded-2xl border border-line bg-card p-4">
            <CoverImage src={item.coverPath} alt="" className="h-20 w-20 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <Link href={`/beats/${item.slug}`} className="font-medium hover:text-glow">
                {item.title}
              </Link>
              <p className="mt-1 text-sm text-muted">{item.licenceName}</p>
              <button
                type="button"
                onClick={() => cart.removeItem(item.beatId, item.licenceId)}
                className="mt-2 text-xs text-muted hover:text-glow"
              >
                Remove
              </button>
            </div>
            <p className="font-display text-lg">{formatGBP(item.pricePence)}</p>
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-3xl border border-line bg-card p-5">
        <h2 className="font-display text-xl">Checkout</h2>
        <p className="mt-4 flex justify-between text-sm">
          <span className="text-muted">Total</span>
          <span className="font-medium">{formatGBP(cart.totalPence)}</span>
        </p>
        <label className="mt-5 block text-sm">
          Email for delivery
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40"
            placeholder="you@email.com"
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="button"
          disabled={pending}
          onClick={checkout}
          className="mt-5 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink disabled:opacity-60"
        >
          {pending ? "Redirecting…" : "Continue to Stripe"}
        </button>
        <PaymentMarks />
      </aside>
    </div>
  );
}
