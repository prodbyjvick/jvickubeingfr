import Link from "next/link";
import { brand, nav } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line bg-bg">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold tracking-[0.14em]">
            {brand.shortName} <span className="text-brand">BEATS</span>
          </p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Self-hosted store for {brand.producer}. Buyers pay via Stripe; files unlock the moment payment clears.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Store</p>
          <ul className="mt-3 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-ink/90 hover:text-accent">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin/login" className="text-ink/90 hover:text-accent">
                Admin
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Producer</p>
          <p className="mt-3 text-sm text-ink">{brand.producer}</p>
          <p className="text-sm text-muted">{brand.location}</p>
          <a className="mt-2 block text-sm text-accent hover:underline" href={`mailto:${brand.email}`}>
            {brand.email}
          </a>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} {brand.name}. All rights reserved.
      </div>
    </footer>
  );
}
