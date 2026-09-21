## Purpose

Studio Settings for photographer account management and portfolio tags, with room to add email notifications later.

## ADDED Requirements

### Requirement: Account settings
Authenticated photographers SHALL update account/profile settings and password from Settings.

#### Scenario: Update profile
- **WHEN** the photographer saves profile settings
- **THEN** the updated values persist for subsequent Studio sessions

#### Scenario: Change password
- **WHEN** the photographer changes password with valid current credentials
- **THEN** subsequent logins require the new password

### Requirement: Portfolio tags in Settings
Authenticated photographers SHALL manage the simple portfolio tag list from Settings.

#### Scenario: Add portfolio tag
- **WHEN** the photographer creates a tag under Settings → Portfolio tags
- **THEN** the tag is available for assignment on Portfolio images in Library

### Requirement: No email provider in v1
Settings SHALL NOT require configuring an email provider to use Studio in v1.

#### Scenario: Studio usable without email settings
- **WHEN** the photographer uses Studio without email provider configuration
- **THEN** core Inbox/Bookings/Deliveries workflows still function in-app

### Requirement: Future notification extension point
The system design SHALL allow a later notification/email provider integration without changing Delivery or Booking core behaviors.

#### Scenario: Extension point documented
- **WHEN** implementers review Settings/design for notifications
- **THEN** a later email notification hook can be added without redesigning Deliveries or Bookings
