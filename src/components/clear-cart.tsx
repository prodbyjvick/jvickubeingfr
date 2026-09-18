"use client";

import { useCart } from "@/components/cart-provider";
import { useEffect } from "react";

export function ClearCartOnMount() {
  const cart = useCart();
  useEffect(() => {
    cart.clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
