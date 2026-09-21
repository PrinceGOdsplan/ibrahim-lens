## MODIFIED Requirements

### Requirement: Review booking requests
Authenticated photographers SHALL review and manage accepted bookings under the Bookings hub using the Booking Manager (first-class bookings), including requested date/time, custom answers, status, NGN money fields, notes, and history. Clients SHALL NOT host a Bookings tab or a Today reply/collect queue.

#### Scenario: Manual booking appears in the hub
- **WHEN** the photographer creates a booking manually
- **THEN** it appears in the Bookings hub with details and status `pending`

#### Scenario: Website request does not appear until accepted
- **WHEN** a visitor submits a booking request and it has not been accepted
- **THEN** it does not appear in the Bookings hub

### Requirement: Confirm or contact workflow
Booking handling SHALL use statuses (`needs_contact`, `pending`, `confirmed`, `completed`, `declined`, `cancelled`). Web intake defaults to unaccepted (`needs_contact`) and is handled in Inbox with Accept (→ `pending`) or Delete. `pending` means the job is in the book but not locked. Studio SHALL NOT treat `needs_contact` as an open “Needs a reply” task in lists, Today, or Needs you.

#### Scenario: Confirm booking
- **WHEN** the photographer sets status to `confirmed` on a hub booking
- **THEN** the booking status reflects confirmation in Studio

#### Scenario: Unaccepted stays in Inbox
- **WHEN** a booking is `needs_contact`
- **THEN** it appears in Inbox as an unaccepted request and not as a hub booking
