# admin-settings Specification

## Purpose
Studio Settings for photographer account management, portfolio tags, and optional outbound mail notices.

## Requirements

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

### Requirement: Outbound mail is optional
Settings SHALL NOT require an email provider for Studio hubs to function. Bookings, Deliveries, and Inbox SHALL continue to work when outbound mail is unset. When outbound mail is configured, Settings → Notifications SHALL persist the notify address and the notice matrix specified in `studio-notifications`. Settings → Notifications SHALL show whether outbound mail appears configured and the last send success or error, and SHALL offer a test send that does not change Bookings or Deliveries.

#### Scenario: Studio usable without email settings
- **WHEN** the photographer uses Studio without outbound mail configured
- **THEN** core Inbox, Bookings, and Deliveries workflows still function in-app

#### Scenario: Notifications tab is live
- **WHEN** the photographer opens Settings → Notifications
- **THEN** they can set the notify address and enable or disable Email, In-app, and Mobile (when install allows) per photographer event, plus client gallery-ready and expiry mail, rather than reading a “later” placeholder

#### Scenario: Health when unset
- **WHEN** outbound mail is not configured
- **THEN** Settings → Notifications shows that email notices are off

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

### Requirement: Settings has no Assistant chrome
Settings SHALL NOT show Assistant status, model names, or a credit line. Studio hubs SHALL keep working when Assistant is unset, the same way they work without outbound mail. Credit and setup messages SHALL appear only in the Assistant chat.

#### Scenario: Account tab
- **WHEN** the photographer opens Settings → Account
- **THEN** there is no Assistant heading for status or credit, and other Settings tabs still work
