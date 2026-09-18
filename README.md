# JVICK BEATS

Self-hosted beat store for **prodbyjvick** — dark, direct, and independent of BeatStars. Buyers pay in GBP via Stripe Checkout (Apple Pay included on supported devices). Paid masters unlock through signed, time-limited download URLs. Tagged previews stay public for streaming.

Brand colours: purple `#8E00EC` / `#A500FF` on near-black, with white type. Rename the store in `src/lib/brand.ts`.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS
- Prisma + SQLite locally (Postgres for Vercel — see below)
- Stripe Checkout + webhook
- Password-protected admin to CRUD beats and upload cover / preview / master files

## Local run

You need Node 20+ and `ffmpeg` on your PATH (used once to encode demo MP3s).

```bash
cp .env.example .env
# Set ADMIN_PASSWORD to 12+ characters and a long ADMIN_SESSION_SECRET
npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run setup` generates placeholder cover art and demo audio, pushes the Prisma schema, and seeds eight beats (including **Midnight Run**) with four licence tiers.

Sign in at `/admin/login`. `ADMIN_PASSWORD` must be at least 12 characters.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma connection. Local default: `file:./dev.db` (relative to the `prisma/` folder). |
| `APP_URL` | Public origin, no trailing slash. Used for Stripe redirects and download links. |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_…` while developing). |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen` or the Dashboard webhook. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Publishable key (reserved for future client-side Stripe.js; Checkout currently uses the secret key on the server). |
| `ADMIN_PASSWORD` | Admin sign-in. Minimum 12 characters. Production rejects placeholders such as `change-me`. |
| `ADMIN_SESSION_SECRET` | HMAC secret for the httpOnly admin cookie (24+ characters). |
| `DOWNLOAD_SECRET` | HMAC secret for signed download URLs (15-minute TTL). |
| `UPLOAD_DIR` | Directory for paid masters (default `uploads/`, outside `public/`). |
| `ALLOW_DEMO_CHECKOUT` | `true` only in local development. **Forced `false` when `NODE_ENV=production`.** Keep it `false` on Vercel. |

## Security (read before you take a card payment)

- **Never take payment off Stripe.** No bank-transfer “I’ll email the WAV”, PayPal.me, Instagram checkout, or mystery download links. Buyers pay on Stripe Checkout only.
- **Change every secret before deploy:** `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `DOWNLOAD_SECRET`, Stripe live keys, and `APP_URL`.
- Set **`ALLOW_DEMO_CHECKOUT=false`** on the live site. Production code ignores the flag even if someone sets it to true.
- Masters never sit in `/public`. They download only via signed URLs (`/api/download?token=…`) that expire after 15 minutes. Refresh the download centre for a new link.
- Admin uploads accept **audio and ZIP** for previews/masters, and **images** for covers. HTML, JS and executables are rejected.
- Admin login is rate-limited, uses httpOnly `Secure` cookies (`SameSite=Strict`), and mutations check the request origin.
- Responses send CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `frame-ancestors 'none'`.

## Stripe (test mode)

1. Create a [Stripe account](https://dashboard.stripe.com/register) in the **United Kingdom** so settlement can go to your UK bank.
2. Copy Test mode keys into `.env`.
3. Forward webhooks while `npm run dev` is running:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Paste the printed `whsec_…` into `STRIPE_WEBHOOK_SECRET`.

4. Use [test cards](https://docs.stripe.com/testing). `4242 4242 4242 4242` succeeds. Success URL opens the download centre; the webhook (or the success page itself) marks the order paid.

To exercise the download UI without Stripe keys, set `ALLOW_DEMO_CHECKOUT=true` **locally only**. That path is disabled in production.

### Apple Pay

Stripe Checkout shows Apple Pay automatically when:

- The shop is served over **HTTPS** (Vercel does this).
- You complete [Apple Pay domain verification](https://dashboard.stripe.com/settings/payment_methods) for your domain in the Stripe Dashboard (Payment methods → Apple Pay → add domain).
- The buyer uses Safari / a wallet-capable browser on a device with a card in Wallet.

You do not add a separate Apple Pay button on-site; the Checkout page presents it. Nigeria and other international cards are accepted according to your Stripe Radar / payment method settings — enable the countries you want under Stripe Settings. Settlement remains in GBP to the UK account.

### Going live

1. Switch to **live** Stripe keys (`sk_live_…`, live webhook secret).
2. Confirm `ALLOW_DEMO_CHECKOUT=false`.
3. Rotate `ADMIN_PASSWORD` (12+ characters, not a placeholder), `ADMIN_SESSION_SECRET`, and `DOWNLOAD_SECRET`.
4. Add a production webhook endpoint: `https://YOUR_DOMAIN/api/webhooks/stripe` listening for `checkout.session.completed`.
5. Verify the Apple Pay domain on the live Stripe account.

## Adding beats

1. Sign in at `/admin/login`.
2. **Add beat** — title, genre, BPM, key, description.
3. Upload cover art, a **tagged** public preview, and a paid master per licence.
4. Set GBP prices for Basic MP3 Lease, Premium WAV Lease, Unlimited Lease, and Exclusive Rights.
5. Publish. Exclusive purchases mark the beat as sold and stop further checkouts.

Previews live under `public/media/` (streamable). Masters live under `uploads/` and are only served through `/api/download?token=…` HMAC URLs that expire after 15 minutes. The download centre at `/downloads/[token]` mints fresh links.

## Deploy on Vercel

SQLite will not survive Vercel’s serverless filesystem. For production:

1. Create a Postgres database (Neon, Vercel Postgres, or Supabase).
2. In `prisma/schema.prisma` change the datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Set `DATABASE_URL` on Vercel to the pooled Postgres URL.
4. Store paid files on persistent object storage (S3, Cloudflare R2, or Vercel Blob) and point `UPLOAD_DIR` at a writable disk only if you use a VPS. On Vercel, swap `src/lib/storage.ts` to your bucket when you outgrow local disk.
5. Set `APP_URL` to `https://your-domain`.
6. Set `ALLOW_DEMO_CHECKOUT=false` and strong admin/download secrets.
7. Deploy. The `postinstall` script runs `prisma generate`. After first deploy, run `npx prisma db push` (or `migrate deploy`) against production, then seed if you want the demo catalogue:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

Alternatively host on Railway, Fly.io, or a VPS if you prefer keeping SQLite and local `uploads/`.

## Pages

| Path | Purpose |
| --- | --- |
| `/` | Hero, featured player, latest drops |
| `/catalog` | Search and filter |
| `/beats/[slug]` | Player + licence picker |
| `/cart` | Cart → Stripe Checkout |
| `/checkout/success` | Payment confirmation |
| `/downloads/[token]` | Gated download centre |
| `/licenses` | Full licence terms |
| `/kits` | Kits placeholder |
| `/contact` | Contact form (stored for admin) |
| `/admin` | CRUD beats, messages |

## Rename the store

Edit `src/lib/brand.ts`. Licence copy that mentions `prodbyjvick` also lives in `prisma/seed.ts` — re-seed or edit in the database after you change the producer credit.
