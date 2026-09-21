## MODIFIED Requirements

### Requirement: Unified inbox
The system SHALL present booking-related alerts, feedback, and delivery-related events in Clients → Inbox with a type discriminator. Public **contact** form messages are out of scope — bookings are the sole public intake channel.

#### Scenario: Booking arrives
- **WHEN** a visitor submits the public booking form
- **THEN** the photographer works from Bookings (and may see a booking-linked inbox item), not a separate contact inquiry

#### Scenario: Delivery event arrives
- **WHEN** a Delivery is downloaded or receives feedback
- **THEN** a corresponding inbox item can appear for the photographer
