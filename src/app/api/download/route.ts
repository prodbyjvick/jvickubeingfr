import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { verifyFileUrl } from "@/lib/downloads";
import { prisma } from "@/lib/prisma";
import { masterAbsolutePath, uploadRoot } from "@/lib/storage";
import { contentTypeForExt, DOWNLOAD_EXTENSIONS } from "@/lib/uploads";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") || "";
  const parsed = verifyFileUrl(token);
  if (!parsed) {
    return NextResponse.json(
      { error: "This download link is invalid or has expired. Open the download centre for a fresh link." },
      { status: 401 },
    );
  }

  const item = await prisma.orderItem.findUnique({
    where: { id: parsed.orderItemId },
    include: { order: true },
  });
  if (!item || item.order.status !== "paid") {
    return NextResponse.json({ error: "File is not available." }, { status: 403 });
  }

  const resolved = path.resolve(masterAbsolutePath(item.masterPath));
  const root = path.resolve(uploadRoot());
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  const ext = path.extname(resolved).toLowerCase();
  if (!DOWNLOAD_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "That file type cannot be downloaded." }, { status: 400 });
  }

  if (!existsSync(resolved)) {
    return NextResponse.json({ error: "Master file is missing from storage." }, { status: 404 });
  }

  const bytes = await readFile(resolved);
  const safeTitle = item.title.replace(/[^\w\s-]+/g, "").trim() || "beat";
  const filename = `${safeTitle}-${item.licenceName}${ext}`.replace(/["\r\n]/g, "");

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentTypeForExt(ext),
      "Content-Length": String(bytes.byteLength),
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store",
    },
  });
}
