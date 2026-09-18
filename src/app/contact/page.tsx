import { brand } from "@/lib/brand";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = { title: "Contact" };

async function sendMessage(formData: FormData) {
  "use server";
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();
  if (!name || !email || !message) {
    redirect("/contact?error=1");
  }
  await prisma.contactMessage.create({ data: { name, email, message } });
  redirect("/contact?sent=1");
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-accent">{brand.producer}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Contact</h1>
        <p className="mt-4 text-sm leading-7 text-muted">
          Custom exclusive quotes, stems, or a beat that is not on the site yet — write directly. Messages land in the
          admin inbox.
        </p>
        <dl className="mt-8 space-y-3 text-sm">
          <div>
            <dt className="text-muted">Email</dt>
            <dd>
              <a className="text-accent hover:underline" href={`mailto:${brand.email}`}>
                {brand.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Instagram</dt>
            <dd>
              <a className="text-accent hover:underline" href={brand.instagram}>
                {brand.instagramHandle}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-muted">Based</dt>
            <dd>{brand.location}</dd>
          </div>
        </dl>
      </div>
      <form action={sendMessage} className="rounded-3xl border border-line bg-card p-6">
        {params.sent && <p className="mb-4 text-sm text-accent">Message received. I will reply by email.</p>}
        {params.error && <p className="mb-4 text-sm text-red-400">Please fill in every field.</p>}
        <label className="block text-sm">
          Name
          <input
            name="name"
            required
            className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        <label className="mt-4 block text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        <label className="mt-4 block text-sm">
          Message
          <textarea
            name="message"
            required
            rows={6}
            className="mt-2 w-full rounded-xl border border-line bg-bg px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        <button
          type="submit"
          className="mt-5 w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-ink"
        >
          Send
        </button>
      </form>
    </div>
  );
}
