## Why

Create delivery is unreliable because Studio copies every original in the browser after the record lands, and the form is a cramped checkbox list of filenames. Content actions also mix filled pills, native checkboxes, and Gallery’s line icons, so the work-app chrome stops at the hub header.

## What Changes

- Rebuild Clients → Deliveries as a work-app flow: list first, Add opens a focused create panel (who, then what), not an always-on form beside the list.
- Pick photos in `StudioImageGallery` (tap thumbs, Done). Pick albums and Work as cover tiles. No checkbox filename lists.
- Copy delivery files on the PocketBase hook after create so the photographer is not downloading and re-uploading originals. If copy fails, the Delivery is not left half-made.
- Use `StudioIcon` (same stroke and size) for every Lucide mark in Studio **content**, not only the app header and hub tabs. Inbox folders and delivery sources use `StudioTabs`, not filled Button pills.
- Show create errors next to the panel, not only at the top of Clients.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `client-deliveries`: Create flow is a visual pick (photos / albums / Work) plus a reliable file copy; checkbox lists are not the picker.
- `studio-app-shell`: Lucide in Studio hub **content** uses the same icon treatment as Gallery (`StudioIcon`); content section switches use `StudioTabs` rather than a third pill style.

## Impact

- `src/pages/studio/ClientsPage.tsx` (Deliveries + Inbox folders)
- `src/lib/clients.ts` (`createDelivery` copy path)
- `deploy/pb_hooks/main.pb.js` (copy originals into `delivery_files` on create)
- `src/components/studio/StudioImageGallery.tsx` (reused, not a second picker)
- Content actions in Clients (and Inbox) for icon/tab consistency; Dashboard Needs you rows may take a quiet type icon
- No PocketBase collection rewrite, no public Soft night restyle, no Delivery guest page change

## Non-goals

- Public site restyle, brass, or Syne in Studio
- Changing Delivery expiry, revoke, or guest `/g/:token` behaviour
- Requiring Person (name-only create stays as fallback)
- Rewriting Website editors or Bookings finance actions
- A second icon pack or replacing boolean settings (Published / On the website) with a custom switch kit
