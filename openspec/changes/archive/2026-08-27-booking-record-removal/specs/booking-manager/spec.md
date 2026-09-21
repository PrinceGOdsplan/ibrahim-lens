## ADDED Requirements

### Requirement: Permanent booking removal

Studio SHALL provide an action that permanently removes a booking record. Removal is distinct from the status lifecycle: a status of `cancelled` records that an engagement will not happen, whereas removal is for records that should not exist at all, such as test submissions, spam, and duplicates.

Removal SHALL require an explicit confirmation that names the person the booking belongs to and states that the booking and its history will be removed and cannot be recovered. Removal SHALL NOT be offered as the primary action on a booking, so it cannot be reached by mistake while working through the queue.

#### Scenario: Remove a junk booking

- **WHEN** the photographer confirms removal of a booking
- **THEN** that booking no longer appears in Bookings, and the counts that included it are reduced

#### Scenario: Cancel the confirmation

- **WHEN** the photographer dismisses the removal confirmation
- **THEN** the booking is unchanged

#### Scenario: Removal is separate from cancelling

- **WHEN** the photographer sets a booking's status to `cancelled`
- **THEN** the booking remains in the Booking Manager with its history intact

### Requirement: Removal is blocked by a referencing delivery

A booking SHALL NOT be removable while a delivery references it. The photographer SHALL be told which delivery blocks the removal, so they can revoke or reassign it first.

#### Scenario: Booking has a delivery

- **WHEN** the photographer attempts to remove a booking that a delivery references
- **THEN** the removal does not run and the blocking delivery is identified

#### Scenario: Delivery removed first

- **WHEN** the referencing delivery no longer points at the booking and the photographer retries
- **THEN** the removal proceeds
