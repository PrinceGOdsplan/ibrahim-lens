## 1. Context and schema

- [x] 1.1 Update `openspec/config.yaml` email and Dashboard context for pulse desk, inbound-only photographer mail (booking / Write / feedback), client gallery-ready + expiry only, Profile vs Account
- [x] 1.2 Ensure `users.avatar` file field in `ensure-schema` / seed path; document `pb_data` backup before schema apply
- [x] 1.3 Document root `.env` vs `deploy/.env` for `RESEND_API_KEY` so local Compose enables SMTP

## 2. Finance and Dashboard data

- [x] 2.1 Add period helpers (`24h` / `7d` / `30d` / `all`) and lifetime / period finance (collected from `money_changed` deltas, booked fees once, outstanding now)
- [x] 2.2 Load Dashboard pulse snapshot: greeting fields, money, lifetime · period counts for Photos, Deliveries, Bookings, Requests, Messages, Feedback
- [x] 2.3 Rebuild `DashboardPage` as pulse composition (greeting, period control, money plane, count stacks); persist period; no named Needs-you roster

## 3. Identity

- [x] 3.1 Split Settings into Profile (name + photo) and Account (login email with current password, change password); authRefresh after saves
- [x] 3.2 Header and profile menu show avatar or initials; link to Settings → Profile
- [x] 3.3 Sign-in forgot-password via PocketBase requestPasswordReset; clear SMTP-unavailable messaging

## 4. Mail and notices

- [x] 4.1 Hooks: branded HTML wrapper; record `last_sent_at` on success; remove client-downloaded send; remove upload/portfolio photographer email; notify on Write (`form_inquiries` contact)
- [x] 4.2 Update notice-channels + Settings Notifications matrix (booking / message / feedback only; client gallery-ready + expiring; mail health + test)
- [x] 4.3 Richer bell: unread inbound from Inbox + realtime; title, time, deep link; opening aligns read state

## 5. Verify

- [x] 5.1 Typecheck / lint affected Studio files
- [x] 5.2 Manual smoke notes: Dashboard period switch, profile photo in header, test mail health, Write notice path
