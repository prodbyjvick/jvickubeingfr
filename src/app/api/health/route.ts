import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const count = await prisma.beat.count();
  return NextResponse.json({ ok: true, beats: count });
}
