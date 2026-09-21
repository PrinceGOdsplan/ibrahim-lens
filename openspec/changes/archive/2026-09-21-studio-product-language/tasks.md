## 1. Shell

- [x] 1.1 Confirm no PocketBase schema, seed, or `pb_data` backup work — frontend only (document that skip in the implement notes if README ops still mention pulse desk)
- [x] 1.2 Move desktop appearance, notices, and profile onto the rail foot; remove the full-width product header on `md+`
- [x] 1.3 Keep operator controls reachable when the rail is collapsed (icon-only, 44px)
- [x] 1.4 Phone: compact operator strip (appearance, notices, profile) that does not name the hub; do not restore a hamburger; leave room for the bottom hub bar
- [x] 1.5 Verify light stays default and night still toggles the whole shell including login/portals

## 2. Page recipe

- [x] 2.1 Set hub titles in `StudioHubHeader` to Figtree (drop `font-display` on the H1)
- [x] 2.2 Cap `StudioScrollPane` content width on wide desktop so the page breathes
- [x] 2.3 Make the painted rail vs page split visible on light (rail panel, quieter page ground)

## 3. Dashboard data

- [x] 3.1 Drop `24h` from `DESK_PERIODS`; map stored `24h` to `7d` in `parseDeskPeriod`
- [x] 3.2 Bucket `money_changed` collected deltas into a series (daily for 7d/30d, monthly last 12 months for All)
- [x] 3.3 Shape week blotter days (next 7 from local day-start, empty days included, first name + time + Today)
- [x] 3.4 Load 8–12 latest Gallery thumbs via `listMediaPage`; join failures into `failed`
- [x] 3.5 Expose chips: Booked, Outstanding always; other attention counts only when > 0

## 4. Dashboard instrument

- [x] 4.1 Replace pulse layout: Collected hero + handmade SVG series (hover/focus amount; flat ₦0 when quiet); no chart package
- [x] 4.2 Render chips, week blotter (rows open the booking), frames (open Gallery; omit plane when empty, no Upload CTA)
- [x] 4.3 Remove greeting, lifetime-earned hero, pulse card, count stacks, and 24h control
- [x] 4.4 Period control updates Collected, series, and Booked only; week and frames stay live; preference still persists

## 5. Other hubs and config

- [x] 5.1 Wrap Bookings, Clients, Settings, and Website bodies in one rounded work surface; Gallery wall stays the surface (no extra card)
- [x] 5.2 Spot-check night + phone on Dashboard, Bookings, and Gallery
- [x] 5.3 Update `openspec/config.yaml` Design and Product IA: light product language, Figtree titles, Dashboard instrument, appearance on rail / phone strip
