## MODIFIED Requirements

### Requirement: Needs-you attention queue
The Dashboard SHALL surface actionable items such as bookings in `needs_contact`, unpaid/partial confirmed work, unread feedback, and deliveries nearing expiry. Public contact-form messages are not an intake source.

#### Scenario: Photographer opens dashboard with pending work
- **WHEN** actionable items exist
- **THEN** the Dashboard Needs you area lists them with navigation to the relevant Clients view

#### Scenario: Needs contact bookings appear
- **WHEN** bookings exist in `needs_contact`
- **THEN** they appear in Needs you until status changes

## ADDED Requirements

### Requirement: Booking pipeline counts
Pipeline snapshots SHALL include counts derived from Booking Manager statuses (at least needs_contact and confirmed), not only legacy form_inquiry rows.

#### Scenario: Pipeline reflects manager
- **WHEN** the photographer opens Dashboard
- **THEN** booking pipeline numbers match Booking Manager filters
