## Why

Website booking requests are treated as jobs the moment they arrive, then Studio invents “Needs a reply” and Collect queues to chase them. The photographer wants mail in Inbox (Accept or Delete) and a dedicated Bookings hub only for jobs that are already in the book.

## What Changes

- **Bookings hub:** Studio gains a first-class Bookings page (`/studio/bookings`) in hub navigation. The manager (list, detail, money, date, notes, manual create) lives there, not as a Clients tab.
- **Website stays CMS:** Booking questions, calendar toggle, and help text remain under Website → Contact & booking. That tab does not manage jobs.
- **Inbox is mail:** Clients → Inbox shows delivery feedback **and** unaccepted website booking requests. Booking rows offer **Accept** and **Delete** only. Unaccepted requests stay in Inbox.
- **Accept:** Moves the request into the Bookings hub as `pending`. The new hub row shows a subtle alert until fee / studio details are filled. Manual “+ New booking” continues to land as `pending` and skips Inbox.
- **Delete:** Removes the request; it never appears as a hub booking.
- **Remove ops queues:** Drop Clients → Today, “Needs a reply”, and Collect. Unpaid balance is visible on each booking and as Dashboard totals (and the hub’s unpaid filter) — not a separate chase page.
- **Dashboard:** Needs-you and pipeline cards follow Inbox (unaccepted requests, unread feedback) and Deliveries, not reply/collect booking queues. Outstanding remains a number, not a list of people to chase.

## Non-goals

- Changing the public booking form (fields, +234 phone, honeypot, request calendar).
- A payment ledger, shoot calendar, or confirmed-vs-preferred time as new first-class fields.
- Restoring a public contact-inquiry form.
- Multi-currency, availability slots, or client-facing booking status.
- Moving the booking-questions builder out of Website.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `booking-manager`: Unaccepted website requests are not hub bookings; Accept lands as `pending` with an incomplete-details alert; Delete never creates hub history as a job.
- `client-bookings`: Manager lives at the Bookings hub; Clients no longer hosts Bookings or Today reply/collect queues.
- `client-inbox`: Inbox presents unaccepted booking requests with Accept and Delete alongside feedback messages.
- `website-forms`: Public submit creates an unaccepted request that appears in Inbox, not in the Bookings hub, until Accept.
- `admin-dashboard`: No “Needs a reply” or Collect booking queues; outstanding and paid totals remain; Inbox is the booking-request attention surface.
- `app-shell`: Studio nav includes the Bookings hub.
- `studio-app-shell`: Phone master-detail for Bookings applies to the Bookings hub.
- `booking-finance`: Unpaid balance is shown on the booking and Dashboard; no Collect surface.
- `studio-notifications`: New website booking notices deep-link to Inbox, not Clients Today.

## Impact

- Studio routing and nav (`StudioLayout`, hub pages): add `/studio/bookings`; retarget Dashboard, notices, and deep links.
- `ClientsPage`: remove Today and Bookings tabs; Inbox gains Accept/Delete for booking requests.
- New Bookings hub page (extracted from existing Bookings tab + detail).
- `bookings` / inbox presentation: hub lists exclude unaccepted (`needs_contact`) rows; Inbox unions those bookings with `form_inquiries` feedback.
- Schema enum may keep `needs_contact` as the unaccepted state (product copy must not say “Needs a reply”).
- Dashboard snapshot and copy; `studio-notices` hrefs.
- Specs listed above; Product IA (Studio hubs) in project context when this change is archived.
