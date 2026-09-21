## Context

See proposal.md for why. PocketBase collection rules are the real ACL. Several guest `createRule`s are empty (`''`), and hooks treat `form_inquiries.kind` and booking body fields as trusted. Public Book (`submitPublicBooking`) lists/creates People from the browser, then creates the booking and a `booking_events` row. Write calls `upsertPerson`. Delivery download POSTs `kind=delivery_event`, which a hook uses to set `downloaded_at`. Studio remains one photographer class: any `users` session is full operator.

## Goals / Non-Goals

**Goals:**
- Privileged writes (Person match, booking operator fields, download stamp, audit events, inbox activity) run in hooks as superuser after a token- or form-checked action.
- Guest collection rules match what the public UI is allowed to do.
- `users` signup is closed on the API. Seed and Admin still create the photographer.
- Production origin sends CSP + frame-ancestors and does not expose `/_/` with only the PocketBase Admin password.

**Non-Goals:**
- New HTTP booking/write routes (keep PocketBase collection creates).
- Per-IP limits, CAPTCHA, or Studio roles.
- Changing `/g/:token` or 7-day expiry.

## Decisions

### 1. Normalize guest booking on the existing create, do not add `/api/ibrahim/book`

Keep `bookings.createRule` empty so the public form can POST. In `onRecordCreateRequest` for unauthenticated creates:

- Keep the honeypot.
- Rate-limit every guest booking in the window (drop the `source = website` filter).
- Require name + phone in the request body (not collection fields). Resolve or create the Person with `$app` (same +234 normalization as today). Set `e.record` person, `status=needs_contact`, `source=website`, `studio_notes=""`, `fee_ngn=0`, `amount_paid_ngn=0`. Ignore a guest-supplied person id.
- After success, write the `created` booking event with `$app.save`.

**Alternative:** a custom route. Rejected — extra client and CORS surface for the same check.

**Client:** `submitPublicBooking` POSTs the booking plus name/phone/email/trap and stops calling `upsertPerson` / People list. Studio `createBooking` stays authed and unchanged.

### 2. People API is AUTHED-only; Write person-match moves to the contact hook

Set people list/view/create/update/delete to authenticated. Close the `phone_digits = @request.query.phone_digits` guest window.

On guest `form_inquiries` after-create with `kind=contact`, upsert Person from payload name/phone the same way the booking hook does. `WriteSection` stops calling `upsertPerson`.

### 3. Guest inquiries are contact-only; download stamp moves to original file serve

Guest create rule: `@request.auth.id != "" || @request.body.kind = "contact"`.

Remove the `form_inquiries` after-create that sets `downloaded_at`. In the Delivery file path (the token route that already serves originals), when the request is an original (not a thumb), if `downloaded_at` is empty, set it and write the inbox `delivery_event` with `$app`. Viewing thumbs does not count.

`logDeliveryDownload` from the gallery page becomes unnecessary for correctness; drop the guest POST (keep a no-op or delete the call).

Guest `delivery_feedback.createRule` requires the live token (same shape as delivery list). Hook forces `reviewed=false` and `promoted=false`. After-create writes the inbox `feedback` row as superuser so guests do not need a second inquiry kind.

### 4. booking_events create is AUTHED-only

Public `appendEvent` will fail; that is intended. The booking hook writes `created`. Studio updates stay authed.

### 5. users.createRule is admin-only

`ensure-schema` sets `users.createRule` to null (PocketBase Admin / superuser only). Seed already uses admin auth. Do not set it to `@request.auth.id != ""` — that would let one user mint more operators.

### 6. Testimonials public rule includes published

`listRule` / `viewRule`: `@request.auth.id != "" || published = true`.

### 7. Escape names in branded mail

One HTML-escape helper for visitor/client names before they are concatenated into `brandedMail`. Do not change mail layout.

### 8. Caddy: CSP + Admin basic auth

On the public handle (not `/api/files` cache):

- `X-Frame-Options SAMEORIGIN`
- `Content-Security-Policy` with `default-src 'self'`, `connect-src 'self'`, `img-src 'self' data: blob:`, `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`, `font-src 'self' https://fonts.gstatic.com`, `script-src 'self'` plus a hash (or a static file) for the homepage JSON-LD block, `frame-ancestors 'self'`

Google Fonts stay allowed because `src/index.css` still imports them.

`/_/*` gets Caddy `basicauth` from `ADMIN_BASIC_USER` + bcrypt `ADMIN_BASIC_HASH` (document `caddy hash-password`). PocketBase Admin password remains the second factor. Local Compose MAY use a documented dev pair so `/_/` still works on the workstation.

**Alternative:** Cloudflare Access only. Rejected as the sole control — it is account config, not repo-enforced. Operators MAY add Access later and drop basic auth.

## Risks / Trade-offs

- [Book/Write break if rules ship before the client] → Ship hooks + client in one deploy, then run `ensure-schema` on the live PocketBase.
- [Two simultaneous first-time phones create two People] → Accept for v1 (same race as today). Unique index on `phone_digits` is a later change.
- [CSP blocks fonts or JSON-LD] → Allow Google Fonts; hash or externalize JSON-LD; verify Home and `/studio` after deploy.
- [Admin basic auth env missing on VPS] → Compose MUST set the vars on production; an empty user MUST NOT leave `/_/` open. Fail closed (do not start the public Admin handle without a hash).
- [Thumb vs original] → Only the no-thumb original path stamps `downloaded_at`, matching “download is not view”.

## Migration Plan

1. Deploy hooks that normalize bookings, upsert people on contact, stamp download on original file serve, write inbox/audit as superuser, and escape mail. Existing clients still work.
2. Deploy the frontend that stops guest People writes and guest `delivery_event` / extra inquiry kinds.
3. Run `ensure-schema` so the new rules apply on live.
4. Deploy Caddy CSP + Admin basic auth; set production env; confirm `/_/` returns 401 without the extra secret and Home still loads fonts.
5. Rollback: restore previous Caddy/hooks and re-apply the old collection rules from the prior `ensure-schema` if a form breaks. Collection rule rollback is a schema run, not a DB wipe.

## Open Questions

None. Local Admin password pair can be a documented Compose default without changing the production fail-closed rule.
