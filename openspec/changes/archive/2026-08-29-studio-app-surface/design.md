## Context

See proposal.md for why. Today `StudioLayout`’s `<main>` is `overflow-auto`, and Gallery’s root uses `min-h-[100vh]` so the flex child grows with every thumbnail. The wall’s inner `overflow-auto` never gets a max height, so the **main pane** scrolls — title, Add card, rooms, and photos all move. `listMedia()` is `getFullList`, so every record (and then every in-DOM thumb) is requested on open.

Public Soft night keeps document scroll. This design only changes Studio.

## Goals / Non-Goals

**Goals:**
- One app-height Studio shell; hub nav never moves with content.
- Gallery chrome (title, Add, rooms, filters) pinned; wall is the scroller and the drop target.
- First page of wall records, then more on wall scroll.

**Non-Goals:**
- Virtual lists, picker pagination, public scroll, schema/seed.

## Decisions

### Main pane does not scroll; hubs fill it

Set Studio `<main>` to a viewport-bounded pane (`overflow-hidden`, hub rooted in an `absolute inset-0` box). The sidebar is `overflow-hidden` and is never a scroller. While `StudioLayout` is mounted, `html`/`body` overflow is locked so the document cannot move the shell. Each hub root is `h-full min-h-0 flex flex-col overflow-hidden`. Hub chrome stays out of the scrolling child; the leftover region is `flex-1 min-h-0 overflow-auto` with `overscroll-contain` so wheel events do not chain to the page. Padded hubs (Settings, Dashboard, Website, Clients) scroll a **full-width** pane; content padding lives inside that pane so the scrollbar sits on the main edge, not beside a centered column.

Alternative: sticky Gallery header inside a still-scrolling main. Rejected — sidebar/main padding still feels like a website, and other hubs would keep the same bug.

Alternative: put the photo grid only in a full-screen modal (older studio-app-shell text). Rejected — Gallery *is* the hub; the wall should be the work surface, not a detour.

### Compact Add; drop on the wall

Replace the header dashed card with **Add photos** on the title row (existing hidden file input). The wall is the drop target, with a short over-state.

Alternative: keep the dashed card and only pin it. Rejected — it is what makes the chrome feel like a landing page.

### PocketBase `getList` pages, not `getFullList` for the wall

Page size ~48. Filter by vault (Gallery vs Portfolio) and optional tag; sort date or name on the server. Append pages until `page >= totalPages`. Room/sort/tag change resets to page 1.

Albums and Work keep their own list APIs (already expanded). The edit sheet loads a record with `getOne` when it is not in the current wall cache.

Alternative: `getFullList` but only render 48 tiles. Rejected — still pulls every record on open.

`listMedia()` remains for Website pickers and other callers this change does not paginate.

## Risks / Trade-offs

[Tag sort is weaker across pages] → Date and name sort on the server; tag **filter** is a server filter. Tag **sort** orders the pages already loaded, which is acceptable because filter is the real need.

[Main `overflow-hidden` clips hubs that still expect document scroll] → Every hub root becomes a fill + inner scroller, including Dashboard, Website, Clients, and Settings.

[Empty first page with unused space] → That matches studio-quiet-panels: no inner scrollbar until content overflows.

## Migration Plan

Front-end only. No PocketBase migration. Rollback is reverting the Studio layout and Gallery fetch.

## Open Questions

None.
