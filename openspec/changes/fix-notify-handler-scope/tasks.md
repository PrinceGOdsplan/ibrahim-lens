## 1. Shared modules

- [x] 1.1 Move ECE + VAPID into `ece.js` / `vapid_push.js` modules; stub `00_*.pb.js`
- [x] 1.2 Expand `ibrahim_utils.js` with mail, push enqueue, channel helpers, rate-limit, request helpers

## 2. Wire handlers

- [x] 2.1 `require` utils in notify `onRecord*` / `cronAdd` / `routerAdd` (test-mail, vapid-public, mail-health, resend, OG, delivery-file as needed)
- [x] 2.2 Remove live notify-diag route if present

## 3. Verify

- [x] 3.1 Diag: helpers available via require inside routerAdd
- [x] 3.2 Deploy hooks; Send test / mail-health behavior; booking or Write path does not ReferenceError
- [x] 3.3 SMTP STARTTLS on 587 (`smtp.tls=false`); VAPID public derived when env missing
