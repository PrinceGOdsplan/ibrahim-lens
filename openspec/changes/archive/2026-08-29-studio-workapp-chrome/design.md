## Context

See proposal.md for why. Today `StudioLayout` is a desktop sidebar (brand + hubs + footer bell/email/logout) and a phone-only top bar. Gallery already pins a hub toolbar (title, tabs, Add). Other hubs still put an H1 and an explaining subtitle in `StudioScrollPane`. Dashboard restacks every other hub. Notices drop as `absolute` over the whole main pane.

Studio stays a light tool: `#F7F7F5`, Cormorant/Figtree, lucide at stroke 1.75, 44px hits. Public Soft night is out of scope.

## Goals / Non-Goals

**Goals:**
- One work-app chrome: full-width header, collapsible nav, one title pattern.
- Dashboard is a queue, not a brochure.
- Bookings views join `StudioTabs`.

**Non-Goals:**
- Public restyle, Website IA rewrite, Clients product split, new notice types.

## Decisions

### 1. Full-width header above sidebar + main

```
┌──────────────────────────────────────────────┐
│ [collapse] Studio     [bell] [profile]       │
├────────────┬─────────────────────────────────┤
│ hubs       │ hub toolbar (title, tabs, act)  │
│            │ surface                         │
└────────────┴─────────────────────────────────┘
```

Header left: collapse (desktop) or menu (phone), then the word Studio — not the hub name. Right: notices, profile. Alternative considered: header only on the main pane. Rejected — a work app reads as one frame; the sidebar brand block was a second header.

### 2. Collapse is icons, not hidden

Collapsed width ~3.5rem, icon + `aria-label` / title. Persist `localStorage` key `studio-nav-collapsed`. Phone: drawer unchanged; collapse control hidden. Alternative: fully hide nav. Rejected — a photographer jumping hubs would open the drawer on desktop too.

### 3. Shared `StudioHubHeader`

Props: `title`, optional `tabs` (`StudioTabs`), optional `actions`. Pinned, `border-b`, `bg-studio-panel`, `px-5 py-3` to match Gallery. GalleryToolbar becomes this pattern (keep room-specific rows). Website/Bookings/Clients/Settings/Dashboard wrap with `StudioHubShell`: header shrink-0, body `flex-1 min-h-0 overflow-auto`. Drop hub subtitles.

### 4. Profile is a quiet menu

Initials or display name from auth/settings; menu: Settings, Log out, Add to Home Screen when an install event exists. Email stays in Settings. Alternative: keep Log out as a header button. Rejected — that is website chrome; a work app tucks it.

### 5. Notices dock under the bell

A panel anchored to the header (right), max-width ~20rem, not `inset-x-0` over the hub. Same list/clear behaviour.

### 6. Dashboard surface

Toolbar title Dashboard. Body: optional Today line (next confirmed `preferred_at`, outstanding ₦ from existing `financeSummary` / bookings list), then Needs you rows as the wall. Links: `needs_contact` → Clients inbox or Bookings as today’s routing already does; deliveries → Clients deliveries; unpaid → Bookings unpaid. No pipeline cards, gallery thumbs, activity list, or CTA row.

### 7. Bookings tabs

Replace the Button pill row with `StudioTabs` in `StudioHubHeader`, counts as numerals on the label. Create booking stays an action on the toolbar (Add), form still toggles below or in the body — not a new modal unless it already exists.

## Risks / Trade-offs

[Two titles if phone header still says Gallery] → Header never shows hub name; toolbar does.

[Collapsed sidebar hard to learn] → `title` + `aria-label` on each hub; collapse control labeled Collapse menu / Expand menu.

[Dashboard feels empty when clear] → Same as an empty Gallery wall; that is the product.

[Needs you still points at Clients inbox] → Keep current hrefs; do not rewire booking accept in this change.

## Migration Plan

Front-end only. Rollback is reverting `StudioLayout` and hub headers.

## Open Questions

None — header shape, collapse, title ownership, and Dashboard cut were decided here.
