## MODIFIED Requirements

### Requirement: Booking submit creates ops records
Public booking form submission SHALL upsert/match a Person and create a Booking in the unaccepted request state (`needs_contact`) with answers and preferred date/time. Booking is the sole public message intake — no parallel contact inquiry create. A single completed form SHALL create at most one Person match and one Booking: while a submission is in flight the form SHALL prevent further submissions, so repeated activation of the submit control cannot produce duplicate records. The new record SHALL appear in Inbox, not in the Bookings hub, until accepted.

#### Scenario: Form creates unaccepted inbox request
- **WHEN** a visitor completes booking submit successfully
- **THEN** Inbox shows a new unaccepted booking request for that Person and the Bookings hub does not list it yet

#### Scenario: Repeated submit activation
- **WHEN** a visitor activates the submit control repeatedly while a submission is in flight
- **THEN** only one Booking is created

### Requirement: Booking submit resists automated bulk create
Public booking form submission SHALL reject automated bulk creates (hidden trap fields and/or origin rate limiting) so a script cannot fill Inbox with requests. A genuine visitor completing the visible fields SHALL still create at most one Person match and one unaccepted Booking per successful submit. The form SHALL NOT require an account.

The photographer SHALL NOT be asked to moderate a CAPTCHA as the default path. A visible challenge MAY be added only if trap fields and rate limits are insufficient.

#### Scenario: Hidden trap filled
- **WHEN** a submit includes a filled hidden trap field that a visitor does not see
- **THEN** no Person or Booking is created

#### Scenario: Genuine visitor
- **WHEN** a visitor completes the visible booking fields and submits once
- **THEN** Inbox shows a new unaccepted booking request for that Person

#### Scenario: Rapid automated repeats
- **WHEN** the same origin submits many booking creates in a short window
- **THEN** later creates in that window are rejected and do not each become a Booking
