## 1. Hooks first (backward compatible)

- [x] 1.1 In `deploy/pb_hooks/main.pb.js`, normalize unauthenticated booking creates: honeypot stays; rate limit all guest bookings; require name + phone in the body; upsert Person via `$app`; force `needs_contact` / `website` / empty money and notes; write the `created` booking event as superuser.
- [x] 1.2 On guest `form_inquiries` after-create with `kind=contact`, upsert Person from payload name/phone; HTML-escape names in `brandedMail`.
- [x] 1.3 Remove the `form_inquiries` after-create that sets `downloaded_at`. Stamp first download and write the inbox `delivery_event` when the token file route serves an original (not a thumb).
- [x] 1.4 On guest `delivery_feedback` create, force `reviewed` and `promoted` false; after-create write the inbox `feedback` row as superuser.

## 2. Collection rules

- [x] 2.1 In `scripts/ensure-schema.ts`, set people list/view/create/update/delete to authenticated (drop the phone-query guest window).
- [x] 2.2 Set guest `form_inquiries` create to `@request.auth.id != "" || @request.body.kind = "contact"`; `booking_events` create to authenticated; `delivery_feedback` create to live Delivery token or authenticated.
- [x] 2.3 Set `users.createRule` to null on existing installs; set testimonials list/view to `@request.auth.id != "" || published = true`.
- [x] 2.4 Confirm seed still creates the photographer via Admin auth; document that `pb_data` backup is unchanged (rules only).

## 3. Public and Delivery clients

- [x] 3.1 Change `submitPublicBooking` to POST the booking with name/phone/email/trap and stop listing or creating People from the browser.
- [x] 3.2 Stop `WriteSection` from calling `upsertPerson`; Write remains `submitInquiry('contact')` plus trap.
- [x] 3.3 Stop the Delivery page from POSTing `delivery_event`; download mark comes from the file route. Keep token on feedback create.

## 4. Origin headers and Admin

- [x] 4.1 Add CSP (`script-src 'self'` + JSON-LD hash or static file; Google Fonts allowed) and `X-Frame-Options SAMEORIGIN` / `frame-ancestors 'self'` on the public Caddy handle.
- [x] 4.2 Put Caddy `basicauth` on `/_/*` using `ADMIN_BASIC_USER` and `ADMIN_BASIC_HASH`; fail closed if the hash is missing on production. Document `caddy hash-password` and a local Compose pair.

## 5. Verify

- [x] 5.1 Run `ensure-schema` against local PocketBase; confirm guest People list/create, non-contact inquiries, booking_events create, and users create are rejected; Book and Write still land in Inbox.
- [x] 5.2 Confirm a Delivery original download sets `downloaded_at` and a thumb view does not; feedback without a token is rejected; unpublished testimonials are hidden from the public API.
- [x] 5.3 In the browser: Home fonts and JSON-LD still load; `/contact` Book and Write succeed once; `/g/:token` download and feedback still work; `/_/` returns 401 without the extra secret.
