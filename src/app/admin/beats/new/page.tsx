import { AdminBeatForm } from "@/app/admin/beat-form";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "New beat" };

export default async function NewBeatPage() {
  await requireAdmin();
  const licences = await prisma.licence.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-6 font-display text-3xl font-semibold">New beat</h1>
      <AdminBeatForm licences={licences} />
    </div>
  );
}
