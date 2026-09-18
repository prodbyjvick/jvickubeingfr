import { saveBeat } from "@/app/admin/actions";
import { AUDIO_ACCEPT, COVER_ACCEPT } from "@/lib/uploads";
import type { Beat, BeatLicence, Licence } from "@prisma/client";

type BeatWithLicences = Beat & { licences: BeatLicence[] };

export function AdminBeatForm({
  beat,
  licences,
}: {
  beat?: BeatWithLicences | null;
  licences: Licence[];
}) {
  const priceFor = (slug: string) => {
    if (!beat) return "";
    const licence = licences.find((item) => item.slug === slug);
    if (!licence) return "";
    const row = beat.licences.find((item) => item.licenceId === licence.id);
    return row ? (row.pricePence / 100).toFixed(2) : "";
  };

  return (
    <form action={saveBeat} className="space-y-6 rounded-3xl border border-line bg-card p-6">
      {beat ? <input type="hidden" name="id" value={beat.id} /> : null}
      <label className="block text-sm">
        Title
        <input
          name="title"
          required
          defaultValue={beat?.title}
          className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>
      <label className="block text-sm">
        Slug
        <input
          name="slug"
          defaultValue={beat?.slug}
          placeholder="auto from title if empty"
          className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/40"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          Genre
          <input
            name="genre"
            defaultValue={beat?.genre}
            className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          BPM
          <input
            name="bpm"
            type="number"
            defaultValue={beat?.bpm ?? 140}
            className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5"
          />
        </label>
        <label className="block text-sm">
          Key
          <input
            name="musicalKey"
            defaultValue={beat?.musicalKey}
            className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5"
          />
        </label>
      </div>
      <label className="block text-sm">
        Description
        <textarea
          name="description"
          rows={4}
          defaultValue={beat?.description}
          className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5"
        />
      </label>
      <label className="block text-sm">
        Tags (comma separated)
        <input
          name="tags"
          defaultValue={beat ? (JSON.parse(beat.tags) as string[]).join(", ") : ""}
          className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5"
        />
      </label>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="published" defaultChecked={beat?.published ?? true} />
          Published
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="featured" defaultChecked={beat?.featured ?? false} />
          Featured on home
        </label>
      </div>
      <label className="block text-sm">
        Cover image
        <input type="file" name="cover" accept={COVER_ACCEPT} className="mt-2 block w-full text-muted" />
      </label>
      <label className="block text-sm">
        Tagged preview (MP3 or WAV, public)
        <input type="file" name="preview" accept={AUDIO_ACCEPT} className="mt-2 block w-full text-muted" />
      </label>
      <div className="space-y-4">
        <h2 className="font-display text-xl">Licence prices and masters</h2>
        {licences.map((licence) => (
          <div key={licence.id} className="rounded-2xl border border-line p-4">
            <p className="font-medium">{licence.name}</p>
            <label className="mt-3 block text-sm">
              Price (GBP)
              <input
                name={`price-${licence.slug}`}
                type="number"
                step="0.01"
                min="0"
                defaultValue={priceFor(licence.slug)}
                className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5"
              />
            </label>
            <label className="mt-3 block text-sm">
              Paid master file (gated)
              <input
                type="file"
                name={`master-${licence.slug}`}
                accept={AUDIO_ACCEPT}
                className="mt-2 block w-full text-muted"
              />
            </label>
          </div>
        ))}
      </div>
      <button type="submit" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink">
        Save beat
      </button>
    </form>
  );
}
