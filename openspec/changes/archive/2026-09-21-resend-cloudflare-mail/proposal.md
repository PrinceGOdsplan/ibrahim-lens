## Why

Studio mail is already wired through PocketBase SMTP, and Resend has verified `ibrahimlens.com.ng` with sending on and receiving off — but the live domain has sent nothing, apex MX still points at Amazon SES inbound (a black hole while receiving is disabled), and main specs still describe client-downloaded and upload mail that the product dropped. Mail will not stay working until sending DNS, Cloudflare inbound MX, Compose env, and the notice catalog agree.

## What Changes

- Treat Resend as the **only outbound** path: PocketBase SMTP to `smtp.resend.com`, From `hello@ibrahimlens.com.ng`, receiving left **off**.
- Treat Cloudflare Email Routing as the **only inbound** path: apex MX must be Cloudflare Routing, not SES inbound. Destination is a real external mailbox (not another `@ibrahimlens.com.ng` address).
- Keep Resend sending records on `send.` and `resend._domainkey` (already verified). Add `_dmarc` `p=none` on the apex. Do not put Resend SPF on `@`.
- Document the operator runbook (env files, DNS checklist, do-not-enable receiving) and a DNS check script.
- **BREAKING (spec sync only):** main `studio-notifications` still requires client “you downloaded” mail and photographer upload email. Align specs with the shipped product (those mails stay off). Code already matches.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `studio-notifications`: Drop client-downloaded send and photographer upload / Portfolio email from requirements; outbound is optional Resend SMTP from the verified studio domain; keep gallery-ready and expiry-if-not-downloaded.
- `admin-settings`: Notifications health and test send stay the photographer’s proof that outbound mail is configured; hubs still work when it is unset.
- `client-gallery`: First download still marks the Delivery downloaded (expiry suppression) and SHALL NOT send client “you downloaded” mail.

## Impact

- Cloudflare DNS for `ibrahimlens.com.ng` (apex MX, optional apex SPF for Routing, DMARC). Resend domain stays sending-enabled / receiving-disabled.
- `deploy/pb_hooks/01_smtp.pb.js` and Compose `RESEND_API_KEY` / `SMTP_FROM` (no mailer rewrite).
- README + `deploy/.env.example` / `.env.example` operator notes; `scripts/check-mail-dns.ts`.
- Specs listed above. Settings → Notifications and hooks already send the kept events.

## Non-goals

- Replacing PocketBase SMTP with the Resend HTTP API, a Cloudflare Worker, or React Email.
- Enabling Resend receiving / inbound webhooks, or an app that reads `hello@` and acts on it.
- Cloudflare Email Sending (a second outbound provider).
- Digest mail, client-downloaded mail, upload / Portfolio email, or changing which Studio notices exist.
- Switching the core stack off PocketBase + Compose.
