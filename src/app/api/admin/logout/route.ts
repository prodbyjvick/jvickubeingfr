import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, requestSameOrigin } from "@/lib/admin";

export async function POST(request: NextRequest) {
  if (!requestSameOrigin(request)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  response.cookies.set(ADMIN_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 });
  return response;
}
