## Why

Launch audit left real gaps: marketing share previews point at a missing `/og-default.jpg`, unknown URLs return HTTP 200, and the About page H1 hardcodes “Ibrahim Lens” even though Studio already stores `site_display_name`.

## What Changes

- Ship a real `/og-default.jpg` (1200×630) so share unfurlers get a photograph, not the SPA shell.
- Return HTTP 404 for unknown public paths while keeping SPA routing for known app routes.
- About page H1 (and portrait alt) use `site_display_name`; About Studio tab can edit that name next to the subtitle.
- Document analytics options (Cloudflare Web Analytics recommended); no analytics vendor locked in this change unless a beacon token env is added later.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `website-seo`: Default share image must resolve; unknown public paths return 404.
- `public-about` / website content: About displays editable site display name.
- `website-content`: About CMS can edit the display name shown on About.

## Non-goals

- Full SSR/Next.js migration for crawler HTML bodies.
- Google Search Console signup (operator step).
- Locking in GA4 vs Plausible vs Cloudflare Analytics in code this change (discussion + optional hook later).
- Changing Soft night craft.

## Impact

- `public/og-default.jpg`, Vite/Caddy static serve
- `deploy/Caddyfile` SPA allowlist + 404
- `AboutPage`, `AboutTab`, `PublicLayout` brand consistency where About/name shows
