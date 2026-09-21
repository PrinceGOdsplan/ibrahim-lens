## ADDED Requirements

### Requirement: Snapshot client email at Delivery create
When creating a Delivery, the system SHALL snapshot a client email if the photographer types one on the create form, or if they select a saved Person who has an email and no override is typed. That snapshotted value SHALL be the only address used for that Delivery’s client mail. A Person without email and a blank form field SHALL create the Delivery with no snapshotted email.

#### Scenario: Typed email
- **WHEN** the photographer enters a client email on Create delivery and saves
- **THEN** that address is stored on the Delivery and later Person edits do not replace it

#### Scenario: Person with email selected
- **WHEN** the photographer selects a saved Person who has an email, leaves the email field empty, and creates the Delivery
- **THEN** the Person’s email at create time is stored on the Delivery

#### Scenario: Person without email
- **WHEN** the photographer selects a saved Person who has no email and does not type an email
- **THEN** the Delivery is created with no snapshotted email

### Requirement: First download is recorded on the Delivery
The first successful client download from a live Delivery SHALL be recorded on that Delivery. Viewing the gallery SHALL NOT set that record. Subsequent downloads SHALL NOT clear or multiply the first-download record.

#### Scenario: First file taken
- **WHEN** a client downloads an original from a Delivery that has no first-download record
- **THEN** the Delivery is marked as downloaded and Inbox may still log the activity

#### Scenario: View only
- **WHEN** a client opens `/g/:token` and does not download
- **THEN** the Delivery is not marked as downloaded
