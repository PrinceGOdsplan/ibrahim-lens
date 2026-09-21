## ADDED Requirements

### Requirement: Download is distinct from view for notices
A client download of an original SHALL be the event that may trigger client downloaded mail and that suppresses client expiry mail, as specified in `studio-notifications`. Opening the gallery or viewing a frame SHALL NOT trigger those mails.

#### Scenario: Open gallery without download
- **WHEN** a client opens a valid Delivery link and looks at photographs without downloading
- **THEN** they still see the countdown and images, and no download or expiry-suppression side effect of a download occurs
