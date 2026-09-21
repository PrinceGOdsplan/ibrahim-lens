# Ibrahim Lens

Single-photographer public site + Studio. Greenfield app (not a fork).

## Stack (locked)

| Layer | Choice |
|-------|--------|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Studio UI | shadcn/ui primitives |
| Backend | PocketBase (auth, SQLite DB, file storage) |
| Run / deploy | Docker Compose — **local now, same core on VPS later** |

Moving to a VPS later should only change domain, HTTPS (Caddy), and volumes — not the core stack. Do not swap PocketBase for SaaS backends.

## Quick start (local)

1. **Copy env**

   ```bash
   cp .env.example .env
   ```

   Set `SEED_EMAIL` / `SEED_PASSWORD` (Studio photographer) and `PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD` (PocketBase superuser for seeding). Never commit `.env`.

2. **Start PocketBase**

   ```bash
   docker compose up -d
   ```

   | Service | Port | Notes |
   |---------|------|--------|
   | PocketBase API + Admin UI | **8090** | Admin UI: http://127.0.0.1:8090/_/ |
   | Vite (dev) | **5173** | `npm run dev` on the host |

   Compose uses the image’s default `serve` entrypoint (`0.0.0.0:8090`, data in `/pb_data`). Do not add another `serve` in `command`.

3. **Install & seed**

   ```bash
   npm install
   npm run seed
   ```

   Seed upserts the PocketBase superuser via the PocketBase CLI, creates the photographer account, ensures Library/Website collections, and loads **template demo content** (sample images, services, testimonials, FAQ, forms) when those areas are empty.

   - Re-seed demo forcefully: `SEED_DEMO_FORCE=1 npm run seed` (PowerShell: `$env:SEED_DEMO_FORCE=1; npm run seed`)
   - **Backup `pb_data` before FORCE seed or schema** if the install already holds real content (FORCE refreshes demo; `ensure-schema` adds fields)
   - **Compose:** set `PB_SEED_VIA_DOCKER=1` so seed runs `docker compose exec … superuser upsert`
   - **Local binary** (no Docker): place PocketBase under `tools/pocketbase/` or set `POCKETBASE_BIN`
   - **Realistic demo images (optional, local only):** `npm run seed:ig` one-shot-fetches public stills from `@ibra.himlens` into `scripts/seed-assets/instagram/` (needs `gallery-dl` or `instaloader`). Then FORCE seed. The public site never requests Instagram at runtime.
     - Instagram often rate-limits anonymous scrapers (`429`). Wait and retry, or close Chrome/Edge and set `$env:IG_COOKIES_BROWSER="chrome"` (or `edge`) before `npm run seed:ig`.
     - Soft-cap: `IG_SEED_MAX` (default 40).
   - **Volume seed (local UI walkthrough only):** `npm run seed:volume` after `npm run seed`. Fills enough Gallery/Portfolio stills to page the Studio walls (48/page), plus crowded albums, Work, people, bookings, inquiries, testimonials, FAQ, tags, and 8 booking questions. Reuses `scripts/seed-assets/volume/tile.jpg` (and local Instagram seed-assets if present) — no Picsum/Instagram fetch. **Refuses any non-localhost PocketBase.** Backup `pb_data` first. Clear with `npm run seed:volume:clear` (keeps curated demo). Do not run `SEED_DEMO_FORCE=1` after volume if you want to keep the volume testimonials/FAQ — FORCE replaces those collections with the small curated set.

4. **Run the app**

   ```bash
   npm run dev
   ```

   - Public site: http://127.0.0.1:5173/
   - Studio login: http://127.0.0.1:5173/studio/login

## Backup & restore (`pb_data`)

PocketBase stores the SQLite database **and** uploaded files under `./pb_data` (Compose volume), including short-lived `delivery_files` copies for client galleries. Push subscription rows and Write inquiries (`form_inquiries`) live in that same SQLite database — no extra volume. VAPID private keys live in env (not in `pb_data`). Collection rule changes (guest write hardening) do not add volumes; backup `pb_data` before running `ensure-schema` against an install with real content. Seed still creates the photographer via PocketBase superuser auth.

JS hooks live in `deploy/pb_hooks/` and are mounted at `/pb_hooks` in the PocketBase container (local Compose and VPS). Backup `pb_data`; hooks are in git, not in the data volume.

**Backup** (app stopped or consistent snapshot preferred):

```bash
docker compose stop pocketbase
tar -czf pb_data-backup-$(date +%Y%m%d).tar.gz pb_data
docker compose start pocketbase
```

On Windows PowerShell:

```powershell
docker compose stop pocketbase
Compress-Archive -Path pb_data -DestinationPath "pb_data-backup-$(Get-Date -Format yyyyMMdd).zip" -Force
docker compose start pocketbase
```

**Restore:** stop PocketBase, replace `./pb_data` with the backup contents, start again.

## Local vs VPS

| | Local | VPS later |
|--|-------|-----------|
| Compose | PocketBase (+ optional web image) | Same services |
| Frontend | Vite dev against `VITE_POCKETBASE_URL` | Built static/web container |
| TLS / domain | Not required | Caddy (or similar) + DNS |
| Data | `./pb_data` volume | Persistent volume + scheduled backups |

## Studio on the phone (PWA)

Studio is installable from `/studio` (not from the public site). After a deploy that changes the PWA head or worker:

1. Delete the old home-screen icon if it was added from Safari as a bookmark.
2. Open `https://ibrahimlens.com.ng/studio` (or `/studio/login`), sign in if needed.
3. Share → **Add to Home Screen**.
4. Open the installed icon, then Settings → Notifications → **Allow phone notices**.

Mobile checkboxes stay disabled until that standalone icon is what you are using.

**Web Push (VAPID)** — required for Mobile notices. Generate once:

```bash
npx tsx scripts/vapid-keys.ts
```

Put `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` on the PocketBase container (`deploy/.env` on VPS; project-root `.env` for local Compose). Put the same public value in `VITE_VAPID_PUBLIC_KEY` for the **production frontend build**, then rebuild the web image. Never commit the private key. Private keys live in env, not in `pb_data`.

## Share previews (`VITE_SITE_URL`, `VITE_OG_IMAGE`)

Link unfurlers in WhatsApp, Instagram, and Facebook do not run JavaScript, so a
shared link shows only what is in the built HTML. Two variables drive it:

| Variable | Purpose | Default |
|--|--|--|
| `VITE_SITE_URL` | Public origin, no trailing slash. Used for canonical URLs, `og:` tags, `robots.txt`, and `sitemap.xml`. | `http://localhost:5173` |
| `VITE_OG_IMAGE` | Path to the preview image, served from `public/`. | `/og-default.jpg` |

**Before deploying:**

1. Set `VITE_SITE_URL` to the real domain — the preview image URL is resolved
   against it, so a wrong value means no photograph in previews.
2. Add a **1200×630** JPEG of your own work at `public/og-default.jpg`. Until it
   exists, shared links show text only. Studio → Website → Site chrome → SEO
   flags this while the image is missing.

`robots.txt` and `sitemap.xml` are generated at build time from `VITE_SITE_URL`
(see `vite.config.ts`); they are not checked-in files. Delivery routes under
`/g/`, Studio under `/studio/`, and PocketBase admin under `/_/` are disallowed
to crawlers.

## Mail, health, and Search Console

Outbound mail is optional but treated as production when configured. **Local
Compose** reads `RESEND_API_KEY` from the **project-root** `.env` (see
`docker-compose.yml`). **VPS** uses `deploy/.env`. A key only in `deploy/.env`
does not reach local PocketBase. On boot, hooks enable Resend SMTP and send as
`hello@ibrahimlens.com.ng`. Do not turn on Resend receiving — Cloudflare Email
Routing owns inbound MX. Then Studio → Settings → Notifications: notify address,
inbound matrix (booking / Write / feedback), client gallery-ready and expiry
mail, and mail health. Bookings still land in Studio if mail is unset. Backup
`./pb_data` before schema/seed changes.

**Health:** `GET https://ibrahimlens.com.ng/api/health` (no Studio session).
Point a free HTTP ping at it. Caddy already sends `Cache-Control: no-store` for
`/api/*`.

**PocketBase Admin on VPS:** Caddy puts HTTP basic auth in front of `/_/`. Set
`ADMIN_BASIC_USER` and a bcrypt `ADMIN_BASIC_HASH` in `deploy/.env` (generate
with `docker run --rm caddy:2-alpine caddy hash-password`). If the hash is
empty, `/_/` fails closed (401). Local Compose serves Admin on
`http://127.0.0.1:8090/_/` without that extra gate. After basic auth, sign in
with the PocketBase Admin password as before.

**Search Console:** add the `https://ibrahimlens.com.ng` URL prefix property and
submit `https://ibrahimlens.com.ng/sitemap.xml`.

## Design tokens

- **Public:** near-black `#0a0a0a`, warm off-white `#f4f1ea`, gold `#d4a84b` — street/party intensity with sparse ornaments
- **Studio:** light `#F7F7F5` / text `#1A1A1A`
- No public watermarks; Delivery gallery view may show a quiet corner wordmark; downloads stay unmarked

## Product notes

- Studio hubs: Dashboard, Library, Website, Clients, Settings (`/studio`)
- Library: upload finished images (JPEG/PNG/WebP); max size via `MAX_UPLOAD_MB` / `VITE_MAX_UPLOAD_MB` (default 25); PocketBase stores originals and serves thumbnails; public pages unmarked
- Public nav: Home, About, Portfolio, Work, Contact + Privacy / Terms
- Deliveries reserved at `/g/:token` (not in nav); expire **7 days after creation**
- Services packages max **12**; booking questions max **8**

## OpenSpec

Plans live in `openspec/`. Cursor commands: `/opsx-explore`, `/opsx-propose`, `/opsx-apply`, `/opsx-archive`.

### Active changes

1. `admin-website`
2. `public-site`
3. `admin-clients`
4. `admin-dashboard-settings`
