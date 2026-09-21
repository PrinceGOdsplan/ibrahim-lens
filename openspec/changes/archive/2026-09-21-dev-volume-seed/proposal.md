## Why

The curated demo seed is too small to exercise Studio lists that paginate or grow. A local-only volume seed is needed so we can walk pagination, crowded forms, and long pickers without touching production or rewriting the pretty demo.

## What Changes

- Add a **dev-only volume seed** (separate npm script / script file) that inserts enough records to cross Library wall page boundaries and crowd Studio/public forms.
- Guard the script so it **refuses to run** unless PocketBase is a local URL (never production).
- Keep `npm run seed` / `SEED_DEMO_FORCE` / Instagram seed-assets **unchanged** — volume seed is additive and optional.
- Document backup of local `pb_data` before running, plus a matching clear/teardown path that removes volume rows without wiping the curated demo identity copy.
- Reuse a handful of local image files (no Picsum, no Instagram fetch) so the run is cheap and repeatable.

## Capabilities

### New Capabilities

- `dev-volume-seed`: Local-only script that floods Gallery, Portfolio, Work, albums, people, bookings, inquiries, testimonials, FAQ, tags, and booking questions to UI-test counts — never on a remote PocketBase.

### Modified Capabilities

- None. Curated demo (`seed-demo-media`) and product UI requirements stay as they are; this only adds a developer data path.

## Non-goals

- Changing Library, Website, Clients, or public pagination/list behavior (this seed *reveals* gaps; it does not add pagers).
- Performance, disk, or load testing; unique photos; Picsum/Instagram fetches.
- Raising product caps (booking questions 8, home featured/lanes/Work picks).
- Running against production, VPS, or any non-local PocketBase.
- Changing Soft night public craft or making the public site look like a dump beyond modest Portfolio volume.
- Schema changes, new collections, or Docker/stack changes.

## Impact

- New script under `scripts/` plus an npm script in `package.json` (e.g. `seed:volume` / `seed:volume:clear`).
- README local-dev notes: backup `pb_data`, localhost guard, how this differs from `npm run seed`.
- Local PocketBase `pb_data` grows (reused small JPEGs + thumbs). No production API, hook, or Compose change.
- Studio and public UIs are the *verification surface*, not the implementation surface.
