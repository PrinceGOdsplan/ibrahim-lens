## 1. Confirm outbound fabric

- [x] 1.1 Confirm Resend domain `ibrahimlens.com.ng` stays verified, sending enabled, receiving disabled
- [x] 1.2 Add `scripts/check-mail-dns.ts` that asserts sending records (`resend._domainkey` TXT, `send` MX + SPF) are present and DNS-only; warn if apex MX is SES inbound or `_dmarc` is missing; fail if apex MX is SES when `MAIL_INBOUND_STRICT=1`
- [x] 1.3 Send a Resend test to `delivered@resend.dev` from `hello@ibrahimlens.com.ng` and record the result

## 2. Operator docs and env

- [x] 2.1 Document mail in README: Resend send / Cloudflare Email Routing receive, env files (`RESEND_API_KEY` in root `.env` locally and `deploy/.env` on the VPS), restart PocketBase, Settings → Send test, do not enable Resend receiving
- [x] 2.2 Tighten `.env.example` and `deploy/.env.example` comments: From address, receiving off, Routing destination must be external, `npx tsx scripts/check-mail-dns.ts`
- [x] 2.3 Note in README that this change does not alter `pb_data` or schema (no seed/backup step)

## 3. Cloudflare inbound (blocked on destination)

- [x] 3.1 Document Cloudflare dashboard steps: Email Routing destination (external mailbox), custom address `hello@`, enable Routing, then drop SES apex MX; add `_dmarc` `p=none` if missing; keep `send.` and `resend._domainkey`
- [x] 3.2 Apply Routing + DMARC in Cloudflare when an external destination is provided; re-run the DNS check

## 4. Spec sync already in this change

- [x] 4.1 Leave hook/UI notice catalog as shipped (no downloaded / upload mail). Specs in this change are the contract; no extra Settings rows
