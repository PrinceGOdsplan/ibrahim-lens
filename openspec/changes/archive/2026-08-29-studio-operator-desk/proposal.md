## Why

Studio’s operator surfaces feel unfinished: Dashboard is an empty Needs-you void (or a privy roster of client names), the header is initials that don’t refresh, mail is optional plumbing that often never sends and never looks intentional, and notices disagree with Dashboard about Write messages. The photographer needs one desk — money and counts without diary details, an identity that is him, and a post office that works.

## What Changes

- **Dashboard** becomes a pulse desk: greeting + period control + money plane (lifetime collected, period collected, period booked fees, outstanding now) + count stacks (lifetime · intake in window). No client names, shoot times, or message previews.
- **Period presets** `24h · 7d · 30d · All` drive both money and count “in window” figures; preference persists.
- **Profile vs Account** in Settings: Profile = name + photo (header + greeting); Account = editable login email (save with current password), change password, and Sign-in forgot-password.
- **Mail** treated as production: fix env/SMTP path, mail health in Settings, branded HTML templates, record last send success/failure. **BREAKING:** remove client “you downloaded” mail; **BREAKING:** remove photographer upload / add-to-Portfolio email (and bury those matrix rows for email).
- **Notices:** Write messages join Book and Feedback for email / in-app / mobile; richer bell (who, when, durable unread aligned with Inbox); drop session-only toy tray behavior for those inbound events.
- Update `openspec/config.yaml` email and Dashboard context to match.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `admin-dashboard`: Pulse desk (money + counts + period); remove Needs-you named roster and privy booking details from Dashboard.
- `booking-finance`: Lifetime and period collected ₦; period booked fees; outstanding now; period picker shared with Dashboard.
- `admin-settings`: Split Profile and Account; Notifications matrix without upload/portfolio email and without client-downloaded; mail health + test.
- `admin-auth`: Change login email with current password; forgot-password on Sign in; profile photo on users; auth refresh after profile/account saves.
- `studio-notifications`: Write as inbound event; drop client downloaded mail; bury upload/portfolio email; branded templates; mail health; richer in-app notices.
- `studio-app-shell`: Header shows profile photo or initials; profile menu opens Profile; name/photo refresh live.
- `client-gallery`: First download no longer triggers client mail (flag may remain for expiry logic).
- `client-deliveries`: No client-downloaded preference; expiry-if-not-downloaded and gallery-ready remain.

## Impact

- `DashboardPage`, `dashboard.ts`, `bookings.ts` (finance/period helpers), `booking_events` for collected-in-period
- `SettingsPage` (Profile / Account / Notifications), `StudioLayout` / auth, `StudioLoginPage`
- `deploy/pb_hooks/main.pb.js` (mail events, templates, Write notify), `01_smtp.pb.js` / Compose env docs
- `notice-channels.ts`, `studio-notices.ts`, `notifications.ts`
- PocketBase `users` avatar field if missing; schema/seed touch as needed
- `openspec/config.yaml` context lines for email and Dashboard

## Non-goals

- Custom date-range picker beyond presets (This month / calendar may follow later)
- Accounting-grade ledgers, invoices, or tax exports
- 2FA, multi-user Studio, WhatsApp/SMS as notice channels
- Restoring Dashboard Needs-you named lists or Gallery pulse card grids
- Digest/summary emails; per-image download mail; global toast stack
- Changing 7-day Delivery expiry, public Soft night craft, or PocketBase as backend
