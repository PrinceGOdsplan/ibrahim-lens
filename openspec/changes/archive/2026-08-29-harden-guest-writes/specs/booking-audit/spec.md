## ADDED Requirements

### Requirement: Guests cannot write audit events
Unauthenticated clients SHALL NOT create booking events. When a public booking is created, the server SHALL append the `created` event itself so history still exists for that booking.

#### Scenario: Guest event create rejected
- **WHEN** an unauthenticated client POSTs a booking event
- **THEN** the create is rejected

#### Scenario: Public booking still has a created event
- **WHEN** a visitor completes Book successfully
- **THEN** that booking’s history includes a `created` event
