## ADDED Requirements

### Requirement: Change login email while signed in
Authenticated photographers SHALL be able to change their Studio login email from Settings → Account by confirming the current password. The system SHALL update the account immediately for that session without requiring a confirm link to the new inbox.

#### Scenario: Successful email change
- **WHEN** the photographer submits a new email with the correct current password
- **THEN** the login identity becomes the new email and Studio continues with a refreshed session

#### Scenario: Wrong password
- **WHEN** the photographer submits a new email with an incorrect current password
- **THEN** the email is not changed and an error is shown

### Requirement: Forgot password on Sign in
The Studio Sign-in page SHALL allow the photographer to request a password-reset email to their login address when outbound mail is configured. Completing the reset link SHALL let them set a new password and sign in.

#### Scenario: Request reset
- **WHEN** the photographer requests a password reset with a known Studio email and SMTP is enabled
- **THEN** a reset message is sent and Sign in does not reveal whether other addresses exist beyond a generic confirmation

#### Scenario: SMTP unset
- **WHEN** outbound mail is not configured and the photographer requests a password reset
- **THEN** the system shows that mail is unavailable and does not pretend a message was sent

### Requirement: Profile photo on the Studio user
The photographer account SHALL support an optional profile photo used in the Studio header and Dashboard greeting.

#### Scenario: Upload photo
- **WHEN** the photographer uploads a profile photo under Settings → Profile
- **THEN** the photo is stored on the user record and shown in Studio chrome
