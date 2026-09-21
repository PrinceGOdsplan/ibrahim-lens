## Why

Miss-me-only photographer mail hid notices behind Studio idle detection, so Ibrahim could not choose what reaches email versus the app. Clients with an address on file also need a small gallery sequence (ready, first download, expiry if they never took files) without inventing a second inbox.

## What Changes

- Replace the photographer idle-mail gate with a Settings → Notifications matrix: each event can be Email and/or In-app; Mobile is a third column that is enabled only after Studio is on the home screen.
- Photographer email defaults on for inbound work (new booking, client feedback). Email for his own Studio actions (upload, add to Portfolio) starts off; he must opt in. In-app and mobile for those rows are his to select.
- Client mail (gallery ready, one first-download note, one expiry reminder if they have not downloaded) sends only when the Delivery has an address snapshotted at create — typed on the form or copied from the selected Person. No address means no client mail; the gallery still works.
- Studio becomes installable as a PWA scoped to `/studio` (Add to Home Screen). The public site and `/g/` galleries are not installable. Web Push uses that install; the Mobile column stays visible but disabled until then.
- Action receipts (save/upload/revoke success or failure) stay on the control as in-place text that fades; they are not email, not a global toast stack, and not Settings rows.
- **BREAKING:** photographer mail no longer waits for Studio to be idle. If an Email row is on, it sends.

## Capabilities

### New Capabilities

- `studio-pwa`: Studio-only home-screen install, standalone shell, and Web Push permission so Mobile notices can reach the phone.

### Modified Capabilities

- `studio-notifications`: Preference matrix; drop idle gating for email; inbound defaults; opt-in email for photographer self-actions; in-app notices; client gallery mail rows; SMTP still optional and never fails a write.
- `admin-settings`: Notifications tab is the matrix (plus notify address and client-mail rows), not two master toggles.
- `client-deliveries`: Snapshot client email at create from the form or selected Person; record first download; client mail uses that snapshot only.
- `client-gallery`: First download and near-expiry are client-visible events that may trigger mail when an address is on file.
- `client-inbox`: Inbox remains the photographer record; in-app notices point into it rather than a second list.
- `ux-state-integrity`: Success and failure on a write surface as in-place fading copy on that surface, not a global notification tray.

## Impact

- PocketBase: `notification_settings` preference fields, Delivery email snapshot + first-download, `push_subscriptions`, `pb_hooks` mail/push/expiry cron, schema/seed, `pb_data` backup docs.
- Studio: Settings matrix, Create Delivery email field and Person email copy, heartbeat no longer gates mail, in-app notice chrome, PWA manifest/service worker scoped to `/studio`.
- Public Delivery page: first-download logging that is safe to mail once.
- Env: `SITE_URL` (existing), VAPID keys for Web Push. No new SaaS mail/push backend; PocketBase SMTP remains the mail path.
- `openspec/config.yaml` context line that currently says miss-me-only photographer mail.

## Non-goals

- Native iOS/Android apps, Capacitor, Firebase Cloud Messaging as a core dependency, SMS, or WhatsApp as a notice channel.
- Installing the public Soft night site or `/g/` galleries as an app.
- Per-image download emails, digest/summary mail, or emailing “you just clicked Save.”
- Public contact-form intake (bookings remain the public channel).
- Changing 7-day Delivery expiry, share passwords, 2FA, or replacing PocketBase.
- A global toast stack or a second photographer inbox besides Clients → Inbox.
