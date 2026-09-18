import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, passwordMatches, signAdminToken } from "@/lib/admin";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const password = String(form.get("password") || "");
  if (!passwordMatches(password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url));
  }
  const response = NextResponse.redirect(new URL("/admin", request.url));
  response.cookies.set(ADMIN_COOKIE, signAdminToken(), adminCookieOptions());
  return response;
}
