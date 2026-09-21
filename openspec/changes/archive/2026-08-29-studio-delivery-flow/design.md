## Context

See proposal.md for why. Deliveries today is a two-column form: Person / name / email, Button pills for Photos / Albums / Work, then a `max-h-48` checkbox list of every `listMedia()` row (including Held). Create calls `createDelivery`, which inserts the record then `fetch`es each original from PocketBase and POSTs it into `delivery_files`. Any copy failure deletes the record. Errors land on the Clients page Alert, often above the fold the photographer is not looking at. Inbox folders still use filled `Button` pills. Gallery already has `StudioImageGallery` and `StudioIcon` (`strokeWidth` 1.75).

## Goals / Non-Goals

**Goals:**

- One create path that a photographer can finish: who → what (visual) → create, with the error on that panel.
- File copy on the PocketBase hook so local + R2 both work (`$app.newFilesystem()`).
- Content Lucide goes through `StudioIcon`; Inbox and delivery source use `StudioTabs`.

**Non-Goals:**

- Changing `/g/:token`, expiry, revoke rules, or mail.
- New collections.
- Icon-decorating Website “Edit” rows or replacing every Bookings filled CTA.

## Decisions

### Create panel, not an always-on form

Deliveries lists first. Add on the hub toolbar (same as Bookings) opens a create panel in the scroll. Send gallery from a Booking still deep-links `?tab=deliveries&person=&booking=` and opens the panel with those fields filled.

**Alternatives considered:** Full-screen modal for the whole create (heavier than who + pick). Keep the side-by-side form (the current cramped flow).

### Shared gallery for photos; cover tiles for albums and Work

Photos: existing `StudioImageGallery` (Gallery + Portfolio only, Held out). Show a thumb strip of the current pick plus “Pick photos”. Albums: multi-select cover tiles. Work: single-select cover tiles. Source switch is `StudioTabs` with Images / FolderOpen / BookOpen.

**Alternatives considered:** `MultiImagePicker` inline (dumps the whole library into the panel). Checkbox list (rejected). Native `<select multiple>`.

### Copy in `pb_hooks`, not the browser

On `deliveries` AfterCreateSuccess, before mail: read each media file via `$app.newFilesystem().getReader(record.baseFilesPath() + "/" + filename)`, wrap with `$filesystem.fileFromBytes`, save `delivery_files` rows. If zero files copied, delete the delivery and throw so the API errors. Studio `createDelivery` only creates the record (resolve image ids still happens client-side so empty albums fail before insert). Keep a client fallback copy only if the created record has no `delivery_files` after a successful insert (old hook image).

**Alternatives considered:** Keep browser fetch+upload (CORS, size, Held, timeout). Worker proxy (second backend). Mark media `protected` (breaks public Portfolio URLs).

### Content icons: wrap, don’t invent a pack

`StudioIcon` for every Lucide in Studio content this change touches (Deliveries actions, Inbox is tabs not icons-required, Dashboard Needs you type icon optional and quiet). Copy / Revoke / Add use `StudioTextIconButton`. Primary Create stays a filled `Button` with a `StudioIcon` child. Settings boolean checkboxes stay.

**Alternatives considered:** Replace all Bookings `Button`s (out of scope). Custom SVG set.

## Risks / Trade-offs

- **[Risk] Hook copy of many large originals blocks the create request** → Mitigation: copy is still cheaper than browser round-trip; photographer sees busy on Create; no silent success.
- **[Risk] `toBytes(reader)` helper name differs on 0.25.8** → Mitigation: try `toBytes`, then `reader.readAll` if present; fail the create rather than a half gallery.
- **[Risk] Fallback client copy double-writes if the hook is slow** → Mitigation: fallback only when `listDeliveryFiles` for that delivery is empty after create returns.
- **[Risk] Deep-link from Bookings with the panel closed** → Mitigation: `person` or `booking` query opens the panel.

## Migration Plan

Deploy `deploy/pb_hooks/main.pb.js` with Studio. Local Compose already mounts hooks; restart PocketBase after hook edit. No schema migrate. Rollback: revert hook + UI; old client copy path can be restored.

## Open Questions

None. Person remains optional; name-only create stays.
