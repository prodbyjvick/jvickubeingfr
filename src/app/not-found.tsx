import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="font-display text-4xl font-semibold">Not found</h1>
      <p className="mt-3 text-sm text-muted">That page is not on the store.</p>
      <Link href="/catalog" className="mt-6 inline-block text-accent hover:underline">
        Back to catalog
      </Link>
    </div>
  );
}
