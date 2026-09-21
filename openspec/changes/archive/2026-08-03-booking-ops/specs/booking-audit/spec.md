## Purpose

Append-only audit trail for bookings so status, money, and assignment changes remain available for future reference.

## ADDED Requirements

### Requirement: Append-only booking events
The system SHALL record an immutable event for material booking changes including create, status change, fee/amount paid change, Person link change, and note updates.

#### Scenario: Status change logged
- **WHEN** a booking moves from `needs_contact` to `confirmed`
- **THEN** an event stores previous status, new status, actor, and timestamp

#### Scenario: Amount paid change logged
- **WHEN** the photographer updates amount paid
- **THEN** an event stores previous and new amounts in NGN

### Requirement: Events are not editable
Past audit events SHALL NOT be editable or deletable from Studio UI.

#### Scenario: History is read-only
- **WHEN** the photographer views booking history
- **THEN** they can read events but cannot alter past event payloads

### Requirement: History visible on booking
The Booking Manager detail view SHALL show the event history for that booking.

#### Scenario: Open history
- **WHEN** the photographer opens a booking’s history
- **THEN** they see chronological events for future reference
