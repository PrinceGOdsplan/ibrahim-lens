## Why

Delivery gallery preview and downloads fail when files live on object storage (R2) because the guest delivery-file route only serves local disk. Photographer notices for booking and Write are skipped whenever a Studio auth cookie is on the request, and in-app notices stay buried in the bell while Studio is open. Studio CRM/CMS hubs still pull unbounded `getFullList` loads.

## What Changes

- Serve Delivery gallery originals and thumbs through PocketBase’s filesystem abstraction (local or R2), with a media-record fallback when a delivery copy is missing from storage
- Stamp download + support individual and bulk client downloads on that path
- Always fire photographer notice channels for public booking requests and Write messages even if Studio auth is present on the request
- Surface new in-app notices as a visible toast while Studio is open (bell list remains)
- Replace unbounded Studio list loads with batched/paginated fetches and Load more on CRM hubs

## Capabilities

### New Capabilities

- `studio-list-pagination`: Batched/paginated loading for Studio Bookings, Clients, Website, Dashboard, and Library secondary lists

### Modified Capabilities

- `client-gallery`: Tokenized delivery-file route must serve preview and download bytes from configured storage
- `studio-notifications`: Public inbound events notify regardless of Studio cookie; in-app notices visible while Studio is open

## Impact

- `deploy/pb_hooks/main.pb.js` delivery-file route and booking/Write after-create hooks
- `src/lib/studio-notices.ts`, `StudioLayout` toast chrome
- `src/lib/{bookings,clients,website,library,dashboard}.ts` and Clients/Bookings pages for pagination
- Delivery page behavior unchanged aside from working image URLs

## Non-goals

- Changing Delivery expiry, share passwords, or watermark rules
- Requiring Mobile push for notices while Studio is focused (in-app toast covers that)
- Reworking Library media wall infinite scroll (already paginated)
