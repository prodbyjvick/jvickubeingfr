"use client";

import { cn } from "@/lib/cn";

export function Waveform({
  peaks,
  progress = 0,
  onSeek,
  className,
  barClassName,
}: {
  peaks: number[];
  progress?: number;
  onSeek?: (ratio: number) => void;
  className?: string;
  barClassName?: string;
}) {
  const bars = peaks.length > 0 ? peaks : Array.from({ length: 64 }, () => 0.25);

  return (
    <div
      className={cn("flex h-10 w-full items-center gap-[2px]", className)}
      role={onSeek ? "slider" : undefined}
      aria-valuemin={onSeek ? 0 : undefined}
      aria-valuemax={onSeek ? 100 : undefined}
      aria-valuenow={onSeek ? Math.round(progress * 100) : undefined}
      onClick={
        onSeek
          ? (event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              onSeek((event.clientX - rect.left) / rect.width);
            }
          : undefined
      }
    >
      {bars.map((peak, index) => {
        const ratio = (index + 0.5) / bars.length;
        const active = ratio <= progress;
        return (
          <span
            key={index}
            className={cn(
              "inline-block w-full rounded-full transition-colors",
              active ? "bg-accent" : "bg-ink/25",
              onSeek && "cursor-pointer",
              barClassName,
            )}
            style={{ height: `${Math.max(12, peak * 100)}%` }}
          />
        );
      })}
    </div>
  );
}
