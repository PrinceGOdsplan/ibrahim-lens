## MODIFIED Requirements

### Requirement: Review booking requests
Authenticated photographers SHALL review and manage bookings under Clients using the Booking Manager, including status, NGN money, notes, and history. The default daily path SHALL prefer the calm Today queue; the full manager remains available for search, filters, and deep edits.

#### Scenario: New booking appears
- **WHEN** a visitor submits a booking request or the photographer creates one manually
- **THEN** it appears in Clients Bookings / Today as appropriate for its status

### Requirement: Confirm or contact workflow
Booking handling SHALL use statuses (`needs_contact`, `pending`, `confirmed`, `completed`, `declined`, `cancelled`). Studio labels SHOULD use calm language (e.g. “Needs a reply” for `needs_contact`) while storing the same status values.

#### Scenario: Needs contact is a status
- **WHEN** a booking is `needs_contact`
- **THEN** Studio treats it as an open reply task in Today and lists

#### Scenario: Soft label
- **WHEN** the photographer views a `needs_contact` booking in Studio UI
- **THEN** they see human copy such as Needs a reply rather than only the raw enum string
