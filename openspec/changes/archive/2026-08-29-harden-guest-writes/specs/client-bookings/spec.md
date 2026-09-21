## ADDED Requirements

### Requirement: Public booking create is an unaccepted website request
An unauthenticated booking create SHALL always be stored as status `needs_contact` and source `website`, with fee, amount paid, and studio notes empty. Authenticated Studio creates MAY still set status `pending` and source `manual` for photographer-entered bookings.

#### Scenario: Web intake ignores confirmed
- **WHEN** an unauthenticated client creates a booking with status confirmed
- **THEN** Inbox shows it as an unaccepted `needs_contact` request

#### Scenario: Studio manual create unchanged
- **WHEN** the photographer creates a booking in the Bookings hub
- **THEN** it appears in the Bookings hub as `pending` with source `manual`
