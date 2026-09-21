## REMOVED Requirements

### Requirement: No email provider in v1
**Reason**: Outbound mail is now optional and configured in Settings → Notifications. Studio must still run if mail is unset.
**Migration**: Use “Outbound mail is optional” below and `studio-notifications`.

### Requirement: Future notification extension point
**Reason**: The extension point is the Notifications settings themselves.
**Migration**: Photographers configure notices in Settings → Notifications as specified in `studio-notifications`.

## ADDED Requirements

### Requirement: Outbound mail is optional
Settings SHALL NOT require an email provider for Studio hubs to function. Bookings, Deliveries, and Inbox SHALL continue to work when outbound mail is unset. When the photographer configures outbound mail, Settings → Notifications SHALL persist the notify address, photographer away-notice toggle, and client gallery-ready toggle.

#### Scenario: Studio usable without email settings
- **WHEN** the photographer uses Studio without outbound mail configured
- **THEN** core Inbox, Bookings, and Deliveries workflows still function in-app

#### Scenario: Notifications tab is live
- **WHEN** the photographer opens Settings → Notifications
- **THEN** they can set the notify address and enable or disable the notice types rather than reading a “later” placeholder
