## Why

Form inquiries and thin booking statuses are not enough for day-to-day Nigerian studio ops. The photographer needs People (phone-first, **+234**), a real Booking Manager with money in **NGN**, immutable history, and a single public intake path: **booking only** (no separate contact-message form).

## What Changes

- **People directory**: name + phone required; email optional; Studio notes; history of bookings (and deliveries when linked)
- **Booking Manager** as system of record: manual create + **auto-create from public booking form**
- Statuses: `needs_contact` | `pending` | `confirmed` | `completed` | `declined` | `cancelled` — **needs_contact is a status**, not a one-off button
- New web requests default to **`needs_contact`**. **`pending`** = no further contact needed yet, but not confirmed
- Finance: work fee + **amount paid** (NGN); unpaid / partial / paid; simple reports
- **Immutable audit log** for material changes
- **Remove public contact / “say hello” form** and Studio contact-field builder for intake — booking is the only frontend message source; Contact page keeps displayed globals + booking form
- Phone UX: fixed **`+234` prefix**; user enters the rest; if they type a leading `0` after `+234`, strip it (e.g. `+2340803…` → `+234803…`)
- Dashboard Needs you prioritizes `needs_contact` and unpaid confirmed work
- Supersedes `clients-workflow` as previously scoped

## Capabilities

### New Capabilities
- `client-people`: Phone-first client directory and identity matching (+234 normalization)
- `booking-manager`: First-class bookings, statuses, manual + form intake, notes, People link
- `booking-finance`: NGN fee, amount paid, payment state, simple Studio reports
- `booking-audit`: Append-only event log for every material booking change

### Modified Capabilities
- `website-forms`: Booking questions only (no contact inquiry builder); submit creates Person + Booking
- `public-contact`: Contact page without separate contact form; booking-only intake
- `client-inbox`: No public contact-kind messages; bookings/feedback/delivery events
- `admin-dashboard`: Needs you / pipelines reflect booking statuses and unpaid work
- `client-deliveries`: Prefer linking Delivery to a Person (and optionally a Booking)
- `client-bookings`: Studio Bookings UI is the Booking Manager over first-class records

## Impact

- New PocketBase collections (`people`, `bookings`, `booking_events`); migrate booking `form_inquiries`
- Remove/disable public contact inquiry submit and Website “contact fields” intake editor
- Currency **NGN**; phone display/storage as `+234…`
- Non-goals: Resend/email, multi-currency, Paystack checkout, availability calendars, share passwords, watermarks, full accounting, multi-photographer roles, zip/inbox-archive-first `clients-workflow` track
