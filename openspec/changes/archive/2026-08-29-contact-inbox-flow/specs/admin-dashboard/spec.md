## MODIFIED Requirements

### Requirement: Needs-you attention queue
The Dashboard SHALL surface actionable items: Inbox booking requests (`needs_contact`), unread Write messages, unpaid/partial confirmed work, unreviewed feedback, and deliveries nearing expiry.

#### Scenario: Photographer opens dashboard with pending work
- **WHEN** actionable items exist
- **THEN** the Dashboard Needs you area lists them with navigation to Inbox for requests and messages, Bookings for unpaid accepted jobs, and Clients for feedback and expiring Deliveries

#### Scenario: Needs contact bookings appear
- **WHEN** bookings exist in `needs_contact`
- **THEN** they appear in Needs you until accepted or deleted, linking to Inbox

#### Scenario: Unread Write appears
- **WHEN** an unread contact inquiry exists
- **THEN** Needs you lists it linking to Inbox Messages
