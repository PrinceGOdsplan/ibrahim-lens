## Why

Studio Gallery currently feels like stacked teaching chrome and extra steps (required review, a second CMS in the photo sheet, one busy lock) rather than a live photo pile. Ibrahim uses this hub as the everyday work surface; it should move like other tool apps — files land immediately, extra controls appear when pointed at, and copy names the idea (the pile, the website, a set, a story) only at the step it is needed.

## What Changes

- Gallery, Portfolio, Albums, and Work stay as rooms; each room shows one surface (Portfolio wall vs public order as a mode, not both stacked).
- Add and drop land on the wall as ghost tiles and upload in the background. The hub stays usable (no page-wide busy freeze). Sequential create is preserved to avoid PocketBase/SQLite lock contention.
- Review is optional: a skippable rename strip appears only when camera-style filenames need a human name. Size and type limits are stated when a file is rejected, not as always-on header copy.
- The photo sheet is preview + name + On the website (Add to Portfolio). Albums, Work, tags, and delete sit behind More. Pointer devices get hover actions on thumbs.
- Sort, tag, and columns hide behind Arrange until opened. Search stays in the toolbar as a find field.
- lucide-react (already a dependency) is used thinly: Studio hub nav, Gallery room tabs, toolbar, hover/overflow. Labels stay next to icons so a non-technical photographer can read the idea, not a glyph dictionary.
- Teaching subtitles and empty-state recipes are removed. Empty rooms and errors speak in product names (the pile, on the website, a set, a story).

## Non-goals

- No second icon pack; no icon beside every sentence.
- No change to vault destination rules (Gallery add stays Gallery; Portfolio add stays Portfolio; album/Work disk add stays held).
- No bulk wall selection, no public-site restyle, no Website/Clients IA rewrite.
- No parallel media creates (still one-at-a-time).

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-gallery`: live wall, optional rename, one surface per room, quiet photo sheet, Arrange disclosure, idea-named copy only when needed, lucide in Gallery chrome.
- `studio-app-shell`: Studio hub navigation pairs a lucide icon with the hub name (Dashboard, Gallery, Website, Clients, Settings).
- `library-media`: upload no longer requires a review step before storage; file limits are communicated on rejection.

## Impact

- `src/pages/studio/LibraryPage.tsx` and extracted Gallery components; `StudioLayout` hub nav; `StudioTabs` optional icons; `StudioPhotoReview` removed from the add path.
- lucide-react (existing dependency) first used in Studio.
- PocketBase media API unchanged aside from existing sequential `uploadMedia`.
