import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function secret() {
  return process.env.DOWNLOAD_SECRET || "dev-download-secret";
}

export function newDownloadToken() {
  return randomBytes(24).toString("hex");
}

export function signFileUrl(orderItemId: string, expiresAt: number) {
  const payload = `${orderItemId}.${expiresAt}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyFileUrl(token: string) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [orderItemId, expRaw, sig] = parts;
  const expiresAt = Number(expRaw);
  if (!orderItemId || !sig || !Number.isFinite(expiresAt)) return null;
  if (expiresAt < Math.floor(Date.now() / 1000)) return null;
  const payload = `${orderItemId}.${expiresAt}`;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return { orderItemId, expiresAt };
}

export function fileUrlFor(orderItemId: string, ttlSeconds = 15 * 60) {
  const expiresAt = Math.floor(Date.now() / 1000) + ttlSeconds;
  const token = signFileUrl(orderItemId, expiresAt);
  return `/api/download?token=${encodeURIComponent(token)}`;
}
