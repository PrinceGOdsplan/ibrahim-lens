## MODIFIED Requirements

### Requirement: First download is recorded on the Delivery
The first successful client download of an original from a live Delivery SHALL be recorded on that Delivery by the server when it serves that original file. Viewing the gallery SHALL NOT set that record. Subsequent downloads SHALL NOT clear or multiply the first-download record.

A guest SHALL NOT record a download by creating a form inquiry or any other unauthenticated write. Inbox MAY still log the activity; that log SHALL be written by the server after the file is served.

#### Scenario: First file taken
- **WHEN** a client downloads an original from a Delivery that has no first-download record
- **THEN** the Delivery is marked as downloaded and Inbox may still log the activity

#### Scenario: View only
- **WHEN** a client opens `/g/:token` and does not download
- **THEN** the Delivery is not marked as downloaded

#### Scenario: Inquiry cannot stamp download
- **WHEN** an unauthenticated client creates a form inquiry that claims a download
- **THEN** the Delivery’s first-download record does not change
