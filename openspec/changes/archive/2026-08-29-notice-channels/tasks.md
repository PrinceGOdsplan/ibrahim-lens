## 1. Config and backup notes

- [x] 1.1 Update `openspec/config.yaml` email context: optional SMTP; photographer mail follows Settings (inbound on by default; self-actions opt-in); client gallery-ready, first-download, and expiry-if-not-downloaded when an address was snapshotted; Studio PWA + Web Push; no idle gate
- [x] 1.2 Confirm README `pb_data` backup still covers SQLite + `delivery_files`; add a one-line note that `push_subscriptions` live in that DB and VAPID private keys live in env (not in `pb_data`)
- [x] 1.3 Add `VITE_VAPID_PUBLIC_KEY` / `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` placeholders to env examples (`deploy/.env.example` and local as needed), never commit real private keys

## 2. Schema and seed

- [x] 2.1 Backup guidance: operator backs up `pb_data` before running schema against any install with real content
- [x] 2.2 Extend `notification_settings` with JSON `channels` and booleans `client_downloaded`, `client_expiring`; keep `notify_email` and `client_gallery`; migrate existing singleton (`photographer_away` false → booking/feedback email off)
- [x] 2.3 Add `deliveries.downloaded_at` and `deliveries.expiry_mail_sent_at` (apply to existing collection, not only new installs)
- [x] 2.4 Add AUTHED `push_subscriptions` collection (endpoint, keys, device_secret, pending JSON, user relation)
- [x] 2.5 Seed defaults: booking/feedback email+inApp on, mobile off; upload/portfolio all off; client gallery, downloaded, and expiring mails on; `notify_email` from `SEED_EMAIL`

## 3. Delivery address snapshot and first download

- [x] 3.1 Create Delivery form: optional email field; if empty and a Person is selected, snapshot that Person’s email at save
- [x] 3.2 `createDelivery` writes `client_email` from that snapshot (typed wins)
- [x] 3.3 On first Inbox `delivery_event` download (or equivalent), set `downloaded_at` once; viewing `/g/:token` does not

## 4. Notice router hooks

- [x] 4.1 Remove idle/`last_seen_at` gating from photographer mail; send when SMTP + notify address + `channels[event].email`
- [x] 4.2 Public booking and client feedback: photographer email/in-app/mobile per prefs; writes still succeed if send fails
- [x] 4.3 Library upload and add-to-Portfolio: emit photographer notices only for channels that are on; batch one notice per action, not per file in a multi-select write
- [x] 4.4 Client gallery-ready mail uses snapshotted `client_email` and `client_gallery` pref
- [x] 4.5 Client first-download mail once per Delivery when `client_downloaded` is on and email is snapshotted
- [x] 4.6 Hourly cron: one expiry mail ~24h before `expires_at` if not downloaded, not revoked, email present, `client_expiring` on; set `expiry_mail_sent_at`
- [x] 4.7 Keep test-mail endpoint; Settings last_send_error still records SMTP/push failures

## 5. Settings matrix and action receipts

- [x] 5.1 Settings → Notifications: notify address; photographer matrix Email / In-app / Mobile; client mail rows; Mobile column visible and disabled unless this browser is installed Studio (`standalone` / iOS standalone)
- [x] 5.2 In-place fading success/failure helper on Studio write surfaces (not a global tray, not email)

## 6. In-app Studio notices

- [x] 6.1 Studio chrome unread badge + short list that deep-links to Inbox or Gallery; PocketBase realtime while `/studio` is open
- [x] 6.2 Do not create a second inbox collection; skip Inbox noise when all three channels for a self-action are off

## 7. Studio PWA

- [x] 7.1 Manifest scoped to `/studio` (start_url `/studio`, display standalone, Studio theme); 192/512 icons
- [x] 7.2 Service worker at `/studio/sw.js`; register only from Studio layout; never on public or `/g/` routes
- [x] 7.3 Studio install affordance and iOS Add to Home Screen copy

## 8. Web Push

- [x] 8.1 `scripts/vapid-keys.ts` generates a VAPID pair to stdout for env; public key available to the Studio client
- [x] 8.2 Installed Studio subscribes (PushManager), stores `push_subscriptions` with device_secret
- [x] 8.3 Hooks write pending payload and send empty VAPID Web Push; SW fetches pending via `device_secret` and shows the notice; `/api/ibrahim/push-pending` route
- [x] 8.4 No push when Mobile is off or no subscription exists

## 9. Verify

- [x] 9.1 Recreate or remount PocketBase so hooks load; run schema/seed against local; `npm run build`
- [x] 9.2 Smoke: Create Delivery with Person email and with typed email; download once; Settings matrix save; confirm public routes do not register the Studio worker
