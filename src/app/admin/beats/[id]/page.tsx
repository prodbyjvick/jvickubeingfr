import { notFound } from "next/navigation";
import { AdminBeatForm } from "@/app/admin/beat-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";

export default async function EditBeatPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [beat, licences] = await Promise.all([
    prisma.beat.findUnique({ where: { id }, include: { licences: true } }),
    prisma.licence.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!beat) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-3xl font-semibold">Edit {beat.title}</h1>
      <AdminBeatForm beat={beat} licences={licences} />
    </div>
  );
}
