## ADDED Requirements

### Requirement: First download does not email the client
Recording the first download on a Delivery SHALL NOT send email to the client. Expiry-if-not-downloaded mail MAY still use the download flag to suppress expiry reminders after a download.

#### Scenario: First download
- **WHEN** a client downloads an image from a Delivery for the first time
- **THEN** the gallery still provides the file and no “you downloaded” client email is sent
