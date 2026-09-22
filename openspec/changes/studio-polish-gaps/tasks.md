## 1. Standalone shell + tabs

- [x] 1.1 Idle standalone viewport: offsetTop/height follow visualViewport only while a field is focused; otherwise top 0 and `window.innerHeight`
- [x] 1.2 Phone `StudioTabs` that are not the 4-column Gallery grid: wrap + `overscroll-behavior: none` (no horizontal rubber-band strip)

## 2. Delivery share preview + feedback

- [x] 2.1 PocketBase `GET /api/ibrahim/delivery-og/{token}` returns OG HTML with absolute image from first delivery file when live
- [x] 2.2 Caddy: social-crawler User-Agents on `/g/*` rewrite to the delivery-og route
- [x] 2.3 `delivery_feedback` after-create: notify + inbox when request has guest token, even if Studio auth is present

## 3. Mobile tray push

- [x] 3.1 After Allow / Save with Mobile, always deliver device_secret to the active service worker
- [x] 3.2 Ensure push handler always `showNotification`s; record push send failures on notice settings health like mail errors

## 4. Brand favicon

- [x] 4.1 Add `favicon` file field on `brand_settings`; Settings → Brand upload beside logo
- [x] 4.2 Public document icon uses brand favicon when set, else `/favicon.svg`

## 5. Verify

- [x] 5.1 `npm run lint` / typecheck clean for touched files
- [ ] 5.2 Manual notes: standalone Settings/Clients tabs; curl bot UA on `/g/token`; feedback with Studio cookie; Allow phone notices + test push; favicon upload
