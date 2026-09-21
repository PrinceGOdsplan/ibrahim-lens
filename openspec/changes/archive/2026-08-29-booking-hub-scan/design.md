## Context

See `proposal.md`. The Bookings hub is a master-detail form. Inbox Accept and the `bookings` collection stay as they are.

## Goals / Non-Goals

**Goals:**
- List is the book (who, when, status, money).
- Views Upcoming / Incomplete / Unpaid / All on one page.
- Selected booking is a facts card with next-step actions; field editors behind Edit details.

**Non-Goals:**
- Calendar widget, Collect/Today, schema changes, payment ledger.

## Decisions

1. **Views, not dual filters.** `upcoming` = `pending` or `confirmed`. `incomplete` = `detailsIncomplete`. `unpaid` = fee > 0 and outstanding > 0 (not “empty”). `all` = every hub booking. Default `upcoming`. Address: `?view=` plus existing `?booking=`.

2. **Sort by schedule.** `preferred_at` ascending; missing date last. Same order in every view.

3. **Card actions.** Pending → Confirm. Confirmed → Complete and Send gallery. Outstanding → Record payment (add received NGN to `amount_paid_ngn`, cap at fee). No fee → Set fee on the card (same incomplete alert). Edit details holds datetime, fee/paid fields, notes, full status (including declined/cancelled), history, remove.

4. **Outstanding chip.** The outstanding total is a control that sets `view=unpaid`. Paid total is display-only.

5. **No new collections.** Helpers live in `bookings.ts`.

## Risks / Trade-offs

- **[Risk]** Upcoming hides completed work → **Mitigation:** All view; Complete is an explicit next step.
- **[Risk]** Record payment as “add received” vs replace total → **Mitigation:** add received, cap at fee; Edit details still sets the two numbers directly.

## Migration Plan

Frontend only. Reload with `?view=incomplete` is new; old `/studio/bookings` opens Upcoming.

## Open Questions

None.
