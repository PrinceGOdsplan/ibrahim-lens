## Context

See `proposal.md` for why. Outbound already goes through PocketBase’s mailer: `01_smtp.pb.js` enables SMTP when `RESEND_API_KEY` is set (`smtp.resend.com:587`, user `resend`, From `hello@ibrahimlens.com.ng`). Hooks in `main.pb.js` send photographer booking / Write / feedback mail and client gallery-ready / expiry mail. Resend shows `ibrahimlens.com.ng` **verified**, sending on, receiving off. Sending DNS is already correct (`resend._domainkey` TXT, `send` MX + SPF). Apex MX is `inbound-smtp.us-east-1.amazonaws.com` (SES inbound) while receiving is disabled — inbound to `hello@` is a black hole. `_dmarc` is missing. The domain has sent zero messages; Compose already passes the key if present in `.env` / `deploy/.env`. Cloudflare MCP here can list Workers, not edit DNS. Email Routing destination must be an **external** mailbox.

## Goals / Non-Goals

**Goals:**

- Keep PocketBase SMTP as the send path. Do not add a Worker or HTTP mailer.
- Leave Resend receiving off. Move apex MX to Cloudflare Email Routing once a destination exists.
- Keep Resend bounce/SPF on the `send` subdomain so apex SPF can be Routing-only.
- Add apex DMARC `p=none`.
- Operator runbook + `scripts/check-mail-dns.ts` so the split cannot silently drift.
- Specs match shipped notice catalog.

**Non-Goals:**

- HTTP API, React Email, webhooks, Cloudflare Email Sending.
- App-processed inbound mail.
- Changing which events send.

## Decisions

### Resend sends, Cloudflare receives

Apex MX cannot serve both. Resend sending already uses `send.` for bounce MX and SPF, so it does not need apex MX. Enabling Resend receiving would steal `@` MX from Routing.

**Alternatives considered:** Resend receiving for `hello@` (rejected — Inbox is website forms; photographer mail should land in a human inbox). Send subdomain as the only verified domain (rejected — From is `hello@ibrahimlens.com.ng` and Resend requires the From domain to match).

### Keep PocketBase SMTP

Auth password-reset mail uses the same PocketBase mailer. HTTP-only sending would split auth mail from notices.

**Alternatives considered:** `$http.send` to Resend (extra path, still need SMTP for reset). Cloudflare Worker (second backend).

### Email Routing destination is external

Cloudflare forwards to a verified Gmail/Outlook/etc. address. Forwarding `hello@ibrahimlens.com.ng` to `ibrahim@ibrahimlens.com.ng` on the same routed zone will not work.

**Alternatives considered:** Catch-all to the Studio login (same-domain, rejected). Leave SES MX (rejected — receiving is off, mail is dropped).

### DMARC monitor-only

`_dmarc` TXT `v=DMARC1; p=none;` on `@`. Raise to `quarantine` later after mail is flowing.

**Alternatives considered:** Skip DMARC (Gmail still prefers it). `p=reject` on day one (too sharp).

### DNS check script, not a silent Cloudflare rewrite

Without a zone-edit token this session cannot flip MX. `check-mail-dns.ts` asserts the intended records. README lists the Cloudflare dashboard steps (Email → Email Routing: destination, custom address `hello@`, enable). Optional: if `CLOUDFLARE_API_TOKEN` is present later, an operator can apply records by hand in the dashboard — do not auto-delete SES MX until Routing is enabled and the destination is verified.

## Risks / Trade-offs

- **[Risk] Flip apex MX before Routing + destination are live** → Mitigation: enable Routing first; only then remove `inbound-smtp.us-east-1.amazonaws.com`.
- **[Risk] VPS missing `RESEND_API_KEY`** → Mitigation: README; Settings health; Compose already maps the env; restart PocketBase after setting the key.
- **[Risk] Resend receiving toggled on later** → Mitigation: env comments + README: leave receiving off; check script fails if apex MX is SES.
- **[Risk] Shared Resend account with another verified domain** → Mitigation: sending-only key scoped to `ibrahimlens.com.ng` when rotating; do not send Studio mail from the other domain.
- **[Risk] Same-domain forward** → Mitigation: document that the Routing destination must be external.

## Migration Plan

1. Confirm Resend: domain verified, sending on, receiving off (already true).
2. Set `RESEND_API_KEY` in the env Compose reads; restart PocketBase; Settings → Send test (or Resend test address `delivered@resend.dev`).
3. In Cloudflare Email Routing: add and verify an external destination; custom address `hello@`; enable Routing (Cloudflare writes Routing MX / SPF / DKIM).
4. Confirm `send.` and `resend._domainkey` still present (DNS only, not proxied). Add `_dmarc` `p=none` if Cloudflare did not.
5. Run `npx tsx scripts/check-mail-dns.ts`.
6. Rollback: re-enable previous MX only if Routing must be undone; sending records can stay.

## Open Questions

- Email Routing destination is `princechukwu3075@gmail.com`. Still needs Cloudflare dashboard or API access to add/verify that address, enable Routing, and add `_dmarc`. Outbound does not wait on it.
