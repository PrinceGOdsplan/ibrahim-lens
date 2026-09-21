## 1. Schema and listing

- [x] 1.1 Add `held` to `media.vault` select values; skip `held` in the Portfolio vault migrate; add public view/list for media on `show_on_website` Work (images and cover)
- [x] 1.2 Make `mediaVault()` and Gallery `listMediaPage` use explicit `vault = "gallery"` (held is not Gallery)
- [x] 1.3 Confirm seed still writes gallery/portfolio vaults only; no new `pb_data` backup procedure (ensure-schema is the migrate)

## 2. Upload and last-holder delete

- [x] 2.1 Extend `uploadMedia` so Gallery, Portfolio, album, and Work destinations set the matching vault and attach where needed
- [x] 2.2 On album/Work delete or remove-image, delete a held photo when it has no remaining album or Work holder

## 3. Gallery hub UI

- [x] 3.1 Gallery room: compact Add and wall drop upload to Gallery only; hide that header Add in other rooms
- [x] 3.2 Portfolio room: Add and wall drop upload into the Portfolio pile
- [x] 3.3 Albums and Work: Upload (held) and Pick (Gallery/Portfolio) on the selected record; drop on that pane
- [x] 3.4 StudioImageGallery stays Gallery + Portfolio piles (no Held chip)

## 4. Verify

- [x] 4.1 Run ensure-schema against local PocketBase
- [x] 4.2 `npm run build` and `npm run lint` pass
- [x] 4.3 Check Gallery wall, Portfolio upload, album/Work upload, and that destination files do not appear in Gallery
