## ADDED Requirements

### Requirement: Studio users are not publicly creatable
The public users API SHALL NOT create a Studio account. The first photographer account SHALL be created only by the seed path or PocketBase Admin. A later Studio user, if ever added, SHALL also be created only by an operator using Admin or seed — not by an unauthenticated POST.

#### Scenario: Guest signup rejected
- **WHEN** an unauthenticated client POSTs a new users record
- **THEN** the create is rejected and no Studio session can be obtained from that attempt

#### Scenario: Seed still works
- **WHEN** an operator runs the seed script with configured email and password
- **THEN** a Studio-capable photographer account exists and can log in at `/studio`
