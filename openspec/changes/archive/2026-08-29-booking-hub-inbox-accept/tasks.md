## 1. Helpers and labels

- [x] 1.1 Add hub vs inbox split helpers (`isUnacceptedBooking` / hub list filter) and change `needs_contact` status label away from “Needs a reply”
- [x] 1.2 Hub status picker values exclude `needs_contact`; incomplete-details is `fee_ngn` unset (0)

## 2. Bookings hub

- [x] 2.1 Add `/studio/bookings` route, nav item, and page title; extract manager UI from Clients
- [x] 2.2 Hub lists only accepted bookings; manual create still lands as `pending`; show incomplete-details alert on fee-unset rows
- [x] 2.3 Redirect Clients `tab=bookings` / `tab=today` (and old booking deep links) to the Bookings hub or Inbox as appropriate

## 3. Inbox Accept / Delete

- [x] 3.1 Inbox Messages unions unaccepted bookings with existing inquiries; booking rows show answers, preferred time, Accept and Delete
- [x] 3.2 Accept sets `pending` and the row leaves Inbox for the hub; Delete uses `removeBooking` confirm (optional orphan Person prompt)

## 4. Clients and Dashboard

- [x] 4.1 Remove Clients Today and Bookings tabs; default Clients to Inbox; keep Deliveries, Feedback, People
- [x] 4.2 Dashboard: Needs-you for Inbox requests (not Collect / Needs a reply); pipeline count is unaccepted requests; quick action and finance totals point at hub / outstanding number only

## 5. Notices and copy

- [x] 5.1 In-app new-booking notice href goes to Inbox; email copy does not say the request is a hub job that needs a reply

## 6. Verify

- [x] 6.1 Smoke: public submit → Inbox (not hub) → Accept → hub `pending` with incomplete alert → save fee clears alert; Delete never appears in hub
- [x] 6.2 Confirm no PocketBase schema/seed/backup change is required (existing `needs_contact` rows become Inbox mail)
