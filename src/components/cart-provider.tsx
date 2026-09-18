"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

export type CartItem = {
  beatId: string;
  slug: string;
  title: string;
  coverPath: string;
  licenceId: string;
  licenceName: string;
  licenceSlug: string;
  pricePence: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (beatId: string, licenceId: string) => void;
  clear: () => void;
  count: number;
  totalPence: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "jvick-cart";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (typeof window !== "undefined") {
    window.addEventListener("storage", listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", listener);
    }
  };
}

function getSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(STORAGE_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

function write(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  emit();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const items = useMemo(() => {
    try {
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  }, [raw]);

  const addItem = useCallback((item: CartItem) => {
    const current = JSON.parse(getSnapshot()) as CartItem[];
    write([...current.filter((row) => row.beatId !== item.beatId), item]);
  }, []);

  const removeItem = useCallback((beatId: string, licenceId: string) => {
    const current = JSON.parse(getSnapshot()) as CartItem[];
    write(current.filter((row) => !(row.beatId === beatId && row.licenceId === licenceId)));
  }, []);

  const clear = useCallback(() => write([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      removeItem,
      clear,
      count: items.length,
      totalPence: items.reduce((sum, item) => sum + item.pricePence, 0),
    }),
    [items, addItem, removeItem, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
