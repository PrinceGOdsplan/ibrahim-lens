## Why

The site is live and the v1 deferrals now hurt: booking create is anonymous with no throttle, Ibrahim only learns about requests if he opens Studio, and a Delivery page token does not protect the image bytes behind it. Email, quiet delivery marks, and file-token trust belong in the product now that there is a real domain and real clients.

## What Changes

- Public booking submit still creates a Person + `needs_contact` Booking, but automated bulk creates are rejected (honeypot and/or origin rate limit). Legitimate visitors are not shown a CAPTCHA wall unless that is the only remaining defence.
- Settings → Notifications becomes a working outbound channel. Photographer mail is a miss-me copy of **new inbound work** (a public booking request, and client Delivery feedback) and SHALL send only when he is not already active in Studio. Client mail when a Delivery is created if an email is on file. Studio Inbox and Booking records stay the source of truth; mail is a copy, not a ticker. No photographer mail for expiry reminders or for actions he just took.
- Delivery **pages** stay token-only (no share password, no 2FA). Delivery **files** require a live Delivery token: after expiry or revoke, previously copied file URLs stop serving bytes.
- Delivery gallery **view** may carry a quiet wordmark (small, low opacity, corner — not a diagonal stamp). **Download original** remains unmarked. Public Home, Portfolio, and Work stay unmarked.
- Crawler directives also disallow PocketBase admin (`/_/`). Home publishes a small Photographer JSON-LD block from published contact/identity fields. Operators register Search Console and an HTTP ping against the origin health URL; the app does not grow an observability suite.

## Non-goals

- Two-factor authentication on Studio or PocketBase admin (password remains the vault).
- Share passwords on `/g/:token`.
- Watermarks on the public site (Home, Portfolio, Work, About).
- Replacing PocketBase with Resend, Supabase, or another backend.
- CI/CD pipeline, on-server Vite builds, or an APM/log platform.
- Prerendering every route so messaging apps get per-Work Open Graph tags (the existing `index.html` baseline stays).
- Hardening against a determined attacker with a stolen Studio password.
- Photographer email for Delivery expiry, for Deliveries he just created, or for any event while Studio is in active use.

## Capabilities

### New Capabilities

- `studio-notifications`: Outbound mail for photographer (new inbound work, only when Studio is idle) and client (gallery ready), configured in Settings, optional if mail is unset.
- `site-health`: Origin health URL for operator pings; no in-app monitoring dashboard.

### Modified Capabilities

- `website-forms`: Public booking create resists automated bulk submissions without blocking a real visitor’s request.
- `client-deliveries`: Image bytes for a Delivery require a live token; revoke and expiry cut file access, not only the page.
- `client-gallery`: Quiet view mark on Delivery photographs; download original unmarked; still no share password.
- `library-media`: Replace the v1 “no watermarks” rule — stored originals stay unmarked; Delivery view may show a quiet mark.
- `admin-settings`: Notifications tab is real configuration; Studio remains usable if outbound mail is not configured.
- `website-seo`: Crawler directives disallow `/_/` in addition to `/g/` and `/studio/`; Home exposes Photographer JSON-LD.

## Impact

- PocketBase: SMTP (or equivalent outbound from a PocketBase hook), booking create hook/rate limit, protected Delivery file access, schema/seed updates.
- Frontend: booking form hidden field, Studio activity heartbeat, Settings notifications, Delivery gallery overlay, file URLs that carry a file token, Home JSON-LD.
- Caddy/Cloudflare: optional rate limit / bot fight in front of booking create; health URL stays cache-bust (`no-store`).
- `openspec/config.yaml`: lift “email not v1” and “no watermarks v1”; keep “no share password” and “no public watermarks”.
- Operator: Search Console property + uptime ping to `/api/health` (or equivalent). No new paid SaaS as a core dependency.
