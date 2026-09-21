## MODIFIED Requirements

### Requirement: Studio route identity
Each Studio hub SHALL set a document title identifying the hub, and deep state that determines what a hub displays — selected tab, room, sub-tab, or Bookings view — SHALL be represented in the address so it survives reload, back navigation, and sharing.

#### Scenario: Reload a Studio tab
- **WHEN** the photographer selects a tab within a Studio hub and reloads
- **THEN** the same tab is presented

#### Scenario: Back navigation within a hub
- **WHEN** the photographer switches tabs within a hub and navigates back
- **THEN** the previously selected tab is presented

#### Scenario: Reload a Bookings view
- **WHEN** the photographer opens Incomplete on the Bookings hub and reloads
- **THEN** Incomplete is still presented
