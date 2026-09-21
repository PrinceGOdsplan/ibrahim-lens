## ADDED Requirements

### Requirement: Hub lists only accepted bookings
The Booking Manager hub SHALL list bookings that have been accepted into the book (status is not the unaccepted website-request state). Unaccepted website requests SHALL NOT appear in the hub list.

#### Scenario: Website request is not in the hub
- **WHEN** a visitor submits a booking request and the photographer has not accepted it
- **THEN** that request does not appear in the Bookings hub list

#### Scenario: Accepted booking appears
- **WHEN** the photographer accepts a website request
- **THEN** that booking appears in the Bookings hub with status `pending`

### Requirement: Incomplete details alert
When a hub booking has no work fee set, Studio SHALL show a subtle, persistent alert on that booking that amounts and other studio details have not been filled in. The alert SHALL NOT be a separate Collect or “Needs a reply” queue. It SHALL clear when a fee greater than zero is saved.

#### Scenario: Newly accepted booking
- **WHEN** a booking is accepted into the hub and fee is unset
- **THEN** the booking detail shows a quiet alert that details are not filled in yet

#### Scenario: Fee saved
- **WHEN** the photographer saves a fee greater than zero
- **THEN** that incomplete-details alert is not shown

### Requirement: Bookings hub route
Authenticated photographers SHALL manage bookings at the Studio Bookings hub (`/studio/bookings`), not as a Clients tab and not as Website ops.

#### Scenario: Open Bookings hub
- **WHEN** the photographer opens the Bookings hub
- **THEN** they can list, open, create, update, and remove accepted bookings

## MODIFIED Requirements

### Requirement: Auto-create from public booking form
Submitting the public booking form SHALL create or match a Person (via +234-normalized phone) and create a Booking in the unaccepted request state (`needs_contact`) with the requested date/time and answers preserved. This is the only public frontend message intake. That record SHALL appear in Inbox until Accept or Delete; it SHALL NOT appear in the Bookings hub until accepted.

#### Scenario: Web request becomes inbox item
- **WHEN** a visitor submits a valid booking request
- **THEN** Studio shows that request in Inbox, linked to that Person, and not in the Bookings hub

### Requirement: Status lifecycle
Each booking SHALL have exactly one status from: `needs_contact`, `pending`, `confirmed`, `completed`, `declined`, `cancelled`. `needs_contact` means unaccepted website mail and is not chosen in the Bookings hub. Accept from Inbox SHALL set status to `pending`. Hub status is chosen among `pending`, `confirmed`, `completed`, `declined`, and `cancelled`. Studio SHALL NOT present a “Needs a reply” queue.

#### Scenario: Accept lands as pending
- **WHEN** the photographer accepts a website booking request
- **THEN** the booking status is `pending` and the booking appears in the Bookings hub

#### Scenario: Pending means in the book, not locked
- **WHEN** a booking is `pending`
- **THEN** it is tracked as accepted work that is not yet locked-in, without implying an outstanding Inbox task

#### Scenario: Confirm booking
- **WHEN** the photographer sets status to `confirmed`
- **THEN** the booking is treated as locked-in work for ops and finance tracking
