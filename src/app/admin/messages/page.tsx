import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  await requireAdmin();
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold">Messages</h1>
      {messages.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No messages yet.</p>
      ) : (
        <ul className="mt-8 space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="rounded-2xl border border-line bg-card p-4">
              <p className="font-medium">{message.name}</p>
              <p className="text-sm text-accent">{message.email}</p>
              <p className="mt-2 text-sm text-muted">{message.message}</p>
              <p className="mt-2 text-xs text-muted">{message.createdAt.toUTCString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
