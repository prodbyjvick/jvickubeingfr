import Link from "next/link";
import { brand } from "@/lib/brand";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Licence terms" };

export default async function LicensesPage() {
  const licences = await prisma.licence.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs uppercase tracking-[0.22em] text-accent">Legal</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Licence terms</h1>
      <p className="mt-4 text-sm leading-7 text-muted">
        Every purchase on {brand.name} is a licence to use a beat in a new recorded work, not a transfer of the
        instrumental itself — unless you buy Exclusive Rights. English law applies. If a clause is unclear, email{" "}
        {brand.email} before you release.
      </p>
      <div className="mt-10 space-y-8">
        {licences.map((licence) => (
          <article key={licence.id} className="rounded-3xl border border-line bg-card p-6">
            <h2 className="font-display text-2xl">{licence.name}</h2>
            <p className="mt-2 text-sm text-muted">{licence.summary}</p>
            <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted">
              {(JSON.parse(licence.features) as string[]).map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-ink/85">{licence.terms}</p>
          </article>
        ))}
      </div>
      <p className="mt-10 text-sm text-muted">
        Questions before you buy? <Link href="/contact" className="text-accent hover:underline">Contact</Link>.
      </p>
    </div>
  );
}
