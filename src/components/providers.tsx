"use client";

import { CartProvider } from "@/components/cart-provider";
import { PlayerProvider } from "@/components/player-provider";
import { MiniPlayer } from "@/components/mini-player";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <PlayerProvider>
        {children}
        <MiniPlayer />
      </PlayerProvider>
    </CartProvider>
  );
}
