import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  adminSecretsConfigured,
  passwordMatches,
  requestSameOrigin,
  signAdminToken,
} from "@/lib/admin";
import { clientKey, rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!requestSameOrigin(request)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }

  const limited = rateLimit(clientKey(request, "admin-login"), 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.redirect(new URL("/admin/login?error=locked", request.url));
  }

  if (!adminSecretsConfigured()) {
    return NextResponse.redirect(new URL("/admin/login?error=config", request.url));
  }

  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (!passwordMatches(password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(ADMIN_COOKIE, signAdminToken(), adminCookieOptions());
  return response;
}
