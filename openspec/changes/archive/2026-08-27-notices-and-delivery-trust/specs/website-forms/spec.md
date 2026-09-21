## ADDED Requirements

### Requirement: Booking submit resists automated bulk create
Public booking form submission SHALL reject automated bulk creates (hidden trap fields and/or origin rate limiting) so a script cannot fill Bookings. A genuine visitor completing the visible fields SHALL still create at most one Person match and one `needs_contact` Booking per successful submit. The form SHALL NOT require an account.

The photographer SHALL NOT be asked to moderate a CAPTCHA as the default path. A visible challenge MAY be added only if trap fields and rate limits are insufficient.

#### Scenario: Hidden trap filled
- **WHEN** a submit includes a filled hidden trap field that a visitor does not see
- **THEN** no Person or Booking is created

#### Scenario: Genuine visitor
- **WHEN** a visitor completes the visible booking fields and submits once
- **THEN** Clients → Bookings shows a new `needs_contact` booking for that Person as today

#### Scenario: Rapid automated repeats
- **WHEN** the same origin submits many booking creates in a short window
- **THEN** later creates in that window are rejected and do not each become a Booking
