import { prisma } from "@/lib/prisma";
import { lowestPrice } from "@/lib/money";

export type LicenceView = {
  id: string;
  slug: string;
  name: string;
  summary: string;
  terms: string;
  features: string[];
  fileLabel: string;
  sortOrder: number;
  pricePence: number;
  masterPath: string;
};

export type BeatView = {
  id: string;
  slug: string;
  title: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  description: string;
  coverPath: string;
  previewPath: string;
  waveform: number[];
  tags: string[];
  featured: boolean;
  exclusiveSold: boolean;
  createdAt: string;
  licences: LicenceView[];
  fromPence: number;
};

function toBeatView(beat: {
  id: string;
  slug: string;
  title: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  description: string;
  coverPath: string;
  previewPath: string;
  waveform: string;
  tags: string;
  featured: boolean;
  exclusiveSold: boolean;
  createdAt: Date;
  licences: {
    pricePence: number;
    masterPath: string;
    licence: {
      id: string;
      slug: string;
      name: string;
      summary: string;
      terms: string;
      features: string;
      fileLabel: string;
      sortOrder: number;
    };
  }[];
}): BeatView {
  const licences = beat.licences
    .map((row) => ({
      id: row.licence.id,
      slug: row.licence.slug,
      name: row.licence.name,
      summary: row.licence.summary,
      terms: row.licence.terms,
      features: JSON.parse(row.licence.features) as string[],
      fileLabel: row.licence.fileLabel,
      sortOrder: row.licence.sortOrder,
      pricePence: row.pricePence,
      masterPath: row.masterPath,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: beat.id,
    slug: beat.slug,
    title: beat.title,
    genre: beat.genre,
    bpm: beat.bpm,
    musicalKey: beat.musicalKey,
    description: beat.description,
    coverPath: beat.coverPath,
    previewPath: beat.previewPath,
    waveform: JSON.parse(beat.waveform) as number[],
    tags: JSON.parse(beat.tags) as string[],
    featured: beat.featured,
    exclusiveSold: beat.exclusiveSold,
    createdAt: beat.createdAt.toISOString(),
    licences,
    fromPence: lowestPrice(licences.map((item) => item.pricePence)),
  };
}

const includeLicences = {
  licences: { include: { licence: true } },
} as const;

export async function listPublishedBeats() {
  const beats = await prisma.beat.findMany({
    where: { published: true },
    include: includeLicences,
    orderBy: { createdAt: "desc" },
  });
  return beats.map(toBeatView);
}

export async function getFeaturedBeat() {
  const beat =
    (await prisma.beat.findFirst({
      where: { published: true, featured: true },
      include: includeLicences,
    })) ??
    (await prisma.beat.findFirst({
      where: { published: true },
      include: includeLicences,
      orderBy: { createdAt: "desc" },
    }));
  return beat ? toBeatView(beat) : null;
}

export async function getBeatBySlug(slug: string) {
  const beat = await prisma.beat.findUnique({
    where: { slug },
    include: includeLicences,
  });
  if (!beat || !beat.published) return null;
  return toBeatView(beat);
}

export async function getBeatById(id: string) {
  const beat = await prisma.beat.findUnique({
    where: { id },
    include: includeLicences,
  });
  return beat ? toBeatView(beat) : null;
}

export async function listLicences() {
  return prisma.licence.findMany({ orderBy: { sortOrder: "asc" } });
}
