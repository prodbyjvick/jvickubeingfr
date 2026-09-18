"use server";

import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { uploadRoot } from "@/lib/storage";
import { dummyWaveform, waveformFromWavFile } from "@/lib/waveform";

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function writePublicFile(file: File | null, folder: string, filename: string) {
  if (!file || file.size === 0) return null;
  const dir = path.join(process.cwd(), "public", folder);
  mkdirSync(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  writeFileSync(path.join(dir, filename), bytes);
  return `/${folder}/${filename}`;
}

async function writeMaster(file: File | null, filename: string) {
  if (!file || file.size === 0) return null;
  const dir = path.join(uploadRoot(), "masters");
  mkdirSync(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  writeFileSync(path.join(dir, filename), bytes);
  return `masters/${filename}`;
}

export async function saveBeat(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorised");

  const id = String(formData.get("id") || "");
  const title = String(formData.get("title") || "").trim();
  if (!title) throw new Error("Title is required.");
  const slug = slugify(String(formData.get("slug") || title));
  const genre = String(formData.get("genre") || "Other").trim();
  const bpm = Number(formData.get("bpm") || 120);
  const musicalKey = String(formData.get("musicalKey") || "").trim() || "Am";
  const description = String(formData.get("description") || "").trim();
  const tags = String(formData.get("tags") || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";

  const existing = id
    ? await prisma.beat.findUnique({ where: { id }, include: { licences: true } })
    : null;

  const cover = await writePublicFile(
    formData.get("cover") as File | null,
    "media/covers",
    `${slug}${extOf(formData.get("cover") as File | null, ".svg")}`,
  );
  const preview = await writePublicFile(
    formData.get("preview") as File | null,
    "media/previews",
    `${slug}${extOf(formData.get("preview") as File | null, ".mp3")}`,
  );

  let waveform = existing?.waveform || JSON.stringify(dummyWaveform(slug.length));
  const previewFile = formData.get("preview") as File | null;
  if (preview && previewFile && preview.toLowerCase().endsWith(".wav")) {
    waveform = JSON.stringify(waveformFromWavFile(path.join(process.cwd(), "public", preview)));
  }

  const beat = existing
    ? await prisma.beat.update({
        where: { id: existing.id },
        data: {
          title,
          slug,
          genre,
          bpm,
          musicalKey,
          description,
          tags: JSON.stringify(tags.length ? tags : [genre, `${bpm} BPM`, musicalKey]),
          featured,
          published,
          coverPath: cover || existing.coverPath,
          previewPath: preview || existing.previewPath,
          waveform,
        },
      })
    : await prisma.beat.create({
        data: {
          title,
          slug,
          genre,
          bpm,
          musicalKey,
          description,
          tags: JSON.stringify(tags.length ? tags : [genre, `${bpm} BPM`, musicalKey]),
          featured,
          published,
          coverPath: cover || "/media/covers/midnight-run.svg",
          previewPath: preview || "/media/previews/midnight-run.mp3",
          waveform,
        },
      });

  const licences = await prisma.licence.findMany();
  for (const licence of licences) {
    const priceRaw = String(formData.get(`price-${licence.slug}`) || "").trim();
    const pounds = Number(priceRaw);
    const pricePence = Number.isFinite(pounds) ? Math.round(pounds * 100) : 0;
    const master = await writeMaster(
      formData.get(`master-${licence.slug}`) as File | null,
      `${slug}-${licence.slug}${extOf(formData.get(`master-${licence.slug}`) as File | null, licence.slug === "basic-mp3" ? ".mp3" : ".wav")}`,
    );
    const current = await prisma.beatLicence.findUnique({
      where: { beatId_licenceId: { beatId: beat.id, licenceId: licence.id } },
    });
    await prisma.beatLicence.upsert({
      where: { beatId_licenceId: { beatId: beat.id, licenceId: licence.id } },
      update: {
        pricePence: pricePence || current?.pricePence || 0,
        masterPath: master || current?.masterPath || `masters/${slug}.wav`,
      },
      create: {
        beatId: beat.id,
        licenceId: licence.id,
        pricePence,
        masterPath: master || `masters/${slug}.wav`,
      },
    });
  }

  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteBeat(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorised");
  const id = String(formData.get("id") || "");
  await prisma.beat.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/catalog");
  revalidatePath("/admin");
  redirect("/admin");
}

function extOf(file: File | null, fallback: string) {
  if (!file || !file.name) return fallback;
  const ext = path.extname(file.name).toLowerCase();
  return ext || fallback;
}
