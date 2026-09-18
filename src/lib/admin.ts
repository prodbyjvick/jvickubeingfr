import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

export const ADMIN_COOKIE = "jvick_admin";
export const MIN_ADMIN_PASSWORD_LENGTH = 12;
const MAX_AGE_SECONDS = 60 * 60 * 12;

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function isProduction() {
  return process.env.NODE_ENV === "production";
}

export function isStrongAdminPassword(password: string) {
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) return false;
  const lower = password.toLowerCase();
  if (lower.includes("change-me") || lower.includes("replace") || lower === "passwordpassword") {
    if (isProduction()) return false;
  }
  return true;
}

export function adminSecretsConfigured() {
  const password = process.env.ADMIN_PASSWORD || "";
  const session = secret();
  if (session.length < 24) return false;
  if (isProduction() && (session.includes("replace") || session.includes("dev-only"))) return false;
  return isStrongAdminPassword(password);
}

export function signAdminToken() {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const payload = String(exp);
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function verifyAdminToken(token: string | undefined | null) {
  if (!token || !secret()) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function passwordMatches(input: string) {
  if (!adminSecretsConfigured()) return false;
  const expected = process.env.ADMIN_PASSWORD || "";
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function isAdmin() {
  const jar = await cookies();
  return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export function adminCookieOptions() {
  const https = (process.env.APP_URL || "").startsWith("https://");
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: isProduction() || https,
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

export async function assertSameOrigin() {
  const h = await headers();
  const origin = h.get("origin");
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!origin || !host) {
    if (isProduction()) throw new Error("Invalid request origin.");
    return;
  }
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error("Invalid request origin.");
  }
  if (originHost !== host) throw new Error("Invalid request origin.");
}

export function requestSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!origin || !host) return !isProduction();
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
