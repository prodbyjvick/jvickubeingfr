import path from "node:path";

const BLOCKED_EXTENSIONS = new Set([
  ".exe",
  ".js",
  ".mjs",
  ".cjs",
  ".html",
  ".htm",
  ".php",
  ".svgz",
  ".sh",
  ".bat",
  ".cmd",
  ".com",
  ".msi",
  ".dll",
  ".wasm",
]);

const AUDIO_OR_ZIP = {
  extensions: new Set([".mp3", ".wav", ".flac", ".aiff", ".aif", ".m4a", ".zip"]),
  mime: new Set([
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/wave",
    "audio/flac",
    "audio/x-flac",
    "audio/aiff",
    "audio/x-aiff",
    "audio/mp4",
    "audio/x-m4a",
    "application/zip",
    "application/x-zip-compressed",
    "application/octet-stream",
  ]),
};

const COVER_IMAGE = {
  extensions: new Set([".png", ".jpg", ".jpeg", ".webp", ".svg"]),
  mime: new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/octet-stream"]),
};

function looksDangerous(file: File) {
  const name = file.name.toLowerCase();
  const ext = path.extname(name);
  if (BLOCKED_EXTENSIONS.has(ext)) return true;
  if (name.includes(".exe.") || name.includes(".js.") || name.includes(".html.")) return true;
  const mime = (file.type || "").toLowerCase();
  if (mime.includes("javascript") || mime.includes("html") || mime.includes("php")) return true;
  return false;
}

function allowed(file: File, spec: { extensions: Set<string>; mime: Set<string> }) {
  if (!file || file.size === 0) return false;
  if (looksDangerous(file)) return false;
  const ext = path.extname(file.name.toLowerCase());
  if (!spec.extensions.has(ext)) return false;
  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (mime && !spec.mime.has(mime)) return false;
  return true;
}

export function assertCoverUpload(file: File | null) {
  if (!file || file.size === 0) return;
  if (!allowed(file, COVER_IMAGE)) {
    throw new Error("Cover must be PNG, JPEG, WebP or SVG — not HTML, JS or executables.");
  }
}

export function assertAudioOrZipUpload(file: File | null, label: string) {
  if (!file || file.size === 0) return;
  if (!allowed(file, AUDIO_OR_ZIP)) {
    throw new Error(`${label} must be audio (MP3, WAV, FLAC, AIFF, M4A) or ZIP — not HTML, JS or executables.`);
  }
}

export const DOWNLOAD_EXTENSIONS = AUDIO_OR_ZIP.extensions;

export function contentTypeForExt(ext: string) {
  switch (ext.replace(".", "").toLowerCase()) {
    case "mp3":
      return "audio/mpeg";
    case "wav":
      return "audio/wav";
    case "flac":
      return "audio/flac";
    case "aiff":
    case "aif":
      return "audio/aiff";
    case "m4a":
      return "audio/mp4";
    case "zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

export const AUDIO_ACCEPT = ".mp3,.wav,.flac,.aiff,.aif,.m4a,.zip,audio/mpeg,audio/wav,application/zip";
export const COVER_ACCEPT = ".png,.jpg,.jpeg,.webp,.svg,image/png,image/jpeg,image/webp,image/svg+xml";
