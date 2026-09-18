import { mkdirSync } from "node:fs";
import path from "node:path";

export function uploadRoot() {
  const dir = process.env.UPLOAD_DIR || "uploads";
  const absolute = path.isAbsolute(dir)
    ? dir
    : path.join(/* turbopackIgnore: true */ process.cwd(), dir);
  mkdirSync(absolute, { recursive: true });
  return absolute;
}

export function masterAbsolutePath(masterPath: string) {
  return path.join(uploadRoot(), masterPath);
}

export function publicAppUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
