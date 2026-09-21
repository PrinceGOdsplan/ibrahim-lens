## 1. Shared guard and tile

- [x] 1.1 Add a small checked-in JPEG at `scripts/seed-assets/volume/tile.jpg` (no network fetch).
- [x] 1.2 Add a shared loopback URL check (`localhost` / `127.0.0.1` / `::1` only) used by both volume seed and teardown; exit non-zero with a clear error and no PocketBase writes when the host is remote.
- [x] 1.3 Gitignore `scripts/.volume-booking-questions.json`.

## 2. Volume seed

- [x] 2.1 Add `scripts/seed-volume.ts`: load `.env`, apply the loopback guard, superuser-auth with `PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD` (same as `seed.ts`). Do not run schema or curated demo seed.
- [x] 2.2 Idempotently create volume tags (12), Gallery media (160), and Portfolio media (60) using `[vol]` captions, cycling `tile.jpg` and any existing local Instagram seed-assets. Cycle tags onto volume media. Create only the deficit.
- [x] 2.3 Idempotently create 20 `[vol]` albums (one with ~80 Gallery stills) and 15 `vol-work-*` Work (5 `show_on_website`). Do not change Home featured / atmosphere / lanes.
- [x] 2.4 Idempotently create 40 `[vol]` people, 40 bookings on those people, 20 `[vol]` inquiries, 20 testimonials, and 20 FAQ items.
- [x] 2.5 On first run, backup existing `booking_questions` to `scripts/.volume-booking-questions.json`, then set 8 `vol_` questions (mixed types, at least one long label). Skip if 8 `vol_` questions already exist.
- [x] 2.6 Add `seed:volume` to `package.json`. Leave `seed` and `seed:ig` unchanged.

## 3. Teardown

- [x] 3.1 Add `scripts/clear-volume.ts` with the same loopback guard and superuser auth.
- [x] 3.2 Delete volume bookings, then people, inquiries, testimonials, FAQ, albums, Work (`vol-work-*`), `[vol]` media, and `[vol]` tags. Restore `booking_questions` from the backup file when present. Leave photographer account, SEO, website identity, and curated demo rows.
- [x] 3.3 Add `seed:volume:clear` to `package.json`.

## 4. Docs and walkthrough

- [x] 4.1 README: backup local `pb_data` before first run; localhost-only; run `npm run seed` then `npm run seed:volume`; clear with `seed:volume:clear`; warn that `SEED_DEMO_FORCE=1` after volume can replace testimonials/FAQ.
- [x] 4.2 Against local PocketBase: confirm remote URL is refused; confirm a second `seed:volume` does not double counts.
- [ ] 4.3 Walk Studio Library Gallery and Portfolio walls (scroll past page 1; change tag/search and confirm the wall resets). Walk one fat album (no pager). Walk Website testimonials/FAQ, Contact booking (Add disabled at 8), public `/contact#booking`, Clients/Bookings lists, Settings tags, and the image picker.
- [ ] 4.4 Run `seed:volume:clear` and confirm curated demo photos/Work/testimonials remain and `[vol]` rows are gone.
