## Context

See proposal. Soft night remains a Vite SPA behind Caddy. `site_display_name` already exists and is edited under Site chrome → Footer; About ignored it.

## Goals / Non-Goals

**Goals:** Real OG JPEG; Caddy route allowlist + 404; About uses/edits display name.

**Non-Goals:** SSR; committing analytics vendor; changing Delivery OG path.

## Decisions

1. **OG image:** Generate a 1200×630 JPEG into `public/og-default.jpg` from an existing demo still (ffmpeg), deploy with the site. Photographer can replace later via deploy/`public/`.
2. **404:** Caddy `@spa` matcher for known prefixes; unmatched → `respond 404` with short Soft-night-safe HTML body (not stack traces).
3. **About name:** Reuse `site_display_name`; AboutTab gains the field; AboutPage reads globals for H1 + alt.
4. **Analytics:** Out of code for this change — recommend Cloudflare Web Analytics (privacy, already on CF) or Plausible; GA4 if ads attribution needed.

## Risks / Trade-offs

- [Risk] Strict SPA allowlist breaks a new public route → Mitigation: keep Work `:slug` via path_regexp; document adding paths in Caddyfile when routes are added.
- [Risk] OG JPEG in git is large → Mitigation: compress ~100–200KB with ffmpeg qscale.
