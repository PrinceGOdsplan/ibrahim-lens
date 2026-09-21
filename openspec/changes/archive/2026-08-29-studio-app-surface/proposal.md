## Why

Studio is specified as a light tool app, but Gallery currently behaves like a long public page: a large Add-photos block lives in the hub header, every thumbnail is requested as soon as the room opens, and scrolling the wall also moves the Studio chrome. The public site should keep document scroll; Studio should not.

## What Changes

- Studio’s shell (hub nav, and on Gallery the title / Add / rooms / filters) stays still. The sidebar never scrolls. Only the work surface inside the remaining height scrolls. The document behind Studio does not scroll.
- Gallery Add is a compact control in that pinned chrome. Dropping files targets the wall, not a second upload card in the header.
- Gallery and Portfolio walls load a first page of thumbnails and fetch more as the photographer scrolls the wall — not the entire pile up front.
- Other Studio hubs fill the same shell so Dashboard, Website, Clients, and Settings also scroll inside the pane rather than moving the app.

## Non-goals

- Changing public Soft night scroll, Home film header, or delivery galleries.
- Virtualizing thousands of DOM nodes (windowed pages are enough).
- A social-feed style Gallery (no captions under tiles, no infinite “story” chrome).
- Paginating the Website image picker in this change.
- Schema or seed changes.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-app-shell`: Studio is an app surface — the shell stays put; hub content scrolls in the leftover height.
- `studio-gallery`: Compact Add in pinned chrome; wall is the drop target; walls page in as the wall scrolls.
- `library-media`: Drop the “no infinite scroll” constraint for the Gallery wall; first page then more on scroll.
- `studio-quiet-panels`: Inner scroll uses the height left under pinned hub chrome, not a short fixed box with empty space below.

## Impact

- `StudioLayout` main pane, Gallery hub (`LibraryPage`), and the other Studio hub roots so they still scroll when the shell stops.
- `listMedia` paging in `src/lib/library.ts` for the Gallery/Portfolio walls.
- Public site and PocketBase collections unchanged.
