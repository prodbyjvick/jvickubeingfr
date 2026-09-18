"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type PlayableBeat = {
  id: string;
  slug?: string;
  title: string;
  coverPath: string;
  previewPath: string;
  waveform: number[];
};

type PlayerContextValue = {
  current: PlayableBeat | null;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  play: (beat: PlayableBeat) => void;
  toggle: (beat?: PlayableBeat) => void;
  seek: (ratio: number) => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<PlayableBeat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadedmetadata", onTime);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadedmetadata", onTime);
    };
  }, []);

  const play = useCallback((beat: PlayableBeat) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (current?.id !== beat.id) {
      audio.src = beat.previewPath;
      setCurrent(beat);
      setProgress(0);
    }
    void audio.play();
  }, [current?.id]);

  const toggle = useCallback(
    (beat?: PlayableBeat) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (beat && current?.id !== beat.id) {
        play(beat);
        return;
      }
      if (isPlaying) audio.pause();
      else if (current) void audio.play();
      else if (beat) play(beat);
    },
    [current, isPlaying, play],
  );

  const seek = useCallback((ratio: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    audio.currentTime = Math.min(1, Math.max(0, ratio)) * audio.duration;
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = "";
    setCurrent(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const value = useMemo(
    () => ({
      current,
      isPlaying,
      progress,
      currentTime,
      duration,
      play,
      toggle,
      seek,
      stop,
    }),
    [current, isPlaying, progress, currentTime, duration, play, toggle, seek, stop],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}
