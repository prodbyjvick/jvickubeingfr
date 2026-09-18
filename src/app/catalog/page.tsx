import { CatalogBrowser } from "@/components/catalog-browser";
import { listPublishedBeats } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Catalog",
};

export default async function CatalogPage() {
  const beats = await listPublishedBeats();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.22em] text-accent">All beats</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Catalog</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Filter by genre, search by title or key, and preview tagged MP3s. Untagged masters unlock after payment.
      </p>
      <div className="mt-8">
        <CatalogBrowser beats={beats} />
      </div>
    </div>
  );
}
