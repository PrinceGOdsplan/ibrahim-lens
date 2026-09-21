## ADDED Requirements

### Requirement: Assistant may act on Settings allowlist
The authenticated Assistant path SHALL read and, after Confirm where required, update allowlisted Settings fields: profile display fields (non-secret), portfolio tags, notice matrix, and brand metadata. Tags, notice matrix, profile display name, and Assistant name MAY auto-apply. Password and login email changes SHALL require Confirm. File uploads for profile photo or brand assets SHALL use a Settings or upload sheet handoff. Settings SHALL still show no Assistant status chrome; capability and credit copy remain only in the Assistant thread.

#### Scenario: Add portfolio tag from chat
- **WHEN** the photographer asks Assistant to add a portfolio tag
- **THEN** the tag is available under Settings → Portfolio tags and for Library assignment

#### Scenario: Notice matrix from chat
- **WHEN** the photographer asks to turn off Email for a photographer booking event via Assistant
- **THEN** the notice matrix persists that row the same as saving from Settings → Notifications

#### Scenario: Profile photo via handoff
- **WHEN** the photographer asks Assistant to change the profile photo
- **THEN** Studio opens the Settings profile surface for file pick and does not send image bytes to the model

### Requirement: Settings edits Assistant identity
Settings SHALL let the photographer set the Assistant display name and upload or replace the Assistant profile picture. Settings SHALL still omit Assistant status, model names, token meters, and credit lines. Changing Assistant identity SHALL update the chat chrome on the next open without requiring a new Compose service.

#### Scenario: Rename Assistant
- **WHEN** the photographer saves a new Assistant name under Settings
- **THEN** the Assistant chat header shows that name

#### Scenario: Set Assistant picture
- **WHEN** the photographer uploads an Assistant profile picture in Settings
- **THEN** the Assistant chat shows that picture and the file is not sent to the language model

#### Scenario: No credit chrome
- **WHEN** the photographer opens the Settings section that edits Assistant identity
- **THEN** there is no model name, token count, or credit line on that surface
