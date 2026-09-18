"use client";

import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import { usePlayer } from "@/components/player-provider";
import { PlayButton } from "@/components/play-button";
import { Waveform } from "@/components/waveform";
import type { BeatView } from "@/lib/data";
import { brand } from "@/lib/brand";
import { formatGBP } from "@/lib/money";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function FeaturedPanel({ beat }: { beat: BeatView }) {
  const player = usePlayer();
  const active = player.current?.id === beat.id;
  const playing = active && player.isPlaying;

  return (
    <div className="rounded-3xl border border-line bg-card p-4 shadow-[0_20px_80px_rgba(0,0,0,0.35)] sm:p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-accent">Featured drop</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        <Link href={`/beats/${beat.slug}`} className="relative block w-full shrink-0 overflow-hidden rounded-2xl sm:w-44">
          <CoverImage src={beat.coverPath} alt="" className="aspect-square w-full object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/beats/${beat.slug}`}>
            <h2 className="font-display text-2xl font-semibold text-ink">{beat.title}</h2>
          </Link>
          <p className="mt-1 text-sm text-muted">{brand.producer}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted">
            {beat.genre} · {beat.bpm} BPM · {beat.musicalKey}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <PlayButton
              playing={playing}
              onClick={() => player.toggle(beat)}
              label={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
            />
            <div className="min-w-0 flex-1">
              <Waveform
                peaks={beat.waveform}
                progress={active ? player.progress : 0}
                onSeek={(ratio) => {
                  if (!active) player.play(beat);
                  player.seek(ratio);
                }}
              />
              <div className="mt-1 flex justify-between text-[11px] text-muted">
                <span>{formatTime(active ? player.currentTime : 0)}</span>
                <span>Tagged preview</span>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted">from {formatGBP(beat.fromPence)}</span>
            <Link
              href={`/beats/${beat.slug}`}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink"
            >
              Choose licence
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
