## MODIFIED Requirements

### Requirement: Review booking requests
Authenticated photographers SHALL review unaccepted web booking requests in Clients → Inbox. After Accept, they SHALL manage those bookings in the Bookings hub using the Booking Manager, including requested date/time, custom answers, status, NGN money fields, notes, and history. Manual create in the Bookings hub still lands as `pending`.

#### Scenario: New web booking appears
- **WHEN** a visitor submits a booking request
- **THEN** it appears in Inbox Requests with details, not in the Bookings hub list

#### Scenario: Manual booking
- **WHEN** the photographer creates a booking manually
- **THEN** it appears in the Bookings hub (not Inbox Requests)

### Requirement: Confirm or contact workflow
Booking handling SHALL use statuses (`needs_contact`, `pending`, `confirmed`, `completed`, `declined`, `cancelled`) rather than a standalone needs-contact button. Web intake defaults to `needs_contact` and stays in Inbox. `pending` means accepted into the Bookings hub but not confirmed.

#### Scenario: Confirm booking
- **WHEN** the photographer sets status to `confirmed`
- **THEN** the booking status reflects confirmation in Studio

#### Scenario: Needs contact is a status
- **WHEN** a booking is `needs_contact`
- **THEN** Studio treats it as an open Inbox request and a Needs-you item, not a Bookings hub row
