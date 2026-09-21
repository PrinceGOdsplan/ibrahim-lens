## Why

The Bookings hub is a record editor with a sidebar: the list omits the date, and the only verbs are Save on form fields. The photographer needs to scan the book (who, when, money, what’s missing) and take the next step without opening an editor.

## What Changes

- **Scan list:** Each hub row shows person, date/time, status, and payment line, with a quiet mark when fee is unset or a balance remains. Default sort is upcoming date, not newest created.
- **Views:** Hub chips Upcoming (default), Incomplete, Unpaid, and All replace the status/payment `<select>`s. Tapping Dashboard-style outstanding still stays in this hub (Unpaid view). Not a Collect page.
- **Read-first card:** Selecting a booking shows facts and next-step actions (Confirm, Complete, Record payment, Set fee when unset). Full field editors (schedule, fee/paid, notes, other statuses, remove) sit behind Edit details.
- Manual create remains a full book (person, schedule, money, notes, website questions) and still lands as `pending`. Inbox Accept/Delete is unchanged.

## Non-goals

- A calendar or week grid.
- Restoring Today, Collect, or “Needs a reply.”
- Payment ledger, packages, or confirmed-vs-preferred as new fields.
- Moving Website booking questions.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `booking-manager`: Hub is a scan-and-act book; editor is secondary; views and next-step actions are first-class.
- `booking-finance`: Unpaid is a hub view of the same bookings, not a separate chase surface.
- `studio-app-shell`: Deep state for the hub view is in the address; phone still stacks list then card.

## Impact

- `BookingsPage` list, filters, and detail pane.
- Small helpers in `src/lib/bookings.ts` (views, sort).
- Query `view=` on `/studio/bookings` alongside `booking=`.
