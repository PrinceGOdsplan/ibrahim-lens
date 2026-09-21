## Context

See proposal.md for motivation. Gallery lives in one large hub page (`LibraryPage.tsx`) with a single `busy` flag, a required `StudioPhotoReview` modal, always-on sort/tag/search/columns, and a photo sheet that lists albums, Work, tags, and delete. lucide-react is already in `package.json` and unused. Destination vault rules from `destination-media-ingest` stay: Gallery add → gallery vault, Portfolio add → portfolio vault, album/Work disk add → held.

Studio remains a light tool app: no document scroll, inner scroller `overscroll-contain`, 44px touch targets.

## Goals / Non-Goals

**Goals:**

- Treat the wall as the live work surface (optimistic tiles, no global freeze).
- One surface per room; Arrange and More hide secondary chrome.
- Copy uses Album, Work, Gallery, and Portfolio — names a non-technical photographer already knows. It SHALL NOT invent nicknames (set, story, pile).
- Use lucide next to those words, including Studio hub nav.
- Form labels name the field; placeholders are short examples of that same answer, not help text or sample marketing copy.

**Non-Goals:**

- Schema or PocketBase rule changes.
- Parallel `media.create` (SQLite lock history).
- Rewriting Website or Clients beyond shared `StudioTabs` / layout icon affordances.

## Decisions

### 1. Ghost tiles + sequential pump, not a global `busy`

Keep a pending queue in the page, render ghost thumbs on the matching room, upload one-at-a-time via an existing chain (same lock avoidance as today). Replace each ghost with the created record (or mark error + retry). `run()` for edits no longer disables the hub; sheet buttons can disable only their own action.

Alternative considered: keep the review modal and only add a spinner. Rejected — that is still a second app before the pile updates.

### 2. Rename strip, not a required modal

`StudioPhotoReview` leaves the add path. If any stem matches camera-style names (`IMG_`, `DSC_`, `PXL_`, `WA_`, etc.), show a skippable strip that edits the pending `File` name before create. Human-named files skip it. After create, Gallery “Name” writes `caption` (already searched); Portfolio field stays the public line, labeled On the website.

### 3. Portfolio mode in the URL

`?room=portfolio&view=order` for On the website (public order). Default `view` is wall. Avoids stacked wall + list.

### 4. Icons: lucide only, label required for primary chrome

Hub nav, room tabs, Add, find, Arrange, More, hover On the website. Icon-only is allowed for Up/Down/overflow where the aria-label carries the word. No second pack. Stroke ~1.75, 16px in chrome, 44px hit target.

### 5. Extract Gallery views from the hub page

Split wall, sheet, albums, Work, order list, and toolbar out of `LibraryPage.tsx` so the page orchestrates queue + rooms. Behavior stays in one hub route.

## Risks / Trade-offs

- [Ghosts that never resolve] → Error state on the tile with retry; revoke object URLs on success/discard.
- [Rename after upload started] → Strip only affects queued items; uploading item keeps the name captured at create.
- [Hover unavailable on phone] → Tap opens the sheet; On the website remains there.
- [Filter hidden and forgotten] → Arrange button shows a mark when sort/tag/cols differ from defaults.

## Migration Plan

Frontend-only. Reload Studio. No seed or schema step. Rollback is revert of the change.

## Open Questions

None. Destination vault rules and sequential create are already decided in prior changes.
