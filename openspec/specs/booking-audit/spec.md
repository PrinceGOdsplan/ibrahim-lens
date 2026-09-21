# booking-audit Specification

## Purpose
Append-only audit trail for bookings so status, money, and assignment changes remain available for future reference.

## Requirements

### Requirement: Append-only booking events
The system SHALL record an immutable event for material booking changes including create, status change, fee/amount paid change, Person link change, and note updates.

#### Scenario: Status change logged
- **WHEN** a booking moves from `needs_contact` to `confirmed`
- **THEN** an event stores previous status, new status, actor, and timestamp

#### Scenario: Amount paid change logged
- **WHEN** the photographer updates amount paid
- **THEN** an event stores previous and new amounts in NGN

### Requirement: Events are not editable
Past audit events SHALL NOT be editable from Studio UI, and SHALL NOT be individually deletable. Events are immutable for as long as the booking they describe exists.

A booking's events SHALL be removed only as part of removing that booking, so that no event outlives the record it describes. Removing a booking SHALL remove its events in the same operation rather than leaving them unreachable.

#### Scenario: History is read-only
- **WHEN** the photographer views booking history
- **THEN** they can read events but cannot alter past event payloads

#### Scenario: Single event cannot be deleted
- **WHEN** the photographer views booking history
- **THEN** no action is offered to remove an individual event

#### Scenario: Events removed with their booking
- **WHEN** a booking is permanently removed
- **THEN** the events recorded for that booking are removed with it, leaving no orphaned history

### Requirement: History visible on booking
The Booking Manager detail view SHALL show the event history for that booking.

#### Scenario: Open history
- **WHEN** the photographer opens a booking’s history
- **THEN** they see chronological events for future reference

### Requirement: Guests cannot write audit events
Unauthenticated clients SHALL NOT create booking events. When a public booking is created, the server SHALL append the `created` event itself so history still exists for that booking.

#### Scenario: Guest event create rejected
- **WHEN** an unauthenticated client POSTs a booking event
- **THEN** the create is rejected

#### Scenario: Public booking still has a created event
- **WHEN** a visitor completes Book successfully
- **THEN** that booking’s history includes a `created` event
