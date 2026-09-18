import { notFound } from "next/navigation";
import { ClearCartOnMount } from "@/components/clear-cart";
import { CoverImage } from "@/components/cover-image";
import { fileUrlFor } from "@/lib/downloads";
import { formatGBP } from "@/lib/money";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Downloads" };

export default async function DownloadsPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ demo?: string }>;
}) {
  const { token } = await params;
  const { demo } = await searchParams;
  const order = await prisma.order.findUnique({
    where: { downloadToken: token },
    include: { items: { include: { beat: true } } },
  });
  if (!order || order.status !== "paid") notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <ClearCartOnMount />
      <p className="text-xs uppercase tracking-[0.22em] text-accent">Download centre</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Your masters</h1>
      <p className="mt-3 text-sm text-muted">
        Sent to {order.email}. Each file link is signed and expires after 15 minutes. Refresh this page for a new link.
        {demo ? " This was a local demo checkout — no Stripe charge was taken." : ""}
      </p>
      <ul className="mt-8 space-y-4">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
            <CoverImage src={item.beat.coverPath} alt="" className="h-16 w-16 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted">
                {item.licenceName} · {formatGBP(item.pricePence)}
              </p>
            </div>
            <a
              href={fileUrlFor(item.id)}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
            >
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
