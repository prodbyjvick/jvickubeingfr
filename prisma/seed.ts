import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { BEATS, generateMedia } from "../scripts/generate-media.mjs";

const prisma = new PrismaClient();

const LICENCES = [
  {
    slug: "basic-mp3",
    name: "Basic MP3 Lease",
    summary: "Tagged-free MP3 for independent releases with a stream cap.",
    fileLabel: "MP3",
    sortOrder: 1,
    features: [
      "Untagged MP3",
      "Distribute up to 5,000 streams / 2,000 copies",
      "One music video",
      "Non-exclusive — others may still lease this beat",
      "Credit: prodbyjvick",
    ],
    terms: `This Basic MP3 Lease is a non-exclusive licence. You may record, mix and commercially release one new composition using the beat, in MP3 format only.

Stream and sale caps: 5,000 combined streams and 2,000 paid copies. One music video is permitted. Live performance is allowed.

You must credit the producer as “prodbyjvick” on all releases and metadata. You may not register the instrumental as a separate work, sell the beat on, or claim exclusive ownership.

This licence does not include WAV files, stems, radio broadcast beyond the caps above, or synchronisation in advertisements or film. Upgrade to a higher licence at any time by paying the difference.`,
  },
  {
    slug: "premium-wav",
    name: "Premium WAV Lease",
    summary: "WAV + MP3, higher caps, two videos — still non-exclusive.",
    fileLabel: "WAV + MP3",
    sortOrder: 2,
    features: [
      "Untagged WAV and MP3",
      "Distribute up to 50,000 streams / 10,000 copies",
      "Two music videos",
      "Non-exclusive",
      "Credit: prodbyjvick",
    ],
    terms: `This Premium WAV Lease is a non-exclusive licence. You receive untagged WAV and MP3 masters of the beat for one new composition.

Caps: 50,000 combined streams and 10,000 paid copies. Two music videos are permitted. Paid live performances are allowed within the caps.

Producer credit “prodbyjvick” is required. You may not transfer this licence, resell the instrumental, or register the beat as a work for hire without a separate exclusive agreement.

Radio play within the stream cap is permitted. Advertising, TV, film and game sync require written approval or an exclusive buyout.`,
  },
  {
    slug: "unlimited",
    name: "Unlimited Lease",
    summary: "No stream cap. WAV + MP3. Still non-exclusive until bought out.",
    fileLabel: "WAV + MP3",
    sortOrder: 3,
    features: [
      "Untagged WAV and MP3",
      "Unlimited streams, sales and videos",
      "Radio-ready",
      "Non-exclusive",
      "Credit: prodbyjvick",
    ],
    terms: `The Unlimited Lease removes stream, sale and video caps for one composition. You receive untagged WAV and MP3 files.

The beat remains non-exclusive and may still be licensed to others until an exclusive buyout is completed. Producer credit “prodbyjvick” is required unless a written waiver is granted.

You may not sell, lease or gift the instrumental itself, register the beat independently with a PRO as a separate instrumental work, or claim exclusive ownership.

Sync in advertisements, film, TV or games still requires written consent or exclusive rights.`,
  },
  {
    slug: "exclusive",
    name: "Exclusive Rights",
    summary: "Beat is removed from the store. Full buyout for one artist.",
    fileLabel: "WAV + MP3 (exclusive)",
    sortOrder: 4,
    features: [
      "Beat taken down after payment",
      "WAV and MP3 masters",
      "Unlimited use of your record",
      "No ongoing lease credit required",
      "One buyer only",
    ],
    terms: `Exclusive Rights is a full buyout of this beat for one client. Upon cleared payment the listing is removed from JVICK BEATS and no further leases are sold.

You receive the untagged masters (WAV and MP3). Existing non-exclusive leaseholders keep the rights they already paid for; they cannot be revoked by this buyout.

You may commercially exploit your new composition without a stream cap. Producer publishing splits on the new composition are not automatically transferred — register splits in writing if you want a different share than the default (typically 50% of the composition’s publishing to the producer unless otherwise agreed).

This exclusive does not include a transfer of the producer’s name, catalogue, or other beats.`,
  },
];

const DESCRIPTIONS: Record<string, string> = {
  "midnight-run":
    "Night-drive trap with a dry 808 and a two-note lead that never quite resolves. Built for late verses and unhurried hooks.",
  "quiet-luxury":
    "Soft-focus R&B. Warm keys, tucked drums, and space where a falsetto can sit. Unshowy on purpose.",
  "chrome-hearts":
    "UK drill swing, sliding 808s, sparse piano. Leave it dry or stack choirs — it holds either way.",
  "late-checkout":
    "Mid-tempo Afrobeats bounce with guitar-like synths and a kick that stays out of the vocal’s way.",
  "velvet-hour":
    "Dark R&B bed: slow drums, thick sub, a pad that feels like 2 a.m. lighting. For ballads that still hit.",
  "no-witnesses":
    "Drill, stricter and colder. Staccato hats, minor keys, a bassline that walks then drops.",
  "soft-launch":
    "Brighter pop/R&B loop with a four-chord lift. Clean enough for a first single, not cute.",
  "after-hours":
    "Trap soul: dusty keys, half-time hats, 808s that bloom on the 3. For hooks that sound expensive.",
};

const PRICES: Record<string, Record<string, number>> = {
  "midnight-run": { "basic-mp3": 2999, "premium-wav": 4999, unlimited: 14999, exclusive: 79999 },
  "quiet-luxury": { "basic-mp3": 2499, "premium-wav": 4499, unlimited: 12999, exclusive: 59999 },
  "chrome-hearts": { "basic-mp3": 2999, "premium-wav": 4999, unlimited: 14999, exclusive: 69999 },
  "late-checkout": { "basic-mp3": 2499, "premium-wav": 3999, unlimited: 11999, exclusive: 54999 },
  "velvet-hour": { "basic-mp3": 2499, "premium-wav": 4499, unlimited: 12999, exclusive: 64999 },
  "no-witnesses": { "basic-mp3": 2999, "premium-wav": 4999, unlimited: 14999, exclusive: 69999 },
  "soft-launch": { "basic-mp3": 1999, "premium-wav": 3499, unlimited: 9999, exclusive: 49999 },
  "after-hours": { "basic-mp3": 2499, "premium-wav": 4499, unlimited: 12999, exclusive: 59999 },
};

async function main() {
  generateMedia();

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.beatLicence.deleteMany();
  await prisma.beat.deleteMany();
  await prisma.licence.deleteMany();

  const licences = [];
  for (const licence of LICENCES) {
    const row = await prisma.licence.create({
      data: {
        slug: licence.slug,
        name: licence.name,
        summary: licence.summary,
        terms: licence.terms,
        features: JSON.stringify(licence.features),
        fileLabel: licence.fileLabel,
        sortOrder: licence.sortOrder,
      },
    });
    licences.push(row);
  }

  mkdirSync(path.join(process.cwd(), "uploads/masters"), { recursive: true });

  for (const beat of BEATS) {
    const waveformPath = path.join(process.cwd(), "public/media/waveforms", `${beat.slug}.json`);
    const waveform = existsSync(waveformPath)
      ? readFileSync(waveformPath, "utf8")
      : JSON.stringify(Array.from({ length: 96 }, () => 0.3));

    const created = await prisma.beat.create({
      data: {
        slug: beat.slug,
        title: beat.title,
        genre: beat.genre,
        bpm: beat.bpm,
        musicalKey: beat.key,
        description: DESCRIPTIONS[beat.slug],
        coverPath: `/media/covers/${beat.slug}.svg`,
        previewPath: `/media/previews/${beat.slug}.mp3`,
        waveform,
        tags: JSON.stringify([beat.genre, `${beat.bpm} BPM`, beat.key]),
        featured: beat.slug === "midnight-run",
        published: true,
      },
    });

    for (const licence of licences) {
      const masterExt = licence.slug === "basic-mp3" ? "mp3" : "wav";
      const src = path.join(process.cwd(), "uploads/masters", `${beat.slug}.${masterExt}`);
      if (!existsSync(src) && masterExt === "mp3") {
        copyFileSync(path.join(process.cwd(), "uploads/masters", `${beat.slug}.wav`), src);
      }
      await prisma.beatLicence.create({
        data: {
          beatId: created.id,
          licenceId: licence.id,
          pricePence: PRICES[beat.slug][licence.slug],
          masterPath: `masters/${beat.slug}.${masterExt}`,
        },
      });
    }
  }

  console.log(`Seeded ${BEATS.length} beats and ${licences.length} licence tiers.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
