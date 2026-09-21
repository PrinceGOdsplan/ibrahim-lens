## MODIFIED Requirements

### Requirement: Person history
Opening a Person SHALL show their linked bookings (and deliveries when linked). Daily Studio navigation SHALL treat People as secondary to Today/Bookings — reachable from a booking’s client link or a Directory entry — not as an equal default peer tab that must be visited every session.

#### Scenario: View booking history on person
- **WHEN** the photographer opens a Person who has bookings
- **THEN** those bookings are listed with status and key money fields

#### Scenario: Open person from booking
- **WHEN** the photographer chooses to view the client from a booking
- **THEN** they can reach that Person’s details without People being the default Clients landing
