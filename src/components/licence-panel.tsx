"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { PaymentMarks } from "@/components/payment-marks";
import type { BeatView } from "@/lib/data";
import { formatGBP } from "@/lib/money";
import { cn } from "@/lib/cn";

export function LicencePanel({ beat }: { beat: BeatView }) {
  const router = useRouter();
  const cart = useCart();
  const defaultId = beat.licences[1]?.id ?? beat.licences[0]?.id;
  const [selectedId, setSelectedId] = useState(defaultId);
  const selected = useMemo(
    () => beat.licences.find((item) => item.id === selectedId) ?? beat.licences[0],
    [beat.licences, selectedId],
  );

  function addAndGo(destination: "cart" | "stay") {
    if (!selected || beat.exclusiveSold) return;
    cart.addItem({
      beatId: beat.id,
      slug: beat.slug,
      title: beat.title,
      coverPath: beat.coverPath,
      licenceId: selected.id,
      licenceName: selected.name,
      licenceSlug: selected.slug,
      pricePence: selected.pricePence,
    });
    if (destination === "cart") router.push("/cart");
  }

  if (beat.exclusiveSold) {
    return (
      <aside className="rounded-3xl border border-line bg-card p-5">
        <h2 className="font-display text-xl font-semibold">Choose your licence</h2>
        <p className="mt-4 text-sm text-muted">
          Exclusive rights for this beat have been sold. Tagged previews remain up so you can still hear the record.
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-3xl border border-line bg-card p-5">
      <h2 className="font-display text-xl font-semibold">Choose your licence</h2>
      <p className="mt-1 text-sm text-muted">Radio cards — pick a tier, then check out with Stripe.</p>
      <fieldset className="mt-5 space-y-3">
        <legend className="sr-only">Licence</legend>
        {beat.licences.map((licence) => {
          const active = licence.id === selected?.id;
          return (
            <label
              key={licence.id}
              className={cn(
                "block cursor-pointer rounded-2xl border p-4 transition",
                active ? "border-accent bg-accent/8 shadow-[0_0_0_1px_#b8ff3c]" : "border-line hover:border-zinc-500",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="licence"
                    className="accent-[#b8ff3c]"
                    checked={active}
                    onChange={() => setSelectedId(licence.id)}
                  />
                  <div>
                    <p className="font-medium text-ink">{licence.name}</p>
                    <p className="text-xs text-muted">{licence.fileLabel}</p>
                  </div>
                </div>
                <p className="font-display text-lg text-ink">{formatGBP(licence.pricePence)}</p>
              </div>
            </label>
          );
        })}
      </fieldset>

      {selected && (
        <div className="mt-5 rounded-2xl bg-bg p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Licence summary</p>
          <p className="mt-2 text-sm text-ink/90">{selected.summary}</p>
          <ul className="mt-3 space-y-1.5">
            {selected.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted">
                <Check size={14} className="mt-0.5 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <a href="/licenses" className="mt-3 inline-block text-sm text-accent hover:underline">
            Read full licence terms
          </a>
        </div>
      )}

      <button
        type="button"
        onClick={() => addAndGo("cart")}
        className="mt-5 w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-ink transition hover:brightness-110"
      >
        Buy with Stripe — {selected ? formatGBP(selected.pricePence) : ""}
      </button>
      <button
        type="button"
        onClick={() => addAndGo("stay")}
        className="mt-2 w-full rounded-full border border-line py-3 text-sm font-medium text-ink hover:border-accent"
      >
        Add to cart
      </button>
      <PaymentMarks />
    </aside>
  );
}
