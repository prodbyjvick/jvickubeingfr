import Link from "next/link";
import { deleteBeat } from "@/app/admin/actions";
import { formatGBP } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin" };

export default async function AdminHomePage() {
  await requireAdmin();
  const beats = await prisma.beat.findMany({
    include: { licences: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Beats</h1>
        <Link href="/admin/beats/new" className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink">
          Add beat
        </Link>
      </div>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-card text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">From</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {beats.map((beat) => (
              <tr key={beat.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{beat.title}</p>
                  <p className="text-xs text-muted">
                    {beat.genre} · {beat.bpm} BPM · {beat.musicalKey}
                  </p>
                </td>
                <td className="px-4 py-3 text-muted">
                  {beat.published ? "Live" : "Draft"}
                  {beat.featured ? " · Featured" : ""}
                  {beat.exclusiveSold ? " · Exclusive sold" : ""}
                </td>
                <td className="px-4 py-3">
                  {beat.licences.length
                    ? formatGBP(Math.min(...beat.licences.map((row) => row.pricePence)))
                    : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/beats/${beat.id}`} className="text-accent hover:underline">
                    Edit
                  </Link>
                  <form action={deleteBeat} className="ml-4 inline">
                    <input type="hidden" name="id" value={beat.id} />
                    <button type="submit" className="text-muted hover:text-red-400">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
