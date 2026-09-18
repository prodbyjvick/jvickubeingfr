"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { brand, nav } from "@/lib/brand";
import { cn } from "@/lib/cn";

export function SiteHeader() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-display text-lg font-bold tracking-[0.14em] text-ink">
          {brand.shortName} <span className="text-brand">BEATS</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-glow">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink hover:border-glow hover:text-glow"
            aria-label={`Cart, ${count} items`}
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-bold text-accent-ink">
                {count}
              </span>
            )}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Open menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      <div className={cn("border-t border-line md:hidden", open ? "block" : "hidden")}>
        <nav className="mx-auto flex max-w-6xl flex-col px-4 py-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="py-2 text-sm text-muted hover:text-glow"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
