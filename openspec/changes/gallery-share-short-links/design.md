## Context

See proposal.md. Deliveries already use a 48-hex `token` as both URL path and guest API secret (`@request.query.token`). Share UX needs a shorter public path without a third-party shortener. Caddy already matches `/g/([A-Za-z0-9_-]+)` for OG rewrites.

## Goals / Non-Goals

**Goals:**
- Short same-origin `/g/{code}` for share/copy/mail
- Long token URLs and API auth unchanged in strength
- Backfill short codes for existing live Deliveries

**Non-Goals:**
- Public vanity slugs chosen by the photographer
- External redirect services

## Decisions

1. **Add `short_code` (not shorten `token`)**  
   Keep `token` (16–64 chars) as the guest API secret. Add unique `short_code` (~8–10 chars, unambiguous alphabet) for the public path only.  
   Alternative: shorten `token` itself — would weaken API rules or force migrations of file URLs.

2. **Resolve short or long in one lookup**  
   Guest list/view rule: `(token = @request.query.token || short_code = @request.query.token) && …`. SPA passes the path segment as `query.token`; after load it uses `record.token` for delivery-file and feedback.  
   Alternative: dedicated resolve endpoint — extra hop, same outcome.

3. **Generate on create + ensure-schema backfill**  
   Client create sets `short_code`; pb_hooks after-create fills if missing; ensure-schema adds field/index and backfills empty rows.  
   Collision: retry a few times on unique failure.

4. **OG + mail use short when present**  
   `delivery-og` and client mail builders prefer `short_code` for `og:url` / link href; image URLs still use long `token` in the delivery-file path.

## Risks / Trade-offs

- [Shorter code vs entropy] → 10-char Crockford-like alphabet (~50 bits) acceptable for 7-day opaque links; revoke still works  
- [Rule bypass if short equals another token] → unique index + alphabet distinct from hex length makes cross-collision negligible  
- [Old copied long links] → still valid; no break

## Migration Plan

1. Deploy schema (`short_code` + rules + backfill)  
2. Deploy SPA + hooks  
3. Rollback: long URLs still work; remove short from copy if needed
