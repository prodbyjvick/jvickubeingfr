/**
 * Generates placeholder cover art, tagged preview MP3s, paid masters, and waveform data.
 * Safe to re-run; existing files are overwritten.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const COVERS = path.join(ROOT, "public/media/covers");
const PREVIEWS = path.join(ROOT, "public/media/previews");
const MASTERS = path.join(ROOT, "uploads/masters");
const WAVEFORMS = path.join(ROOT, "public/media/waveforms");

const SAMPLE_RATE = 44100;
const DURATION = 12;

const KEY_HZ = {
  "F#m": 185.0,
  Dm: 146.83,
  Cm: 130.81,
  Gm: 196.0,
  Ebm: 155.56,
  Bbm: 116.54,
  Am: 220.0,
};

export const BEATS = [
  {
    slug: "midnight-run",
    title: "Midnight Run",
    genre: "Dark Trap",
    bpm: 140,
    key: "F#m",
    hue: 80,
    motif: "moon",
  },
  {
    slug: "quiet-luxury",
    title: "Quiet Luxury",
    genre: "R&B",
    bpm: 92,
    key: "Dm",
    hue: 42,
    motif: "lines",
  },
  {
    slug: "chrome-hearts",
    title: "Chrome Hearts",
    genre: "UK Drill",
    bpm: 144,
    key: "Cm",
    hue: 190,
    motif: "shards",
  },
  {
    slug: "late-checkout",
    title: "Late Checkout",
    genre: "Afrobeats",
    bpm: 108,
    key: "Gm",
    hue: 28,
    motif: "sun",
  },
  {
    slug: "velvet-hour",
    title: "Velvet Hour",
    genre: "Dark R&B",
    bpm: 86,
    key: "Ebm",
    hue: 312,
    motif: "orbs",
  },
  {
    slug: "no-witnesses",
    title: "No Witnesses",
    genre: "UK Drill",
    bpm: 142,
    key: "Bbm",
    hue: 0,
    motif: "grid",
  },
  {
    slug: "soft-launch",
    title: "Soft Launch",
    genre: "Pop / R&B",
    bpm: 100,
    key: "Am",
    hue: 95,
    motif: "blobs",
  },
  {
    slug: "after-hours",
    title: "After Hours",
    genre: "Trap Soul",
    bpm: 130,
    key: "F#m",
    hue: 210,
    motif: "windows",
  },
];

function ensureDirs() {
  for (const dir of [COVERS, PREVIEWS, MASTERS, WAVEFORMS]) {
    mkdirSync(dir, { recursive: true });
  }
}

function coverSvg(beat) {
  const accent = "#b8ff3c";
  const motifs = {
    moon: `
      <circle cx="400" cy="340" r="160" fill="none" stroke="${accent}" stroke-width="3" opacity="0.9"/>
      <circle cx="400" cy="340" r="110" fill="none" stroke="${accent}" stroke-width="1.5" opacity="0.4"/>
      <circle cx="460" cy="300" r="90" fill="#0a0a0b"/>
      <path d="M120 620 C 260 480, 540 480, 680 620" fill="none" stroke="${accent}" stroke-width="2" opacity="0.5"/>
    `,
    lines: `
      ${Array.from({ length: 14 }, (_, i) => {
        const x = 80 + i * 48;
        return `<rect x="${x}" y="${120 + (i % 3) * 30}" width="10" height="${420 - i * 12}" fill="${accent}" opacity="${0.18 + (i % 4) * 0.12}"/>`;
      }).join("")}
    `,
    shards: `
      <polygon points="400,90 690,640 110,640" fill="none" stroke="${accent}" stroke-width="2"/>
      <polygon points="400,180 600,580 200,580" fill="${accent}" opacity="0.12"/>
      <polygon points="400,70 430,140 370,140" fill="${accent}"/>
    `,
    sun: `
      <circle cx="400" cy="360" r="120" fill="${accent}" opacity="0.85"/>
      <circle cx="400" cy="360" r="180" fill="none" stroke="${accent}" stroke-width="2" opacity="0.4"/>
      ${Array.from({ length: 12 }, (_, i) => {
        const a = (Math.PI * 2 * i) / 12;
        const x1 = 400 + Math.cos(a) * 200;
        const y1 = 360 + Math.sin(a) * 200;
        const x2 = 400 + Math.cos(a) * 280;
        const y2 = 360 + Math.sin(a) * 280;
        return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${accent}" stroke-width="3" opacity="0.55"/>`;
      }).join("")}
    `,
    orbs: `
      <circle cx="280" cy="300" r="140" fill="${accent}" opacity="0.18"/>
      <circle cx="500" cy="380" r="180" fill="${accent}" opacity="0.12"/>
      <circle cx="420" cy="240" r="70" fill="${accent}" opacity="0.7"/>
    `,
    grid: `
      ${Array.from({ length: 8 }, (_, i) => `<line x1="80" y1="${140 + i * 70}" x2="720" y2="${140 + i * 70}" stroke="${accent}" stroke-width="1" opacity="0.25"/>`).join("")}
      ${Array.from({ length: 8 }, (_, i) => `<line x1="${120 + i * 80}" y1="100" x2="${120 + i * 80}" y2="680" stroke="${accent}" stroke-width="1" opacity="0.25"/>`).join("")}
      <rect x="300" y="280" width="200" height="200" fill="none" stroke="${accent}" stroke-width="3"/>
    `,
    blobs: `
      <ellipse cx="340" cy="340" rx="180" ry="220" fill="${accent}" opacity="0.2"/>
      <ellipse cx="480" cy="380" rx="160" ry="140" fill="${accent}" opacity="0.28"/>
      <circle cx="400" cy="320" r="40" fill="${accent}"/>
    `,
    windows: `
      ${Array.from({ length: 6 }, (_, col) =>
        Array.from({ length: 8 }, (_, row) => {
          const on = (col + row) % 3 !== 0;
          return `<rect x="${160 + col * 80}" y="${120 + row * 62}" width="36" height="44" fill="${accent}" opacity="${on ? 0.7 : 0.12}"/>`;
        }).join(""),
      ).join("")}
    `,
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0b"/>
      <stop offset="100%" stop-color="#16181a"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#bg)"/>
  <rect x="24" y="24" width="752" height="752" fill="none" stroke="${accent}" stroke-width="1" opacity="0.25"/>
  ${motifs[beat.motif]}
  <text x="48" y="84" fill="${accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" letter-spacing="6" opacity="0.8">JVICK BEATS</text>
  <text x="48" y="730" fill="#f5f5f4" font-family="ui-sans-serif, system-ui, sans-serif" font-size="42" font-weight="700">${beat.title}</text>
  <text x="48" y="762" fill="${accent}" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16" letter-spacing="3">${beat.genre}  ·  ${beat.bpm} BPM  ·  ${beat.key}</text>
</svg>`;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function synthBeat(beat) {
  const n = SAMPLE_RATE * DURATION;
  const samples = new Float32Array(n);
  const root = KEY_HZ[beat.key] ?? 146.83;
  const beatSec = 60 / beat.bpm;
  const steps = [0, 3, 5, 7, 10, 7, 5, 3];

  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const beatPos = t / beatSec;
    const inBeat = t % beatSec;
    const step = steps[Math.floor(beatPos) % steps.length];
    const note = root * Math.pow(2, step / 12);

    const kickEnv = Math.exp(-inBeat * 14);
    const kickFreq = lerp(90, 42, Math.min(1, inBeat * 8));
    const kick = Math.sin(2 * Math.PI * kickFreq * inBeat) * kickEnv * 0.72;

    const hatTime = (t + beatSec / 2) % (beatSec / 2);
    const hat =
      (Math.random() * 2 - 1) * Math.exp(-hatTime * 55) * 0.09;

    const bassEnv = 0.55 + 0.45 * Math.sin(2 * Math.PI * t / (beatSec * 4));
    const bass = Math.sin(2 * Math.PI * (note / 2) * t) * 0.22 * bassEnv;
    const lead = Math.sin(2 * Math.PI * note * t) * 0.07 * Math.sin(Math.PI * (inBeat / beatSec));
    const pad = Math.sin(2 * Math.PI * (note * 1.5) * t) * 0.03;

    const air = Math.sin(2 * Math.PI * 0.25 * t) * 0.02;
    samples[i] = kick + hat + bass + lead + pad + air;
  }

  // Soft limiter
  let peak = 0.001;
  for (const s of samples) peak = Math.max(peak, Math.abs(s));
  const gain = 0.92 / peak;
  const pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) {
    const v = Math.max(-1, Math.min(1, samples[i] * gain));
    pcm.writeInt16LE(Math.round(v * 32767), i * 2);
  }
  return pcm;
}

function tagPreview(pcm) {
  const copy = Buffer.from(pcm);
  const beepFreq = 880;
  const beepLen = Math.floor(SAMPLE_RATE * 0.12);
  for (let t0 = SAMPLE_RATE * 3; t0 < copy.length / 2; t0 += SAMPLE_RATE * 4) {
    for (let i = 0; i < beepLen; i++) {
      const idx = t0 + i;
      if (idx * 2 + 1 >= copy.length) break;
      const env = Math.sin(Math.PI * (i / beepLen));
      const beep = Math.sin((2 * Math.PI * beepFreq * i) / SAMPLE_RATE) * env * 0.35;
      const existing = copy.readInt16LE(idx * 2) / 32767;
      const mixed = Math.max(-1, Math.min(1, existing * 0.7 + beep));
      copy.writeInt16LE(Math.round(mixed * 32767), idx * 2);
    }
  }
  return copy;
}

function writeWav(filePath, pcm) {
  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(dataSize, 40);
  writeFileSync(filePath, Buffer.concat([header, pcm]));
}

function waveformFromPcm(pcm, bars = 96) {
  const total = pcm.length / 2;
  const bucket = Math.floor(total / bars);
  const values = [];
  for (let b = 0; b < bars; b++) {
    let sum = 0;
    const start = b * bucket;
    for (let i = 0; i < bucket; i++) {
      const s = pcm.readInt16LE((start + i) * 2) / 32767;
      sum += s * s;
    }
    values.push(Math.sqrt(sum / bucket));
  }
  const max = Math.max(...values, 0.001);
  return values.map((v) => Math.max(0.06, v / max));
}

function encodeMp3(wavPath, mp3Path) {
  execFileSync("ffmpeg", ["-y", "-i", wavPath, "-codec:a", "libmp3lame", "-qscale:a", "5", mp3Path], {
    stdio: "ignore",
  });
}

export function generateMedia() {
  ensureDirs();
  const ffmpegOk = (() => {
    try {
      execFileSync("ffmpeg", ["-version"], { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  })();

  for (const beat of BEATS) {
    writeFileSync(path.join(COVERS, `${beat.slug}.svg`), coverSvg(beat));
    const pcm = synthBeat(beat);
    const tagged = tagPreview(pcm);
    const masterWav = path.join(MASTERS, `${beat.slug}.wav`);
    const previewWav = path.join(PREVIEWS, `${beat.slug}.wav`);
    writeWav(masterWav, pcm);
    writeWav(previewWav, tagged);
    writeFileSync(
      path.join(WAVEFORMS, `${beat.slug}.json`),
      JSON.stringify(waveformFromPcm(tagged)),
    );

    const previewMp3 = path.join(PREVIEWS, `${beat.slug}.mp3`);
    const masterMp3 = path.join(MASTERS, `${beat.slug}.mp3`);
    if (ffmpegOk) {
      encodeMp3(previewWav, previewMp3);
      encodeMp3(masterWav, masterMp3);
    } else if (!existsSync(previewMp3)) {
      writeFileSync(previewMp3, tagged);
    }
  }
}

const invoked = process.argv[1] && path.basename(process.argv[1]).includes("generate-media");
if (invoked) {
  generateMedia();
  console.log("Generated covers, previews, masters and waveforms.");
}
