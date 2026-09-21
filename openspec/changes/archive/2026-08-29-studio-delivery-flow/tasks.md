## 1. Hook copy

- [x] 1.1 Backup note: `pb_data` already covers SQLite + `delivery_files`; this change only edits `deploy/pb_hooks/main.pb.js` (restart PocketBase after)
- [x] 1.2 Copy selected media into `delivery_files` on deliveries AfterCreateSuccess; delete the delivery and error if nothing copied
- [x] 1.3 Stop requiring browser fetch+upload in `createDelivery`; fallback copy only when the new record has no files

## 2. Create flow

- [x] 2.1 Deliveries lists first; Add on the Clients toolbar opens a create panel (deep-link person/booking opens it)
- [x] 2.2 Photo pick via `StudioImageGallery`; albums and Work as cover tiles; source as `StudioTabs`; Create disabled until name + selection
- [x] 2.3 Inline create error on the panel; Copy link / Revoke as `StudioTextIconButton`

## 3. Content icons

- [x] 3.1 Inbox folders as `StudioTabs` (not filled pills)
- [x] 3.2 Quiet `StudioIcon` on Dashboard Needs you row types

## 4. Verify

- [x] 4.1 Typecheck; create a Delivery from photos, from an album, and from Work; confirm `/g/:token` shows files; collapse-path: empty selection cannot create

## 5. After create

- [x] 5.1 Scope `/g/:token` file list to that Delivery (do not list every `delivery_files` row for a signed-in Studio session); render thumbs that exist on the copies
- [x] 5.2 Opening a Delivery in Studio shows its photographs and lets the photographer edit name, email, and notes
- [x] 5.3 Verify: selected count matches the guest gallery; details open after create; save name/notes
