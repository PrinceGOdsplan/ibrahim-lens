## ADDED Requirements

### Requirement: Directory phone saves when editing finishes
When editing an existing Person’s phone in Clients → People, Studio SHALL persist the number when the photographer leaves the field (or saves), not on each keystroke.

#### Scenario: Type a phone
- **WHEN** the photographer changes digits in an existing person’s phone and leaves the field
- **THEN** one update is stored with the completed number

### Requirement: Person query opens that person
Opening Clients → People with a person id in the address SHALL select that person in the directory.

#### Scenario: View client from a booking
- **WHEN** the photographer follows View client from a booking to People with that person’s id
- **THEN** that person is selected, not an empty directory
