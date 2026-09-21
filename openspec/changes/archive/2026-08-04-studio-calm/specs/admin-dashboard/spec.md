## MODIFIED Requirements

### Requirement: Needs-you attention queue
The Dashboard SHALL surface actionable items such as bookings that need a reply, unpaid/partial confirmed work, unread feedback, and deliveries nearing expiry. Items SHOULD deep-link into the calm Today queue or the specific booking context — not only a dense Bookings cockpit with create form and all panels open.

#### Scenario: Photographer opens dashboard with pending work
- **WHEN** actionable items exist
- **THEN** the Dashboard Needs you area lists them with navigation to the relevant Clients view

#### Scenario: Needs contact bookings appear
- **WHEN** bookings exist in `needs_contact`
- **THEN** they appear in Needs you until status changes

#### Scenario: Handoff to Today
- **WHEN** the photographer opens a Needs you booking item
- **THEN** they land on Today or a focused booking view suitable for the next action
