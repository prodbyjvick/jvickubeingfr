import Link from "next/link";
import { isAdmin } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  return (
    <div>
      {admin ? (
        <div className="border-b border-line bg-card">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 text-sm sm:px-6">
            <p className="font-medium text-accent">Admin</p>
            <nav className="flex items-center gap-4">
              <Link href="/admin" className="hover:text-glow">
                Beats
              </Link>
              <Link href="/admin/beats/new" className="hover:text-glow">
                New beat
              </Link>
              <Link href="/admin/messages" className="hover:text-glow">
                Messages
              </Link>
              <form action="/api/admin/logout" method="post">
                <button type="submit" className="text-muted hover:text-glow">
                  Sign out
                </button>
              </form>
            </nav>
          </div>
        </div>
      ) : null}
      {children}
    </div>
  );
}
