## MODIFIED Requirements

### Requirement: Outbound mail is optional
Settings SHALL NOT require an email provider for Studio hubs to function. Bookings, Deliveries, and Inbox SHALL continue to work when outbound mail is unset. When the photographer configures outbound mail, Settings → Notifications SHALL persist the notify address and the notice matrix specified in `studio-notifications`.

#### Scenario: Studio usable without email settings
- **WHEN** the photographer uses Studio without outbound mail configured
- **THEN** core Inbox, Bookings, and Deliveries workflows still function in-app

#### Scenario: Notifications tab is live
- **WHEN** the photographer opens Settings → Notifications
- **THEN** they can set the notify address and enable or disable Email, In-app, and Mobile (when install allows) per photographer event, plus client gallery mail rows, rather than reading a “later” placeholder
