"use client";

import { useMemo, useState } from "react";
import { BeatCard } from "@/components/beat-card";
import type { BeatView } from "@/lib/data";

export function CatalogBrowser({ beats }: { beats: BeatView[] }) {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("newest");

  const genres = useMemo(
    () => ["all", ...Array.from(new Set(beats.map((beat) => beat.genre)))],
    [beats],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = beats.filter((beat) => {
      const matchesQuery =
        !q ||
        beat.title.toLowerCase().includes(q) ||
        beat.genre.toLowerCase().includes(q) ||
        beat.musicalKey.toLowerCase().includes(q) ||
        String(beat.bpm).includes(q);
      const matchesGenre = genre === "all" || beat.genre === genre;
      return matchesQuery && matchesGenre;
    });
    rows.sort((a, b) => {
      if (sort === "price") return a.fromPence - b.fromPence;
      if (sort === "bpm") return b.bpm - a.bpm;
      if (sort === "title") return a.title.localeCompare(b.title);
      return +new Date(b.createdAt) - +new Date(a.createdAt);
    });
    return rows;
  }, [beats, query, genre, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-4 sm:flex-row sm:items-center">
        <label className="flex-1">
          <span className="sr-only">Search beats</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, genre, key, BPM"
            className="w-full rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-ink outline-none ring-accent/40 placeholder:text-muted focus:ring-2"
          />
        </label>
        <select
          value={genre}
          onChange={(event) => setGenre(event.target.value)}
          className="rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-ink"
        >
          {genres.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "All genres" : item}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          className="rounded-xl border border-line bg-bg px-3 py-2.5 text-sm text-ink"
        >
          <option value="newest">Newest</option>
          <option value="price">Price</option>
          <option value="bpm">BPM</option>
          <option value="title">Title</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-muted">No beats match those filters.</p>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((beat) => (
            <BeatCard key={beat.id} beat={beat} />
          ))}
        </div>
      )}
    </div>
  );
}
