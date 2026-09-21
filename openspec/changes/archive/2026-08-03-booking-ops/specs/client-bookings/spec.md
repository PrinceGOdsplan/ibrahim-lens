## MODIFIED Requirements

### Requirement: Review booking requests
Authenticated photographers SHALL review and manage bookings under Clients → Bookings using the Booking Manager (first-class bookings), including requested date/time, custom answers, status, NGN money fields, notes, and history.

#### Scenario: New booking appears
- **WHEN** a visitor submits a booking request or the photographer creates one manually
- **THEN** it appears in Clients → Bookings with details and status

### Requirement: Confirm or contact workflow
Booking handling SHALL use statuses (`needs_contact`, `pending`, `confirmed`, `completed`, `declined`, `cancelled`) rather than a standalone needs-contact button. Web intake defaults to `needs_contact`. `pending` means contact is not required right now but the booking is not confirmed.

#### Scenario: Confirm booking
- **WHEN** the photographer sets status to `confirmed`
- **THEN** the booking status reflects confirmation in Studio

#### Scenario: Needs contact is a status
- **WHEN** a booking is `needs_contact`
- **THEN** Studio treats it as an open contact task in lists and Needs you
