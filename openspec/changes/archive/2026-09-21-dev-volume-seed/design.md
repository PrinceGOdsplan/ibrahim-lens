## Context

See proposal.md for why. Curated demo lives in `scripts/seed-demo-content.ts` and stays untouched. Studio Library Gallery/Portfolio walls page at 48 via `listMediaPage`; albums, Work, Clients, Bookings, Website testimonials/FAQ, tags, and the image picker do not page. Volume seed is a host-side `tsx` script talking to local PocketBase the same way `seed.ts` does (superuser auth, `VITE_POCKETBASE_URL`). No schema, hook, or Compose change.

## Goals / Non-Goals

**Goals:**

- A localhost-only, idempotent fill that crosses the 48-item wall threshold and crowds uncapped Studio lists.
- A marker convention so teardown can delete volume rows without a schema flag.
- Documented run order: curated `seed` first, then volume; backup `pb_data` first.

**Non-Goals:**

- Adding pagers or changing product caps (design-level: the seed is the probe, not the fix).
- A volume boolean on collections, env-tunable counts in v1, Deliveries, or a 500-image Work.
- Hooking volume into `SEED_DEMO_FORCE` (FORCE after volume may wipe volume testimonials/FAQ; that is accepted and documented).

## Decisions

**1. Separate scripts, not an extra mode on `seed.ts`**

- `scripts/seed-volume.ts` + `npm run seed:volume`
- `scripts/clear-volume.ts` + `npm run seed:volume:clear`
- Alternative considered: `SEED_VOLUME=1 npm run seed`. Rejected — too easy to confuse with FORCE and too easy to run against the wrong mental model. Distinct commands match the spec.

**2. Loopback guard before any PocketBase write**

Parse `VITE_POCKETBASE_URL` (default `http://127.0.0.1:8090`). Allow only hostnames `localhost`, `127.0.0.1`, and `::1`. Reject everything else (including production domains and `host.docker.internal`) with a non-zero exit and no auth attempt if possible — or auth-then-abort before mutations if URL parsing needs a live check. Same guard on teardown.

- Alternative considered: allow any URL when `VOLUME_SEED_I_MEAN_IT=1`. Rejected — spec forbids remote writes.

**3. Distinguish volume rows with a `[vol]` prefix (no schema)**

| Collection | Marker |
|---|---|
| `media` | caption `[vol] Gallery 001` / `[vol] Portfolio 001` |
| `albums` | title `[vol] Album 01` |
| `work_projects` | slug `vol-work-01` (title may also include `[vol]`) |
| `people` | name `[vol] Person 01` |
| `bookings` | owned by a `[vol]` person (delete bookings before people) |
| `form_inquiries` | name or message starts with `[vol]` |
| `testimonials` | `author_name` `[vol] Client 01` |
| `faq_items` | question `[vol] Question 01?` |
| `portfolio_tags` | name `[vol] Tag 01` |

Teardown filters on those patterns. Curated demo captions/slugs do not use `[vol]` / `vol-work-`.

- Alternative considered: persist created IDs in a gitignored JSON. Rejected — lost if the file is deleted; prefix survives.

**4. Booking questions: backup file, then write 8 capped questions**

Volume seed writes `scripts/.volume-booking-questions.json` (gitignored) with the previous `website_globals.booking_questions` on first run, then sets 8 extra questions (mix of text / textarea / choice, including long labels). IDs use a `vol_` prefix so a second run can skip. Teardown restores from that file if present; otherwise leaves questions as-is if it cannot tell.

Do not change `home_featured`, atmosphere, or lanes — keep Home curator on the pretty demo.

**5. Default counts (enough to see the UI, not a flood)**

| Target | Count | Why |
|---|---|---|
| Gallery media | 160 | 3 wall pages (48×3 + remainder) |
| Portfolio media | 60 | Portfolio wall pages once |
| Vol tags | 12 | Chip wrap; cycle onto volume media for filter-reset checks |
| Albums | 20 | Collection wall; one album gets ~80 Gallery stills (inner wall has no pager — that is the finding) |
| Work | 15 (5 `show_on_website`) | Collection list + Website picker without exploding Home `expand:images` |
| People / bookings | 40 each | Clients/Bookings lists + person `<select>` |
| Inquiries | 20 | Inbox density |
| Testimonials / FAQ | 20 each | Accordion editors |
| Booking questions | 8 | Product cap |

Idempotent: count existing `[vol]` / `vol-work-` rows and create only the deficit. Re-run does not double.

**6. Local tiles only**

Commit one small JPEG at `scripts/seed-assets/volume/tile.jpg`. Cycle that file (and any files already in `scripts/seed-assets/instagram/` if present) for every upload. Never call Picsum or Instagram.

- Alternative considered: synthesize JPEG bytes in-process with no file. Spec prefers on-disk assets; a checked-in tile is explicit and reviewable.

**7. Auth and dependencies**

Reuse the same env as `seed.ts` (`PB_ADMIN_EMAIL` / `PB_ADMIN_PASSWORD`, `VITE_POCKETBASE_URL`). Superuser login only — volume seed does not create the photographer or run `ensure-schema`. Document: run `npm run seed` first so collections exist.

`pb.autoCancellation(false)`; sequential creates are fine at these counts.

**8. Docs**

README Quick start: backup `pb_data`, localhost-only, `seed` then `seed:volume`, `seed:volume:clear` to drop `[vol]` rows. Note that `SEED_DEMO_FORCE=1` after volume can replace testimonials/FAQ with the small curated set.

## Risks / Trade-offs

- [FORCE after volume wipes volume CMS rows] → Document run order; teardown cannot restore FORCE-clobbered curated-vs-volume mix beyond the booking-questions backup.
- [Photographer manually names something `[vol]`] → Unlikely in local demo; teardown would delete it. Prefix is ugly on purpose.
- [60 public Portfolio stills change public masonry] → Accepted for UI walking; counts stay modest vs a dump. Home featured left alone.
- [Thumb generation on first Library scroll] → Same as any upload; tiles are small. Not a perf project.
- [Album/Work inner walls do not page] → Seed will make that obvious; out of scope to fix here.
- [Shared tile.jpg looks repetitive] → Fine for “does the wall page / does the form wrap.”

## Migration Plan

1. Backup local `pb_data` (README already has the tar/PowerShell pattern).
2. `npm run seed` if collections/account are missing.
3. `npm run seed:volume`.
4. Walk Studio Library (scroll + filter/search reset), Website forms, Clients/Bookings, public Book form.
5. Rollback: `npm run seed:volume:clear`, or restore the `pb_data` backup. No production deploy step.

## Open Questions

None that change the spec or this approach. Optional env overrides for counts can wait until someone needs a second profile.
