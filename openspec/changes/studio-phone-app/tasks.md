## 1. Studio PWA head

- [x] 1.1 Extract a Studio PWA head helper (manifest, apple-touch-icon, apple-mobile-web-app-capable, status-bar `default`, apple-mobile-web-app-title, theme-color `#F7F7F5`, Studio viewport lock) that restores the public viewport and tags on unmount
- [x] 1.2 Mount the helper from `StudioLayout` and `StudioLoginPage`; register `/studio/sw.js` from both, never from public or `/g/`
- [x] 1.3 Confirm no schema or seed change; VAPID stays in env (not `pb_data`); no new PocketBase collections

## 2. Phone shell

- [x] 2.1 Replace the phone hamburger drawer with a six-hub bottom bar (Dashboard, Gallery, Website, Bookings, Clients, Settings): icon + label, min 44px, `safe-area-inset-bottom`
- [x] 2.2 Keep the desktop sidebar; keep header notices and profile; drop the phone drawer
- [x] 2.3 Reduce `StudioHubHeader` (and hub pane) padding on phone so a 390-wide viewport has room for one-line tabs
- [x] 2.4 Studio shell `touch-action: manipulation`; short vibrate on hub change where the platform allows (never block navigation)

## 3. Tabs, fields, and zoom

- [x] 3.1 `StudioTabs`: below `md`, hide icons, no wrap, tighter padding; strip-only horizontal scroll if labels still overflow
- [x] 3.2 Settings phone tab label “Tags” for Portfolio tags; page heading stays “Portfolio tags”
- [x] 3.3 Studio `Input`, login fields, and Gallery search use at least 16px type on touch
- [x] 3.4 While Studio is mounted, viewport is `maximum-scale=1, user-scalable=no`; public and `/g/` stay zoomable

## 4. App shell, splash, icon, shortcuts

- [x] 4.1 Cache Studio static assets and `/studio` navigations in `sw.js`; do not cache `/api/files/` or public pages; bump cache name on strategy change
- [x] 4.2 Add iPhone launch splash images (13 Pro class plus current 14/15/16 sizes) and wire `apple-touch-startup-image` from the Studio PWA head
- [x] 4.3 Manifest: maskable (or any+maskable) icon; shortcuts to Dashboard, Gallery, Bookings

## 5. Mobile notices and badge

- [x] 5.1 Do not use layout `useEffect` as the only iOS permission path; Settings → Allow phone notices remains the tap that calls `subscribeStudioPush`
- [x] 5.2 If `VITE_VAPID_PUBLIC_KEY` is missing, Settings must not imply Mobile works; show that phone notices are not configured
- [x] 5.3 Spike empty-body Web Push on iOS; if Apple drops it, send a payload the worker can show, still using pending fetch when needed
- [x] 5.4 Set/clear `navigator.setAppBadge` from unread in-app notice count; vibrate on new in-app notice where allowed
- [x] 5.5 Caddy: keep `/studio/sw.js` uncached; add `Service-Worker-Allowed` only if scope requires it

## 6. Ops and docs

- [x] 6.1 Generate a VAPID pair with `scripts/vapid-keys.ts`; set `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` on PocketBase and `VITE_VAPID_PUBLIC_KEY` on the production web build (never commit the private key)
- [x] 6.2 README: after deploy, delete the old home-screen icon and Add to Home Screen from a `/studio` page; Mobile needs that standalone icon plus Allow phone notices

## 7. Verify

- [x] 7.1 `npm run build`; public Home has no Studio manifest/worker and still pinch-zooms; `/studio/login` has Studio PWA head and does not pinch-zoom
- [ ] 7.2 After VPS deploy, on iPhone 13 Pro: login does not auto-zoom; pinch does not scale Studio; Gallery rooms one row; bottom bar usable; splash is Studio light; fresh Add to Home Screen reports standalone; badge and one test Mobile notice with Mobile on
