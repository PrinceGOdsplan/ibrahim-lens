## ADDED Requirements

### Requirement: Removing an unreferenced person

Removing a booking SHALL NOT remove the person it was linked to, because a person can hold other bookings and deliveries. When removing a booking leaves that person with no bookings and no deliveries, Studio SHALL offer to remove the person as a separate, declinable step.

A person that is still referenced by any booking or delivery SHALL NOT be removable.

#### Scenario: Person left with nothing

- **WHEN** removing a booking leaves its person with no bookings and no deliveries
- **THEN** Studio offers to remove that person, and declining leaves the person in the directory

#### Scenario: Person still has other bookings

- **WHEN** removing a booking leaves its person with at least one other booking
- **THEN** the person is retained and no removal is offered

#### Scenario: Referenced person cannot be removed

- **WHEN** the photographer attempts to remove a person that a booking or delivery references
- **THEN** the removal does not run and the reference is identified
