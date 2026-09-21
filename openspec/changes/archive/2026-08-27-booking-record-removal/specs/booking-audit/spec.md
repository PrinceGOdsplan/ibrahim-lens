## MODIFIED Requirements

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
