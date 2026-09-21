## ADDED Requirements

### Requirement: In-app notices open from the app header
When Studio shows in-app notices, the control SHALL live in the Studio app header. Opening it SHALL present a list docked to that header. The list SHALL NOT cover the entire hub pane as a full-width overlay. Clearing or following a notice SHALL behave as today.

#### Scenario: Open notices
- **WHEN** the photographer activates Notices in the app header
- **THEN** they see the notice list attached to the header, and the hub surface remains the work area underneath

#### Scenario: Follow a notice
- **WHEN** the photographer opens a notice
- **THEN** they land on the linked hub and the notice is dismissed
