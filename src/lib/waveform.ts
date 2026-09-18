import { readFileSync } from "node:fs";

export function dummyWaveform(seed = 1, bars = 96) {
  const values = [];
  let x = seed;
  for (let i = 0; i < bars; i++) {
    x = (x * 16807) % 2147483647;
    const n = (x / 2147483647) * 0.7 + 0.15;
    values.push(n);
  }
  return values;
}

export function waveformFromWavFile(filePath: string, bars = 96) {
  const buf = readFileSync(filePath);
  if (buf.toString("ascii", 0, 4) !== "RIFF") return dummyWaveform(filePath.length);
  const dataIndex = buf.indexOf(Buffer.from("data"));
  if (dataIndex < 0) return dummyWaveform(filePath.length);
  const dataSize = buf.readUInt32LE(dataIndex + 4);
  const pcm = buf.subarray(dataIndex + 8, dataIndex + 8 + dataSize);
  const samples = Math.floor(pcm.length / 2);
  const bucket = Math.max(1, Math.floor(samples / bars));
  const values: number[] = [];
  for (let b = 0; b < bars; b++) {
    let sum = 0;
    const start = b * bucket;
    for (let i = 0; i < bucket; i++) {
      const offset = (start + i) * 2;
      if (offset + 1 >= pcm.length) break;
      const s = pcm.readInt16LE(offset) / 32767;
      sum += s * s;
    }
    values.push(Math.sqrt(sum / bucket));
  }
  const max = Math.max(...values, 0.001);
  return values.map((v) => Math.max(0.06, v / max));
}
