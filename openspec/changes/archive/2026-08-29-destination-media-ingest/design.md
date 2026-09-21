## Context

See proposal.md for why. Today `uploadMedia` always sets `vault=gallery`, the Gallery wall lists `vault != "portfolio"`, and `mediaVault()` treats anything that is not Portfolio as Gallery. Portfolio/album/Work have no in-place upload (albums/Work copy tells you to attach from a Gallery sheet). PocketBase `media.vault` select values are `gallery` | `portfolio` only. Public media view is Portfolio (or delivery token); published Work expands `images`, so held photos on a public Work need a view rule.

## Goals / Non-Goals

**Goals:**
- Explicit Gallery list (`vault = "gallery"`).
- `held` vault for album/Work uploads; Portfolio uploads set `vault=portfolio` with no Gallery row.
- In-place Upload + Pick on Portfolio, Albums, Work.
- Last-holder delete for held photos.
- Public Work can view held images on `show_on_website` projects.

**Non-Goals:**
- Dashboard ingest, Website slot upload, Delivery picker rewrite, Send-to-Gallery.

## Decisions

### Three vault values, one collection

Keep one `media` collection. Vault `gallery` | `portfolio` | `held`. Album/Work membership stays `images[]` ids. Do not use vault=`album` because one held file can sit on two albums.

Alternative: a boolean `in_gallery`. Rejected — vault already means pile; a third value is clearer than `vault != portfolio` hacks.

### Gallery wall and `mediaVault()`

`listMediaPage({ vault: 'gallery' })` uses `vault = "gallery"`. `mediaVault()` returns `gallery` | `portfolio` | `held` (never collapses held).

`ensure-schema` vault select adds `held`. Portfolio vault migrate MUST skip `held` (today it would rewrite non-gallery rows to gallery).

### Upload helpers

`uploadMedia(file, { vault, albumId?, workId? })`. Gallery: vault gallery. Portfolio: vault portfolio, `in_portfolio` true, append to portfolio order. Album/Work: vault held, then `addMediaToAlbum` / `addMediaToWork`.

Pick on albums/Work reuses `StudioImageGallery` (Gallery + Portfolio filters). Held is not offered as a pick pile in this change.

### Last-holder delete

On album or Work delete, after the existing confirm: detach, then for each held id whose `images` membership is now empty across all albums and work_projects, `delete` the media record. Gallery/Portfolio ids are only detached.

### Public Work view rule

Extend media list/view: authed OR portfolio OR delivery token OR (`work_projects.show_on_website = true` AND `work_projects.images.id ?= id` OR cover). Same pattern as `mediaViaDelivery`.

Alternative: copy held → portfolio when publishing Work. Rejected — publishing would dump photos into Portfolio; the photographer asked that destination uploads stay out of Gallery, and Portfolio is a different public pile.

### Gallery chrome

Gallery room keeps compact Add + wall drop (Gallery pile only). Portfolio room gets its own Add + wall drop. Albums/Work get Add on the selected record (and drop on that pane). The single title-row Add is hidden unless the Gallery room is active.

## Risks / Trade-offs

[Published Work with held photos 403s for guests] → schema view rule via `work_projects` images/cover.

[Migrate script promotes held back to gallery] → skip `vault = held`.

[Website picker “All” includes held] → picker filters stay Gallery/Portfolio; do not add a Held chip in this change.

[Orphan held if detach without going through album delete] → remove-from-album/Work uses the same last-holder cleanup.

## Migration Plan

Front-end + `ensure-schema` (select values + rules). Existing rows stay gallery or portfolio. No seed rewrite. Rollback: revert vault values unused; held rows would need a one-off if we shipped to prod then rolled back (dev-first).

## Open Questions

None.
