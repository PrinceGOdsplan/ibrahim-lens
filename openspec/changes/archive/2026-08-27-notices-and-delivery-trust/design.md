## Context

See `proposal.md` for why. Live origin is PocketBase behind Caddy and Cloudflare, with Library `media` files served at `/api/files/…`. Collection rules already hide unpublished media from list/view, but file fields are not `protected`, so a copied JPEG URL outlives the `/g/:token` page. Public booking `createRule` is empty. Settings → Notifications is a placeholder. PocketBase already exposes `/api/health`. Mail was deferred so Resend would not become the backend; this change uses PocketBase’s own mailer (SMTP) from hooks.

The config rule “no watermarks v1” is superseded here for **Delivery view only**. Public Soft night stays unmarked. Update `openspec/config.yaml` in the same change.

## Goals / Non-Goals

**Goals:**

- Booking create that a bored script cannot flood, without a CAPTCHA as the default visitor path.
- Outbound mail as a miss-me channel: photographer mail only for new inbound work while Studio is idle; client gallery-ready mail; skippable if unset.
- Delivery image bytes that die with revoke/expiry, without a share password.
- A quiet CSS wordmark on Delivery view, originals unmarked on download and on the public site.
- Crawlers kept off `/_/`; Home JSON-LD from published fields; an operator ping target.

**Non-Goals:**

- PocketBase `protected` file tokens for guests (auth-only in this PB version).
- Baking a watermark into stored pixels or generating a second raster per photo.
- CI pipeline, 2FA, per-route OG prerender, in-app APM.
- Storing visitor IPs on Booking records.
- Photographer expiry mail, or emailing him about actions he just took in Studio.

## Decisions

### Booking abuse: honeypot plus global create rate, not Turnstile by default

The public form adds a hidden trap field (not `display:none` alone — off-canvas / `autocomplete="off"` labelled to attract bots). A PocketBase hook rejects the create if that field is present and non-empty, before Person upsert.

Rate limit: count unauthenticated `bookings` creates in a short window (about 8 per 10 minutes is plenty for one photographer). Exceeding it rejects further public creates. A single SQLite origin makes an in-hook count enough; no IP column.

**Alternatives considered:** Cloudflare Turnstile on every submit (extra widget, extra key, fights the Soft night form). Per-IP limits (requires storing IPs). Closing `createRule` and proxying through a Worker (second backend). CAPTCHA remains a last resort if the trap + window are abused.

### Mail: miss-me channel, PocketBase SMTP, not a live ticker

Configure SMTP in PocketBase (Resend’s SMTP endpoint is allowed as a *mail host*, not as a new datastore).

Studio writes `last_seen_at` on the photographer account on a short heartbeat while any `/studio` route is open. “Active” means last seen within about 15 minutes.

Hooks:

- after successful **public** booking create → photographer mail only if SMTP, away-notices on, and he is **not** active
- after client Delivery feedback → same photographer rule
- after Delivery create when client email exists and the gallery toggle is on → **client** mail with `/g/:token` (not gated on Studio activity)
- no photographer mail for expiry, for Studio-created bookings, or for Delivery create/revoke

Settings persist notify address + two toggles (photographer away-notices, client gallery-ready) on `brand_settings` (or a small singleton). If SMTP is unset, hooks log and return; they never fail the Booking/Delivery write.

**Alternatives considered:** Email every booking even while he is in Studio (noise; Dashboard already shows it). Delayed “unread after 15 minutes” queue (extra state, easy to double-send). Expiry reminders (not new inbound work). Frontend calling Resend (leaks keys or needs a Worker). WhatsApp Business API (out of scope; WhatsApp stays the human channel).

### Delivery files: copy-on-create, delete-on-revoke/expiry — not `protected` on `media`

`media` is shared with public Portfolio. Marking that file field `protected` would break public `/api/files` URLs. Guest file tokens are not available without auth.

New `delivery_files` collection: each Delivery create copies the selected originals into per-delivery file records. `/g/:token` and download use those URLs, not Library URLs. Revoke deletes the `delivery_files` rows (and bytes). A daily hook deletes copies for expired Deliveries. Library originals never move.

Existing live Deliveries can expire on the old leaky URLs (≤7 days). No backfill required.

**Alternatives considered:** PocketBase `protected` + custom file-token hook (more moving parts). Proxy all files through an authenticated Worker (new origin). Accept leaked URLs forever (fails the spec).

### Quiet mark: overlay on view, not a stamped derivative

Delivery gallery and immersive viewer wrap each frame with a corner wordmark (“Ibrahim Lens”, small, ~20% opacity, brass, `pointer-events: none`). Download still uses the unmarked `delivery_files` original. Public routes never mount the overlay.

**Alternatives considered:** Sharp/ImageMagick at copy time (CPU on a 2GB box, loud if mis-tuned, complicates thumbs). CSS diagonal stamp (rejected as too loud).

### SEO and health: directives + JSON-LD + ping, not a platform

`robots.txt` gains `Disallow: /_/`. Home injects JSON-LD `PhotographBusiness` (or equivalent) from Website globals — name, URL, email, telephone, country NG — no invented reviews. Search Console is an operator checkbox, not code.

Health is PocketBase `/api/health` (already `no-store` under `/api/*`). Operators point a free HTTP monitor at it. No Studio hub.

## Risks / Trade-offs

- **[Risk] Copy-on-deliver doubles bytes for 7 days** → Mitigation: copies are the selected set only, pruned on revoke/expiry; R2 holds the weight, not the 2GB disk.
- **[Risk] Overlay watermarks are screenshot-able around or cropped** → Mitigation: accepted; the mark is a reminder, not DRM. File URLs dying with the token is the real control.
- **[Risk] Global booking rate limit could block a busy evening of real requests** → Mitigation: threshold is high for one studio; photographer can still create Bookings in Studio (authenticated, unlimited).
- **[Risk] SMTP misconfig silently drops mail** → Mitigation: Settings shows a last-error / last-sent line from a test send; Booking still lands in Studio.
- **[Risk] A background Studio tab counts as active and suppresses mail** → Mitigation: accepted; 15-minute heartbeat means a closed laptop stops counting as active; he still has Dashboard when the tab is open.
- **[Risk] JSON-LD with empty contact fields looks like a thin business to Google** → Mitigation: omit empty properties; do not emit fake ratings.
- **[Risk] Design-rule conflict with “no watermarks v1”** → Mitigation: this change updates `openspec/config.yaml` in the same tasks.

## Migration Plan

1. Schema/hooks/UI ship behind normal Compose deploy (PocketBase image already mounts `pb_hooks` if we add the volume).
2. Operator sets PocketBase SMTP and Settings notify address; until then, behaviour matches today plus honeypot/rate limit and Delivery copies for **new** Deliveries.
3. Rebuild frontend so `robots.txt` and JSON-LD go live with `dist/`.
4. Point an uptime ping at `/api/health`; add the Search Console property.
5. Rollback: remove hooks volume / revert `dist`; leftover `delivery_files` can be deleted; Library media is untouched.

## Open Questions

None that block implementation. SMTP host (Resend SMTP vs another) is an operator choice and does not change specs or tasks.
