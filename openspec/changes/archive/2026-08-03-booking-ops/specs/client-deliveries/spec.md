## MODIFIED Requirements

### Requirement: Client name required
Each Delivery SHALL require a client identity suitable for Studio lists — preferably a linked Person (name + phone), with legacy free-text name only as fallback during migration.

#### Scenario: Missing client blocked
- **WHEN** the photographer tries to create a Delivery without a Person or client name
- **THEN** the system rejects creation

## ADDED Requirements

### Requirement: Link delivery to person and optional booking
Authenticated photographers SHALL be able to link a Delivery to a Person and optionally to a Booking for that Person.

#### Scenario: Deliver from a confirmed booking context
- **WHEN** the photographer creates a Delivery from a Booking’s client
- **THEN** the Delivery is linked to that Person (and booking when selected)
