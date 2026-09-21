## MODIFIED Requirements

### Requirement: Account settings
Authenticated photographers SHALL manage Profile and Account as separate Settings sections. Profile SHALL allow updating display name and profile photo. Account SHALL allow changing login email (with current password), and changing password with current credentials. Saving Profile or Account SHALL refresh the Studio session so the app header and greeting update without requiring a new login.

#### Scenario: Update profile
- **WHEN** the photographer saves name and/or photo under Settings → Profile
- **THEN** the values persist and the Studio header shows the new name or photo

#### Scenario: Change password
- **WHEN** the photographer changes password with valid current credentials under Settings → Account
- **THEN** subsequent logins require the new password

#### Scenario: Change login email
- **WHEN** the photographer saves a new login email with the current password under Settings → Account
- **THEN** subsequent logins use the new email and the session reflects it

### Requirement: Outbound mail is optional
Settings SHALL NOT require an email provider for Studio hubs to function. Bookings, Deliveries, and Inbox SHALL continue to work when outbound mail is unset. When outbound mail is configured, Settings → Notifications SHALL persist the notify address and the notice matrix for inbound photographer events (booking, Write message, feedback) plus client gallery-ready and client expiring-if-not-downloaded. Settings → Notifications SHALL show mail health (configured or not, last send success or error) and SHALL NOT offer client-downloaded mail or photographer upload / Portfolio email rows.

#### Scenario: Studio usable without email settings
- **WHEN** the photographer uses Studio without outbound mail configured
- **THEN** core Inbox, Bookings, and Deliveries workflows still function in-app

#### Scenario: Notifications tab is live
- **WHEN** the photographer opens Settings → Notifications
- **THEN** they can set the notify address, enable or disable Email / In-app / Mobile for inbound events, and client gallery-ready and expiry mail, and see whether outbound mail last succeeded or failed

## ADDED Requirements

### Requirement: Profile separate from site brand
Settings → Profile photo SHALL be the photographer’s Studio identity. Settings → Brand logo SHALL remain the public site mark and SHALL NOT replace the header avatar.

#### Scenario: Different marks
- **WHEN** the photographer has a brand logo and a profile photo
- **THEN** the Studio header uses the profile photo and the public site continues to use the brand logo
