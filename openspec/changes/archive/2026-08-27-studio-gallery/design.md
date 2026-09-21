## Context

See proposal.md — Why. Today: one `media` pool, `in_portfolio` flag, Library hub with caption/chips under thumbs and a persistent manage panel. Website pickers already use a shared modal.

## Goals / Non-Goals

**Goals:** Two piles via `vault` + `copied_from`; Gallery UI overhaul; nav/route rename; migration; delete prompt; density preference.

**Non-Goals:** New PocketBase collections beyond `media` fields; two-way sync; Clients changes.

## Decisions

1. **Same `media` collection, two piles** — Field `vault`: `gallery` | `portfolio` (default `gallery`). Field `copied_from` (optional relation → media) on Portfolio copies. Prefer this over a second collection so albums/work/website relations stay one ID space.
   - Alternative: `portfolio_media` collection — rejected (duplicate relation wiring).

2. **Promote** — Fetch file blob from Gallery record → create new media with `vault=portfolio`, `copied_from`, copied caption/tags; leave original `vault=gallery`, clear `in_portfolio`.

3. **Public Portfolio list** — Filter `vault = "portfolio"` (and sort). Deprecate relying on `in_portfolio` after migration (keep field for transition if needed).

4. **Migration** — Script/ensure path: for each `in_portfolio=true`, promote copy if no portfolio child exists; set original `vault=gallery`, `in_portfolio=false`. Remap `home_featured` / atmosphere / lane images to Portfolio copies when a copy exists for that original (optional nicety — do when straightforward).

5. **UI** — Rebuild `LibraryPage` as Gallery: rooms, pure grid, localStorage `studio-gallery-cols`, sheet via existing `StudioFullscreenModal` or side sheet pattern. Rename nav + `/studio/gallery` with redirect from `/studio/library`.

6. **Picker** — `StudioImageGallery` loads both vaults; filter chips Gallery / Portfolio / tags.

## Risks / Trade-offs

- [Risk] Storage doubles for promoted images → Accept for true separation.
- [Risk] Orphan Portfolio copies if Gallery deleted “only” → Keep copies; `copied_from` may point at missing id — treat as optional.
- [Risk] Migration runtime on large libraries → Run once via seed/ensure or Studio first-load migrate guard.

## Migration Plan

1. Schema fields via ensure-schema.
2. One-shot migrate function on Studio Gallery load (idempotent).
3. Rollback: keep `in_portfolio` readable until migrate complete; do not delete files on failed promote.

## Open Questions

None — product locked in explore.
