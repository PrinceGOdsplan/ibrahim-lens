## MODIFIED Requirements

### Requirement: Needs-you attention queue
The Dashboard SHALL surface actionable items such as unaccepted website booking requests (Inbox), unread feedback, and deliveries nearing expiry. It SHALL NOT list “Needs a reply” booking chores or Collect-payment chase rows. Public contact-form messages are not an intake source. Unpaid balances are shown as finance totals, not as Needs-you tasks.

#### Scenario: Photographer opens dashboard with pending work
- **WHEN** actionable items exist
- **THEN** the Dashboard Needs you area lists them with navigation to Inbox, Feedback, or Deliveries as applicable

#### Scenario: Unaccepted booking requests appear
- **WHEN** unaccepted website booking requests exist
- **THEN** they appear in Needs you until accepted or deleted, linking to Inbox

### Requirement: Pipeline snapshots
The Dashboard SHALL show count snapshots for Inbox (unaccepted booking requests), Deliveries, and Feedback pipelines.

#### Scenario: Pipeline counts visible
- **WHEN** the photographer opens Dashboard
- **THEN** they see pipeline counts that link through to Inbox, Deliveries, or Feedback where applicable

### Requirement: Booking pipeline counts
Pipeline snapshots SHALL include a count of unaccepted website booking requests (Inbox), not a “Needs a reply” booking-hub filter and not Collect.

#### Scenario: Pipeline reflects inbox requests
- **WHEN** the photographer opens Dashboard
- **THEN** the booking-request pipeline number matches unaccepted requests in Inbox

### Requirement: Quick actions
The Dashboard SHALL provide quick actions such as upload to Gallery, create Delivery, and open the Bookings hub.

#### Scenario: Use quick action
- **WHEN** the photographer uses a Dashboard quick action to open bookings
- **THEN** they are taken to the Bookings hub
