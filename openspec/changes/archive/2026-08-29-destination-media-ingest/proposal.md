## Why

Studio treats Gallery as the only real ingest: one Add control in the hub header, and albums/Work tell the photographer to open a photo there and attach it one by one. Portfolio, albums, and Work need their own upload, and those files must not appear on the Gallery wall. Gallery is a destination, not the funnel.

## What Changes

- Gallery wall lists only photos whose vault is Gallery (`vault = gallery`). It no longer treats “not Portfolio” as Gallery.
- Portfolio, Albums, and Work each offer Upload (and still Pick existing Gallery or Portfolio photos onto albums/Work).
- Files uploaded into Portfolio land in the Portfolio pile only — no Gallery original.
- Files uploaded into an album or Work are held: stored and attached there, absent from the Gallery wall. One held photo may belong to more than one album or Work.
- Deleting the last album or Work that holds a held photo also deletes that photo (after the existing confirm).
- Gallery “Send to Portfolio” remains a one-way copy. There is no implied Send to Gallery from held or Portfolio photos.

## Non-goals

- Dashboard upload or Dashboard quick-action ingest (separate work).
- Website slot upload, Delivery create picker, or Settings brand logo.
- Virtual lists, sidebar Add, or a second media hub.
- Changing public Soft night layout, watermarks, or seed demo content beyond vault-aware listing.
- Copying held or Portfolio photos into Gallery.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `library-media`: Gallery is an explicit pile; held membership for destination-native files that must not appear on the Gallery wall.
- `library-portfolio`: Photographers MAY upload files directly into the Portfolio pile.
- `library-albums`: Albums MAY receive files uploaded in that album; those files do not enter Gallery.
- `library-work`: Work MAY receive files uploaded on that project; those files do not enter Gallery.
- `studio-gallery`: Each Gallery room (Gallery, Portfolio, Albums, Work) offers ingest in place instead of one Studio-wide header Add.

## Impact

- PocketBase `media.vault` values: `gallery` | `portfolio` | `held`. Gallery list filter and `mediaVault()` must not collapse held into Gallery.
- `src/lib/library.ts` upload/list/delete helpers; `scripts/ensure-schema.ts` if the vault field needs documenting; Gallery hub `LibraryPage`.
- Public Portfolio and Work still read Portfolio vault and Work `images` ids; held photos on a published Work already appear via those ids.
- Dashboard, Website editors, and Delivery create are unchanged in this change.
