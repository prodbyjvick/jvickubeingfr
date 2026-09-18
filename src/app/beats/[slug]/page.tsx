import { notFound } from "next/navigation";
import { BeatPlayer } from "@/components/beat-player";
import { LicencePanel } from "@/components/licence-panel";
import { getBeatBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const beat = await getBeatBySlug(slug);
  if (!beat) return { title: "Beat" };
  return { title: beat.title, description: beat.description };
}

export default async function BeatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const beat = await getBeatBySlug(slug);
  if (!beat) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <BeatPlayer beat={beat} />
      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <section>
          <h2 className="font-display text-2xl font-semibold">The record</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">{beat.description}</p>
          <dl className="mt-6 grid max-w-lg grid-cols-2 gap-4 text-sm">
            <div className="rounded-2xl border border-line bg-card p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-muted">Genre</dt>
              <dd className="mt-1">{beat.genre}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-muted">BPM</dt>
              <dd className="mt-1">{beat.bpm}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-muted">Key</dt>
              <dd className="mt-1">{beat.musicalKey}</dd>
            </div>
            <div className="rounded-2xl border border-line bg-card p-4">
              <dt className="text-xs uppercase tracking-[0.16em] text-muted">Producer</dt>
              <dd className="mt-1">prodbyjvick</dd>
            </div>
          </dl>
        </section>
        <LicencePanel beat={beat} />
      </div>
    </div>
  );
}
