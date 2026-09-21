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
Settings SHALL NOT require an email provider for Studio hubs to function. Bookings, Deliveries, and Inbox SHALL continue to work when outbound mail is unset. When the photographer configures outbound mail, Settings → Notifications SHALL persist the notify address and the notice matrix specified in `studio-notifications`.

#### Scenario: Studio usable without email settings
- **WHEN** the photographer uses Studio without outbound mail configured
- **THEN** core Inbox, Bookings, and Deliveries workflows still function in-app

#### Scenario: Notifications tab is live
- **WHEN** the photographer opens Settings → Notifications
- **THEN** they can set the notify address and enable or disable Email, In-app, and Mobile (when install allows) per photographer event, plus client gallery mail rows, rather than reading a “later” placeholder
