## Why

Studio Library feels like a raw image hub, not part of the quiet Studio language used on Website. Photographers need a real gallery: image-first browsing, Portfolio as its own room with separate copies so deleting from the everyday store does not wipe the public site, and rare ops tucked away.

## What Changes

- Rename Studio **Library** → **Gallery** (nav, routes, page copy). Shared Website picker stays “Pick photos,” not a second hub named Gallery.
- **Two photo piles:** Gallery (everyday uploads) and Portfolio (one-way copies for the public site).
- Gallery page rooms (tabs): **Gallery** · **Portfolio** · **Albums** · **Work** — Portfolio feels like a different room; Albums and Work stay under Gallery.
- Gallery wall: pure thumbnails (no caption/name or Portfolio badges under tiles); sort/filter by date, name, tag; column-count handle (persisted); quiet slide-in sheet for details/ops (phone same as Website).
- **Send to Portfolio** creates a one-way file copy. Captions in Portfolio do not rewrite Gallery.
- Albums and Work may attach photos from **either** pile. Website pickers may use **Gallery or Portfolio**.
- Delete from Gallery: if a Portfolio copy exists, ask **Gallery only** or **both**.
- Migration: existing `in_portfolio` photos become Portfolio copies; originals stay in Gallery.

## Non-goals

- Soft night public redesign
- Clients / Dashboard rewrite
- Two-way caption sync between piles
- Separate Studio nav hubs for Albums or Work
- Infinite scroll / social feed gallery

## Capabilities

### New Capabilities

- `studio-gallery`: Gallery hub IA — rename, rooms, thumb-first wall, density handle, quiet sheet, sort/filter

### Modified Capabilities

- `library-media`: Two piles (Gallery + Portfolio copies); promote one-way; delete prompt; stop treating Portfolio as a chip on every Gallery tile
- `library-portfolio`: Portfolio room is its own pile of copies; public Portfolio reads Portfolio pile
- `library-albums`: Albums may reference Gallery or Portfolio photos
- `library-work`: Work may reference Gallery or Portfolio photos
- `app-shell`: Studio nav label Library → Gallery; route update

## Impact

- Studio: `LibraryPage` → Gallery page, `StudioLayout` nav, routes in `App.tsx`
- `library.ts` + PocketBase `media` fields (`vault`, `copied_from`) + ensure-schema / migrate script
- Website image pickers load both piles
- Public Portfolio / Featured prefer Portfolio pile after migration
- Local preference for grid column count (localStorage)
