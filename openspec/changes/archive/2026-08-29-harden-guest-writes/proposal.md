## Why

Guest PocketBase create rules are empty on bookings, people, form_inquiries, delivery_feedback, and booking_events, and hooks trust the request body. A visitor can invent operator-looking bookings, read People by phone, stamp a Delivery as downloaded, or register a Studio user if signup is still open. The public forms should stay account-free; the server must own identity match and privileged side effects.

## What Changes

- Guest **booking** create is normalized in a hook: `source=website`, `status=needs_contact`, money and studio notes cleared, Person matched or created server-side from name + phone. Rate limit counts every guest booking, not only `source=website`.
- Guests **cannot list, view, or create People**. Write and Book still match a Person; that match happens in hooks, not via the People API.
- Guest **form_inquiries** create is limited to `kind=contact`. Delivery download and feedback inbox rows are written by hooks after a token-checked action.
- First download is recorded when the origin serves an original Delivery file, not when a guest POSTs `delivery_event`.
- Guest **delivery_feedback** create requires the live Delivery token. Guests cannot set reviewed/promoted.
- **booking_events** create is authenticated only. The booking-create hook writes the public `created` event as superuser.
- **users** create is admin/seed only. Any logged-in user remains a full Studio operator; the change is that strangers cannot mint that user.
- Unpublished **testimonials** are not listable or viewable without a Studio session.
- Photographer mail HTML escapes visitor and client names.
- Public origin sends a Content-Security-Policy and frame-ancestors. PocketBase Admin (`/_/`) is not left open on the public host without an extra operator control.

## Capabilities

### New Capabilities

- `origin-security`: Public origin headers (CSP, frame-ancestors) and PocketBase Admin not anonymously reachable on the production host.

### Modified Capabilities

- `admin-auth`: Studio accounts cannot be created through the public users API.
- `website-forms`: Public Book and Write stay account-free, but guests cannot choose booking status/source/money or write arbitrary inquiry kinds; Person upsert is server-side.
- `client-people`: People list/view/create are Studio-only.
- `client-bookings`: Public create always lands as an unaccepted website request.
- `booking-audit`: Guests cannot append events; the server writes the public create event.
- `client-feedback`: Feedback create requires a valid Delivery token.
- `client-deliveries`: First-download record is set by serving an original file, not by a guest inquiry row.
- `client-gallery`: Download still works; download inbox/activity is server-authored.
- `website-content`: Public testimonial reads require `published = true`.

## Impact

- `scripts/ensure-schema.ts` — collection rules for users, people, bookings, booking_events, form_inquiries, delivery_feedback, testimonials.
- `deploy/pb_hooks/main.pb.js` — guest booking/people/write/download/feedback hooks; HTML escape in mail.
- `deploy/Caddyfile` — CSP, frame-ancestors; Admin path restriction or documented extra auth.
- `src/lib/bookings.ts`, `src/components/public/WriteSection.tsx`, `src/lib/clients.ts`, `src/pages/public/DeliveryPage.tsx` — stop guest People/inquiry writes that the hooks now own.
- Deploy: run schema ensure against the live PocketBase after hooks/Caddy ship.

## Non-goals

- CAPTCHA, Turnstile, 2FA, or per-IP rate limiting.
- Changing Delivery tokens, 7-day expiry, or the `/g/:token` model.
- Role-based Studio users (still one photographer class: any `users` session is full Studio).
- Closing public Book or Write.
- Changing Cloudflare cache TTL for public Portfolio/Work `/api/files/*`.
- Moving PocketBase to a different host or replacing Caddy.
