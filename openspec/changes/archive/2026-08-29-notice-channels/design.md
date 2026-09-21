## Context

See `proposal.md` for why. Today `notification_settings` is two booleans plus a notify address; `deploy/pb_hooks/main.pb.js` emails the photographer only when `last_seen_at` is older than 15 minutes. Create Delivery never writes `client_email` (the field exists; the form does not). Downloads append Inbox `delivery_event` rows per file and do not mark the Delivery. There is no PWA. PocketBase SMTP and `SITE_URL` stay the mail path. Stack stays PocketBase 0.25 + Compose; no mail/push SaaS as a backend.

## Goals / Non-Goals

**Goals:**

- One notice router in hooks: event → Settings prefs → email and/or in-app record and/or Web Push.
- Client address snapshotted at Delivery create; first download and 24h-before-expiry client mail as specified.
- Studio-only install + Web Push; Mobile column enabled only in that installed context.
- In-place fading action receipts on write surfaces.

**Non-Goals:**

- Design-level: do not add a Compose sidecar, native wrapper, or FCM project. Do not stamp public pages as installable. Do not keep idle-gating as a mail feature (heartbeat may remain unused for mail).

## Decisions

### Preferences live on the existing singleton, not a new product table

Keep `notification_settings` key `notifications`. Replace the two master toggles with a JSON `channels` object plus client booleans:

- Photographer rows: `booking`, `feedback`, `upload`, `portfolio` — each `{ email, inApp, mobile }`.
- Client rows: `client_gallery` (existing), `client_downloaded`, `client_expiring`.

Seed: booking/feedback email+inApp on, mobile off; upload/portfolio all off; all three client mails on. Migrate `photographer_away === false` to booking/feedback `email: false`; keep `client_gallery` as-is.

**Alternatives considered:** One PocketBase field per checkbox (noisy schema). A second `notice_events` collection (overkill for one photographer).

### Mail is preference-only; idle detection no longer gates it

Hooks send photographer email when SMTP is on, a notify address exists, and `channels[event].email` is true — even if Studio is open. Drop `photographerIsActive` from the mail path. Leave `last_seen_at` heartbeat in place unused for mail so we do not churn auth fields; it is not a requirement.

**Alternatives considered:** Keep idle as an extra “quiet hours” toggle (not asked). Delay-send unread after 15 minutes (double-send risk).

### Client address is a snapshot on the Delivery

Create Delivery UI gains an optional email field. Resolution: trimmed form value if present, else selected Person’s `email` at save time, else empty. Store on `deliveries.client_email` (already exists). Person later changing email does not rewrite old Deliveries.

**Alternatives considered:** Live-read Person on every send (retargets old galleries). Require email (blocks galleries that are link-only).

### First download is a flag on the Delivery, not per-file mail

Keep per-file Inbox activity. On the first `delivery_event` download (or equivalent token-authenticated record), if `downloaded_at` is empty, set it and send at most one client downloaded mail. Viewing `/g/:token` does not set the flag.

Add `downloaded_at` (date) and `expiry_mail_sent_at` (date) on `deliveries`.

**Alternatives considered:** Count files (user asked “if they download,” not “if they took every file”). Email every click (flood).

### Expiry client mail is a hook cron, 24 hours before `expires_at`

Hourly cron: live, not revoked, `client_email` set, `downloaded_at` empty, `expiry_mail_sent_at` empty, `expires_at` within about 23–25 hours from now, client_expiring pref on, SMTP on → one mail with `/g/:token`, then set `expiry_mail_sent_at`. Reuse the existing prune cron’s style; do not change 7-day expiry.

**Alternatives considered:** Morning of day 7 (late). Same 03:20 prune job only (too coarse; could miss the window).

### In-app notices are a Studio chrome badge + short list, sourced from Inbox (and Library events)

Subscribe (PocketBase realtime) to `form_inquiries` and to `media` creates / Portfolio membership writes while any `/studio` route is open. Unread badge on the shell; items deep-link to Clients or Gallery. No second collection. Self-action rows (`upload`, `portfolio`) emit an Inbox-style activity item or a lightweight `form_inquiries` kind only if inApp or email or mobile is on — do not spam Inbox if all three are off.

**Alternatives considered:** Global toast stack (rejected in `ux-state-integrity`). Polling only (stale on an open tablet).

### Action receipts: local fade helper, not a notice row

A small Studio helper shows success/error text beside the control that wrote, then clears it. Existing hub `run()` messages should use it. Never SMTP, never push.

### PWA is Studio-scoped; public SW must not register

`manifest.webmanifest` + icons: `start_url` `/studio`, `scope` `/studio/`, `display` `standalone`, theme Studio light (`#F7F7F5`). Register the service worker only from Studio layout. Public routes and `/g/` stay a website. Caddy must serve the worker with a scope under `/studio/` (file lives at `/studio/sw.js` so default scope is correct).

Install affordance in Studio (Install / “Add to Home Screen”) plus iOS copy (Share → Add to Home Screen). Detect install with `display-mode: standalone` and iOS `navigator.standalone`. Settings Mobile column enabled only when that is true on **this** browser.

**Alternatives considered:** Site-wide PWA (rejected). `vite-plugin-pwa` auto-register on every route (would install the marketing site). Native wrappers.

### Web Push: VAPID in env, subscriptions collection, empty-body ping + pending payload

`push_subscriptions`: photographer user, endpoint, p256dh, auth, `device_secret`, `pending` JSON. Studio PWA calls `PushManager.subscribe` with `VAPID_PUBLIC_KEY` (also injected as `VITE_VAPID_PUBLIC_KEY` for the client).

JSVM cannot use npm `web-push`. Send an **empty** Web Push (VAPID auth, no encrypted body) from `pb_hooks` via `$http.send` to the subscription endpoint; write `{ title, body, url }` onto `pending` first. The SW `push` handler fetches `/api/ibrahim/push-pending` with `device_secret` and `showNotification`. VAPID keys generated once with a Node script (`scripts/vapid-keys.ts`) using runtime `crypto`; private key only in PocketBase/Caddy env, never in `dist/`.

If ES256 JWT signing cannot run inside JSVM, vendor a minimal pure-JS signer in `pb_hooks` (one photographer, rare sends). Do not add a push sidecar container.

Push is sent when `channels[event].mobile` is on **and** at least one subscription exists. Do not use laptop `last_seen_at` to suppress phone push.

**Alternatives considered:** Encrypted RFC 8291 payloads in JSVM (heavy). FCM as core (non-goal). Foreground-only `Notification` API (silent when the PWA is closed; fails the spec).

### Photographer notify still uses Settings address; client mail uses Delivery snapshot only

Unchanged from current mailer helpers: SMTP from PocketBase Admin, `SITE_URL` for links, failures recorded on `last_send_error`, writes never fail because mail/push failed.

## Risks / Trade-offs

- **[Risk] iOS Web Push only after Add to Home Screen** → Mitigation: Mobile column disabled with that instruction; install copy in Studio.
- **[Risk] Empty-body push + pending fetch races or a killed SW** → Mitigation: pending stays on the row until fetched or replaced; email still delivers if Email is on.
- **[Risk] JSVM VAPID signer is fragile** → Mitigation: isolate in one hook module; test send from Settings; if send fails, surface `last_send_error` like SMTP.
- **[Risk] Upload/Portfolio email opt-in still floods if he turns Email on** → Mitigation: one mail per successful upload or per add-to-Portfolio action, not per thumbnail in a multi-select if we batch that action as one write.
- **[Risk] Existing Deliveries have empty `client_email`** → Mitigation: no backfill; only new creates snapshot. Old galleries keep working without client mail.
- **[Risk] Cloudflare or Caddy caching `/studio/sw.js`** → Mitigation: `no-store` or short cache on the worker file.

## Migration Plan

1. Backup `pb_data` (SQLite + `delivery_files`) before schema.
2. `ensure-schema` + seed migrate prefs; add Delivery dates and `push_subscriptions`.
3. Deploy `pb_hooks`, env (`SITE_URL`, VAPID pair), new `dist/` with manifest/SW.
4. Recreate PocketBase container so hooks mount; set SMTP if not already.
5. Rollback: previous `dist/` + previous hooks; new fields can sit unused. Idle-mail behavior will not return unless hooks are rolled back.

## Open Questions

None that change specs. VAPID signer details stay an implementation spike inside the hook module.
