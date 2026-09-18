"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { CoverImage } from "@/components/cover-image";
import { usePlayer } from "@/components/player-provider";
import { PlayButton } from "@/components/play-button";
import { Waveform } from "@/components/waveform";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MiniPlayer() {
  const player = usePlayer();
  if (!player.current) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-card/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <CoverImage
          src={player.current.coverPath}
          alt=""
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <Link href={player.current.slug ? `/beats/${player.current.slug}` : "/catalog"} className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink hover:text-glow">{player.current.title}</p>
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Tagged preview</p>
          </Link>
        </div>
        <PlayButton
          playing={player.isPlaying}
          onClick={() => player.toggle()}
          size="sm"
          label={player.isPlaying ? "Pause" : "Play"}
        />
        <div className="hidden min-w-0 flex-[2] items-center gap-3 sm:flex">
          <span className="w-8 text-[11px] text-muted">{formatTime(player.currentTime)}</span>
          <Waveform peaks={player.current.waveform} progress={player.progress} onSeek={player.seek} className="h-7" />
          <span className="w-8 text-[11px] text-muted">{formatTime(player.duration)}</span>
        </div>
        <button
          type="button"
          onClick={player.stop}
          className="rounded-full p-2 text-muted hover:text-ink"
          aria-label="Close player"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
