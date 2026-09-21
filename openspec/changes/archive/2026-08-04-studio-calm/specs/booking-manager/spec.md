## MODIFIED Requirements

### Requirement: Editable with history
Bookings SHALL remain editable (status, schedule fields, notes, Person link, money) while every material change is recorded in the audit log capability. Studio presentation SHALL use progressive disclosure: core identity and status first; money and history not all forced visible at once.

#### Scenario: Edit after confirm
- **WHEN** the photographer changes a confirmed booking’s preferred time
- **THEN** the booking updates and an audit event is recorded

#### Scenario: Money behind a step
- **WHEN** the photographer opens a booking that is not yet collecting payment
- **THEN** fee and amount paid controls are not required to be visible until they choose to add/record payment (or the booking is confirmed and they enter Collect)

## ADDED Requirements

### Requirement: Quiet create booking
Creating a booking in Studio SHALL be available via an explicit New control (drawer, modal, or secondary panel), not a permanent full create form above the list by default.

#### Scenario: New booking on demand
- **WHEN** the photographer chooses New booking
- **THEN** they can create a manual booking; when they are only triaging Today, the create form is not dominating the screen
