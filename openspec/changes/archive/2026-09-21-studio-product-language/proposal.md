## Why

Studio reads as a paper CMS — stacked white bars, boxed sections, a pulse Dashboard of labels and digits — not as a product the photographer would sit with. The language to steal is Resend’s *light* desk (rail + page + one surface), not its marketing black, and not a skin of mint and Inter.

## What Changes

- Give all of `/studio` one product language on the **light** default: painted rail, breathing page, hub title + tabs + actions, then a single work surface. Night stays the existing Soft-night–related opt-in.
- On desktop, drop the full-width product header. The rail owns hubs plus notices, appearance, and profile. Hub title lives only on the page. Phone keeps a compact notices/profile strip and the bottom hub bar (`studio-phone-app`); it does not regain a hamburger.
- Hub titles use Figtree, not Cormorant. Money and counts stay lining tabular Figtree. No Inter, mint, or Resend chrome clone.
- Dashboard becomes a hybrid instrument: Collected as the period hero with a time series; chips for Booked / Outstanding / non-zero attention; a rolling next-7-days week blotter (first name + time); latest Gallery frames. Period presets are 7d · 30d · All (24h goes away). Large greeting and the six count stacks leave the first glance.
- Website, Gallery, Bookings, Clients, and Settings wear the shell and one-surface recipe. Website stays a CMS. Public Soft night and `/g/` are untouched.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-app-shell`: Desktop chrome is rail + page, not product header + rail + hub bar; page recipe and sans hub titles; light remains default
- `admin-dashboard`: Pulse desk (greeting, 24h, money plane, count stacks, no diary) becomes the hybrid instrument

## Impact

- `StudioLayout`, `StudioHubHeader`, `StudioHubShell` / `StudioScrollPane`, appearance toggle placement
- Every hub page enough to sit in the page recipe and one surface (Dashboard rewritten; others wrap, not replatformed)
- `dashboard.ts` / `bookings.ts` period series from `money_changed`; `listMediaPage` for frames
- Handmade SVG series (no chart library). No new PocketBase collections
- `openspec/config.yaml` Design / IA: Studio light product language; Dashboard is the instrument, not the pulse desk

## Non-goals

- Dark-first Studio, cool graphite, mint, Inter / Abc Favorit, or a pixel clone of Resend
- Public Soft night restyle, Delivery (`/g/`) chrome, or Syne/Sora in Studio
- Boxed Resend inputs (underline quiet fields stay)
- Custom date ranges, Booked+Collected overlay, analytics product, accounting exports
- Restoring Needs-you, Inbox/feedback body, unpaid client roster, or a Dashboard CTA row
- New PocketBase collections, seed, or `pb_data` backup behaviour
- Rewriting Website IA or Gallery vault behaviour
- Chart npm dependency
