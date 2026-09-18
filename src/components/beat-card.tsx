"use client";

import Link from "next/link";
import { CoverImage } from "@/components/cover-image";
import { usePlayer } from "@/components/player-provider";
import { PlayButton } from "@/components/play-button";
import { Waveform } from "@/components/waveform";
import type { BeatView } from "@/lib/data";
import { formatGBP } from "@/lib/money";

export function BeatCard({ beat }: { beat: BeatView }) {
  const player = usePlayer();
  const playing = player.current?.id === beat.id && player.isPlaying;
  const progress = player.current?.id === beat.id ? player.progress : 0;

  return (
    <article className="group rounded-2xl border border-line bg-card p-3 transition hover:border-accent/40 hover:bg-card-hover">
      <Link href={`/beats/${beat.slug}`} className="relative block overflow-hidden rounded-xl">
        <CoverImage
          src={beat.coverPath}
          alt={`${beat.title} cover art`}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div
          className="absolute bottom-3 left-3"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            player.toggle(beat);
          }}
        >
          <PlayButton
            playing={playing}
            onClick={() => player.toggle(beat)}
            size="sm"
            label={playing ? `Pause ${beat.title}` : `Play ${beat.title}`}
          />
        </div>
      </Link>
      <div className="px-1 pt-3">
        <Link href={`/beats/${beat.slug}`} className="block">
          <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
            {beat.title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
            {beat.genre} · {beat.bpm} BPM · {beat.musicalKey}
          </p>
        </Link>
        <div className="mt-3">
          <Waveform
            peaks={beat.waveform}
            progress={progress}
            onSeek={(ratio) => {
              if (player.current?.id !== beat.id) player.play(beat);
              player.seek(ratio);
            }}
            className="h-8"
          />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-muted">
            {beat.exclusiveSold ? "Exclusive sold" : `from ${formatGBP(beat.fromPence)}`}
          </p>
          <Link
            href={`/beats/${beat.slug}`}
            className="text-sm font-medium text-accent hover:underline"
          >
            Licence
          </Link>
        </div>
      </div>
    </article>
  );
}
