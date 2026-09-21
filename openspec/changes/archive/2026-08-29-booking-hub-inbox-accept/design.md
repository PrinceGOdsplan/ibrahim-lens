## Context

See `proposal.md` for motivation. Public submit already creates a Person + `bookings` row (`needs_contact`, `source: website`). Inbox today lists `form_inquiries` (feedback / delivery events); website bookings do not land there. The manager UI lives in `ClientsPage` as Today + Bookings. Dashboard Needs-you and pipeline cards chase `needs_contact` and Collect.

Keep PocketBase + the existing `bookings` collection. Do not reintroduce dual `form_inquiries` rows for booking intake.

## Goals / Non-Goals

**Goals:**
- One booking record from submit through Accept; hub vs Inbox is a status/view split.
- Extract the manager to `/studio/bookings` with six-hub nav.
- Inbox is a mixed mail list: unaccepted bookings + existing inquiries.
- Drop Today / Collect / “Needs a reply” surfaces.

**Non-Goals:**
- Renaming or dropping the `needs_contact` enum value (avoids a PocketBase select migration).
- Payment ledger, calendar view, or new money fields.
- Moving Website booking-question CMS.

## Decisions

1. **Unaccepted = existing `needs_contact`.** Hub lists `status != needs_contact`. Inbox booking mail is `listBookings` filtered to `needs_contact` (website or leftover). Accept is `updateBooking(id, { status: 'pending' })`. Delete is existing `removeBooking` with the same confirm + optional orphan Person prompt. Alternative considered: `form_inquiries` until Accept (rejected — already migrated off that; duplicate people/records).

2. **Inbox is a union, not a second collection.** Present unaccepted bookings beside `form_inquiries` in Clients → Inbox (Messages). Discriminator: booking vs feedback vs activity. Booking rows render name, preferred time, answers, **Accept** / **Delete**. Feedback does not get Accept. After Accept, the booking is gone from this list because it is no longer `needs_contact`.

3. **Bookings hub extracts current manager.** New page at `/studio/bookings` (query `?booking=` for deep links). Move BookingsTab / BookingDetail (and create form) out of `ClientsPage`. Clients tabs: Deliveries, Feedback, People, Inbox (default Inbox). Remove Today entirely.

4. **Incomplete alert = fee unset.** On hub detail, if `fee_ngn` is 0, show a quiet inline notice (not a toast, not a queue). Preferred time and answers already exist from the form. Manual creates with no fee get the same notice.

5. **Dashboard.** Needs-you: unaccepted bookings → `/studio/clients?tab=inbox`; unread feedback; expiring deliveries. No Collect-payment items. Pipeline “Needs a reply” becomes Inbox request count. Paid / outstanding totals stay; outstanding remains confirmed+completed only. Quick action “open bookings” → `/studio/bookings`.

6. **Notices.** `studio-notices` booking href → Inbox. Email copy for new booking: request in Inbox, not “needs a reply” in Bookings. Compatible with `notice-channels` (that change still owns the channel matrix).

7. **Hub status picker** omits `needs_contact`. Cannot send a hub booking back to Inbox via the dropdown (Delete on a hub booking remains removal, not “unaccept”).

## Risks / Trade-offs

- **[Risk]** Mixed Inbox list (bookings + inquiries) is two sources → **Mitigation:** `settleAll` already loads both on Clients; merge in the Inbox tab only.
- **[Risk]** `needs_contact` remains in the schema while UI never says “Needs a reply” → **Mitigation:** `statusLabel` becomes “Unaccepted” or similar, used only if the value leaks; hub filter hides it.
- **[Risk]** Delete from Inbox vs Remove on hub → **Mitigation:** same `removeBooking` + confirm; Inbox copy says the request will never become a booking.
- **[Risk]** Deep links to `?tab=today` / `?tab=bookings` on Clients → **Mitigation:** redirect `tab=bookings` and `tab=today` to `/studio/bookings` or Inbox as appropriate.

## Migration Plan

- No PocketBase collection change required. Existing `needs_contact` rows become Inbox mail until Accept/Delete. Existing `pending`+ stay in the hub.
- Deploy is frontend + copy. Rollback is revert the Studio routes/UI; data still valid.
- After archive, update `openspec/config.yaml` Product IA hubs to include Bookings.

## Open Questions

None. Outstanding-on-pending can be revisited later without changing this approach.
