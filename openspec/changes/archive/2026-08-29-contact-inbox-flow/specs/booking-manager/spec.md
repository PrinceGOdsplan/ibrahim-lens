## MODIFIED Requirements

### Requirement: Auto-create from public booking form
Submitting the public booking form SHALL create or match a Person (via +234-normalized phone) and create a Booking in `needs_contact` status with the requested date/time and answers preserved. Public Write is a separate intake and SHALL NOT create a Booking.

#### Scenario: Web request becomes booking
- **WHEN** a visitor submits a valid booking request
- **THEN** Studio Inbox shows a `needs_contact` booking linked to that Person, and the Bookings hub does not list it until Accept

### Requirement: Status lifecycle
Each booking SHALL have exactly one status from: `needs_contact`, `pending`, `confirmed`, `completed`, `declined`, `cancelled`. Web requests stay `needs_contact` in Inbox. Accept sets `pending` and is the handoff into the Booking Manager. Further status changes happen in the manager.

#### Scenario: Needs contact means unreplied / must talk
- **WHEN** a booking is in `needs_contact`
- **THEN** it appears in Inbox Requests and Dashboard Needs-you until the photographer accepts or deletes it

#### Scenario: Pending means no contact needed yet, not confirmed
- **WHEN** the photographer accepts a request (status `pending`)
- **THEN** the booking is tracked in the Bookings hub as waiting confirmation without implying an outstanding Inbox request

#### Scenario: Confirm booking
- **WHEN** the photographer sets status to `confirmed`
- **THEN** the booking is treated as locked-in work for ops and finance tracking
