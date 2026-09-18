export const metadata = { title: "Admin login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-20">
      <h1 className="font-display text-3xl font-semibold">Admin</h1>
      <p className="mt-2 text-sm text-muted">
        Password is set with ADMIN_PASSWORD (minimum 12 characters). Never share it, and never take payments off Stripe.
      </p>
      {error === "1" && <p className="mt-4 text-sm text-red-400">That password is not right.</p>}
      {error === "locked" && (
        <p className="mt-4 text-sm text-red-400">Too many attempts. Wait 15 minutes and try again.</p>
      )}
      {error === "config" && (
        <p className="mt-4 text-sm text-red-400">
          Admin is not configured. Set a strong ADMIN_PASSWORD (12+ characters) and ADMIN_SESSION_SECRET.
        </p>
      )}
      <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
        <label className="block text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={12}
            autoComplete="current-password"
            className="mt-2 w-full rounded-xl border border-line bg-card px-3 py-2.5 outline-none focus:ring-2 focus:ring-accent/40"
          />
        </label>
        <button type="submit" className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-ink">
          Sign in
        </button>
      </form>
    </div>
  );
}
