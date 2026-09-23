## Why

Delivery share links currently use a long hex token in `/g/:token`, which is awkward to paste into WhatsApp and other messengers. Photographers need a short, same-domain share URL without relying on a third-party shortener.

## What Changes

- Each Delivery gets a short unique `short_code` used in share links (`/g/{short_code}`)
- Studio copy/share and client gallery emails use the short URL when available
- Existing long `/g/:token` links keep working
- Social crawler OG path resolves short codes the same way

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `client-gallery`: Short share codes for Delivery public URLs
- `client-deliveries`: Studio surfaces the short share link when copying

## Impact

- `deliveries` schema: `short_code` field + unique index; guest list/view rules accept short or long id via query token
- `src/lib/clients.ts` create + `deliveryPublicUrl`; Clients copy UI
- `deploy/pb_hooks/main.pb.js` OG + client mail links; optional backfill
- `scripts/ensure-schema.ts` field + rules

## Non-goals

- External shortener services (bit.ly, etc.)
- Changing Delivery expiry, passwords, or file auth secrets
- Requiring clients to re-open old long links (they stay valid)
