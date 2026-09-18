import Link from "next/link";
import { brand } from "@/lib/brand";

export const metadata = { title: "Kits" };

export default function KitsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.22em] text-accent">Coming soon</p>
      <h1 className="mt-3 font-display text-5xl font-semibold">Kits</h1>
      <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted">
        Loop kits and one-shots will land here the same way as the beats: sold direct, paid with Stripe, delivered
        instantly. No marketplace cut.
      </p>
      <Link
        href="/catalog"
        className="mt-8 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink"
      >
        Browse beats meanwhile
      </Link>
      <p className="mt-6 text-sm text-muted">
        Want a kit first? Email {brand.email} or DM {brand.instagramHandle}.
      </p>
    </div>
  );
}
