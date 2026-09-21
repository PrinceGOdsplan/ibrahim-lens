## Why

Studio text fields speak two languages: underline `Input` / quiet Website textareas versus boxed Bookings/Clients/Work/phone controls. Night mode makes the boxed family disappear into the desk (`bg-studio-bg`). The photographer needs one quiet Studio field language that stays readable and easy on both light and night.

## What Changes

- Treat underline transparent fields as the Studio default for text and multiline (shared `Input` + a matching `Textarea`).
- Add a shared form `Select` (and a compact toolbar variant) so Bookings, Clients, Gallery arrange, and booking questions stop inventing three select skins.
- Align `PhoneNgInput` studio tone with neighboring fields (one control, not boxed next to underline).
- Boxed leftovers (selects, phone chrome) fill with **panel**, never page `bg`, so they lift on night.
- One label voice (quiet muted) and one visible focus ring on text/select/textarea.
- Money fields show a persistent ₦ prefix and use numeric `inputMode`. Gallery/Clients search share `Input type="search"`.
- Fix night-unreadable save status (`text-emerald-800`) and enlarge checkbox hit targets on Settings notice rows.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-quiet-panels`: One Studio field chrome (underline text; panel-filled selects) on light and night; quiet labels; shared focus
- `studio-app-shell`: Search, money, phone, and checkbox controls stay consistent and usable on phone (44px hits)
- `ux-accessibility`: Studio text/select/textarea focus is visible on both appearances; save status uses contrast-safe colour

## Impact

- New: `src/components/ui/textarea.tsx`, `src/components/ui/select.tsx` (or equivalent shared class exports)
- `input.tsx`, `label.tsx`, `PhoneNgInput.tsx`, `StudioSection.tsx` (`quietTextareaClass`)
- Bookings, Clients, WorkView, GalleryToolbar, ImageSheet, Settings, Website tabs that still hand-roll fields
- No PocketBase, public Soft night visitor forms, or Delivery (`/g/`) field restyle

## Non-goals

- Soft night public input chrome or Syne/Sora in Studio
- A third “night-only” field look
- Rewriting booking IA, notice matrix product rules, or adding a Settings Appearance panel
- Custom date-picker widget (native `datetime-local` stays)
