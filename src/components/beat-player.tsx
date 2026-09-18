"use client";

import { CoverImage } from "@/components/cover-image";
import { usePlayer } from "@/components/player-provider";
import { PlayButton } from "@/components/play-button";
import { Waveform } from "@/components/waveform";
import type { BeatView } from "@/lib/data";
import { brand } from "@/lib/brand";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function BeatPlayer({ beat }: { beat: BeatView }) {
  const player = usePlayer();
  const active = player.current?.id === beat.id;
  const playing = active && player.isPlaying;

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line">
        <CoverImage src={beat.coverPath} alt={`${beat.title} cover art`} className="aspect-square w-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-[0.22em] text-accent">{brand.producer}</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">{beat.title}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          {beat.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-line px-3 py-1 text-xs uppercase tracking-[0.14em] text-muted">
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-5 max-w-xl text-sm leading-6 text-muted">{beat.description}</p>
        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
          <PlayButton
            playing={playing}
            size="lg"
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
              className="h-12"
            />
            <div className="mt-2 flex justify-between text-[11px] text-muted">
              <span>{formatTime(active ? player.currentTime : 0)}</span>
              <span>Public tagged preview · masters unlock after payment</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
