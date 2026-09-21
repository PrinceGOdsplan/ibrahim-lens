## Context

See proposal.md — Why. Studio already uses side panels + a shared image gallery (`StudioFullscreenModal`, `StudioImageGallery`) and blur-save on most Website fields. Nested overlays each toggle `document.body.style.overflow`, which can leave the page frozen after close. Featured has no CMS max; Works (Work on Home) toggles save immediately without thumbs/drag.

## Goals / Non-Goals

**Goals:**
- Shared accordion + section Save status primitives reused by Website and Library
- Ref-counted or stacked scroll lock on overlays
- Featured grow-to-5 with per-row upload/pick + caption; Works thumbs + on/off + drag selected only
- Quieter Input/textarea classes without Soft night styling

**Non-Goals:**
- New PocketBase collections
- Public Soft night input redesign
- Clients/Dashboard accordion pass

## Decisions

1. **Accordion state** — Local React state per page/surface (`openSection: string | null`). Opening a key sets it; toggling the open key closes. Prefer a tiny `StudioAccordion` / `StudioSection` helper over copying markup.
   - Alternative: uncontrolled details elements — rejected (harder one-open + Save chrome).

2. **Section Save** — Draft local state while editing; Save writes via existing `updateWebsiteGlobals` / media APIs; show status chip. Immediate toggles (e.g. published) may still apply on change but section-level text fields wait for Save.
   - Alternative: keep blur-save + toast — rejected (user asked explicit Save).

3. **Featured upload per slot** — Upload file → existing Library upload helper with Portfolio membership → append id to draft `home_featured` (max 5) → caption via media caption API on Save (or per-row Save if already persisted). Pick uses gallery with `max` remaining slots, Portfolio filter default.
   - Cap enforced in UI + clamp on save.

4. **Works drag** — HTML5 drag-and-drop or pointer reorder only on the selected subset list (or selected rows only). Persist order as `home_work` id array on Save. Unselected website Work listed below/disabled for drag.
   - Alternative: `@dnd-kit` — only if HTML5 feels too rough; prefer zero new deps first.

5. **Scroll lock** — Centralize in `StudioFullscreenModal` (and gallery if separate): increment on mount, decrement on unmount; set `overflow: hidden` only while count > 0; restore previous value when count hits 0. Never restore `''` while another overlay is open.

6. **Quieter inputs** — Soften `Input` / shared textarea classes (`border-studio-border/60`, less padding/height, avoid heavy card buttons). Keep Cormorant/Figtree Studio fonts.

## Risks / Trade-offs

- [Risk] Draft vs live divergence if photographer navigates away without Save → Mitigation: collapse warning optional later; for v1, Save is explicit and obvious.
- [Risk] Upload mid-Featured creates Library media even if section never saved → Mitigation: upload commits media; removing the draft row does not delete Library file (same as pick).
- [Risk] HTML5 drag awkward on touch → Mitigation: up/down reorder buttons as fallback on phone if drag is poor.

## Migration Plan

- Ship frontend-only; existing `home_featured` / `home_work` arrays remain. Clamp Featured to 5 on load if longer.
- No data migration. Rollback = revert UI commit.

## Open Questions

None — product decisions locked in explore.
