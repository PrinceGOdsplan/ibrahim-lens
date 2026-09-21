## MODIFIED Requirements

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
