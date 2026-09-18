import Link from "next/link";
import { BeatCard } from "@/components/beat-card";
import { FeaturedPanel } from "@/components/featured-panel";
import { brand } from "@/lib/brand";
import { getFeaturedBeat, listPublishedBeats } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featured, beats] = await Promise.all([getFeaturedBeat(), listPublishedBeats()]);
  const latest = beats.slice(0, 8);

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-accent">{brand.producer}</p>
          <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl">
            Own the sound.
            <br />
            Sell direct.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-muted">
            {brand.description} Instant delivery after Stripe Checkout — including Apple Pay on supported devices.
            Buyers worldwide, including Nigeria; settlement to a UK bank.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink hover:brightness-110"
            >
              Browse beats
            </Link>
            <Link
              href="/licenses"
              className="rounded-full border border-line px-6 py-3 text-sm font-medium hover:border-accent"
            >
              Licence terms
            </Link>
          </div>
        </div>
        {featured ? <FeaturedPanel beat={featured} /> : null}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-accent">Catalog</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Latest drops</h2>
          </div>
          <Link href="/catalog" className="text-sm text-accent hover:underline">
            View catalogue
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {(latest.length > 0 ? latest : beats).map((beat) => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      </section>
    </div>
  );
}
