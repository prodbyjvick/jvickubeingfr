"use client";

import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";

export function PlayButton({
  playing,
  onClick,
  size = "md",
  label,
}: {
  playing: boolean;
  onClick: () => void;
  size?: "sm" | "md" | "lg";
  label: string;
}) {
  const dim =
    size === "lg" ? "h-16 w-16" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const icon = size === "lg" ? 26 : size === "sm" ? 14 : 18;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_0_0_8px_rgba(165,0,255,0.22)] transition hover:brightness-110",
        dim,
      )}
    >
      {playing ? (
        <Pause fill="currentColor" size={icon} />
      ) : (
        <Play fill="currentColor" size={icon} className="translate-x-[1px]" />
      )}
    </button>
  );
}
