## 1. Spec lock-in

- [x] 1.1 Update `openspec/config.yaml`: outbound mail is optional via PocketBase SMTP; photographer mail is miss-me only (idle + new inbound); no public watermarks; quiet Delivery view mark allowed; no share password; no 2FA
- [x] 1.2 Note in README that `pb_data` backups include SQLite plus `delivery_files` copies, and that hooks live in `deploy/pb_hooks` (or repo `pb_hooks`) mounted into PocketBase

## 2. Schema and seed

- [x] 2.1 Add `delivery_files` in `scripts/ensure-schema.ts`: relation to deliveries, optional media id, file field; list/view only with a live Delivery token or Studio auth; create/update/delete Studio-only
- [x] 2.2 Add notification singleton fields (notify address, photographer away-notice toggle, client gallery-ready toggle, last send error) and a photographer `last_seen_at` used only for idle detection
- [x] 2.3 Extend the seed script so a fresh seed still logs in, still has no required SMTP, and creates the notification singleton with photographer away-notices on and client gallery mail on
- [x] 2.4 Run seed locally and confirm Studio opens without mail configured

## 3. Booking abuse

- [x] 3.1 Add a visually hidden trap field to the public booking form and include it in the submit payload without storing it on Person or Booking
- [x] 3.2 Add a PocketBase hook that rejects unauthenticated Person and Booking creates when the trap is non-empty, before any upsert
- [x] 3.3 In the same hook, reject unauthenticated Booking creates when more than about 8 public bookings were created in the last 10 minutes
- [x] 3.4 Confirm a normal visible-field submit still creates one Person and one `needs_contact` Booking, and that a trapped or flooded submit creates neither

## 4. Delivery file copies

- [x] 4.1 On Delivery create, copy selected originals into `delivery_files`; fail the create if copies cannot be written
- [x] 4.2 Point `/g/:token` image sources and download at `delivery_files` URLs, not Library `media` URLs
- [x] 4.3 On revoke, delete that Delivery’s `delivery_files` rows so prior file URLs 404; leave Library originals in place
- [x] 4.4 Add a daily hook that deletes `delivery_files` for expired Deliveries
- [x] 4.5 Mount `pb_hooks` in `deploy/docker-compose.yml` (and local Compose if separate) so hooks run in the PocketBase container

## 5. Quiet Delivery view mark

- [x] 5.1 Add a corner wordmark overlay on Delivery gallery tiles and the immersive viewer (small, low opacity, brass, not a diagonal stamp)
- [x] 5.2 Keep download as the unmarked original; confirm Home, Portfolio, Work, and About have no overlay

## 6. Notifications

- [x] 6.1 Replace the Settings → Notifications placeholder with notify address, photographer away-notice toggle, client gallery-ready toggle, and a send-test control that does not change Bookings or Deliveries
- [x] 6.2 Heartbeat: while any `/studio` route is open, update photographer `last_seen_at` about every two minutes; treat last seen within 15 minutes as active
- [x] 6.3 Hook: after a successful public Booking create, send one photographer mail only if SMTP and away-notices are on and he is not active; never fail the Booking write if mail fails — record last error in Settings
- [x] 6.4 Hook: after client Delivery feedback, send one photographer mail under the same idle rule
- [x] 6.5 Hook: after Delivery create, send one **client** mail with the `/g/:token` link when SMTP, the gallery toggle, and a client email are present — not gated on Studio activity; no photographer mail for that create
- [x] 6.6 Confirm Studio Bookings, Deliveries, and Inbox still work with SMTP unset, and that a booking while a Studio tab is open does not email him

## 7. SEO and health

- [x] 7.1 Add `Disallow: /_/` to the generated `robots.txt` (keep `/g/` and `/studio/`)
- [x] 7.2 Emit Photographer/PhotographBusiness JSON-LD on Home from published Website fields; omit empty properties; do not invent reviews
- [x] 7.3 Document operator steps: PocketBase SMTP, uptime GET `https://ibrahimlens.com.ng/api/health`, Google Search Console add property — in README next to backup notes
- [x] 7.4 Confirm `/api/health` returns through Caddy with `no-store` and without a Studio session

## 8. Verify

- [x] 8.1 Production build passes
- [x] 8.2 Walk booking trap, booking happy path (away vs in-Studio mail), new Delivery view+download+revoke file 404, client gallery mail, Settings toggles, and Home view-source for JSON-LD and robots
