## MODIFIED Requirements

### Requirement: Booking submit creates ops records
Public booking form submission SHALL upsert/match a Person and create a Booking in `needs_contact` with answers and preferred date/time. Write is a separate intake and SHALL NOT create a Booking. A single completed booking form SHALL create at most one Person match and one Booking: while a submission is in flight the form SHALL prevent further submissions.

The Person match SHALL be performed by the server from the submitted name and phone. The visitor SHALL NOT list or create People through the People API. The visitor SHALL NOT set booking status, source, fee, amount paid, or studio notes; the server SHALL force `needs_contact` and `website` and SHALL store those money and note fields empty.

#### Scenario: Form creates needs_contact booking
- **WHEN** a visitor completes booking submit successfully
- **THEN** Clients → Inbox shows a new `needs_contact` request for that Person

#### Scenario: Repeated submit activation
- **WHEN** a visitor activates the submit control repeatedly while a submission is in flight
- **THEN** only one Booking is created

#### Scenario: Guest cannot choose operator fields
- **WHEN** a visitor submits a booking create that includes a confirmed status, a non-website source, or money fields
- **THEN** the stored booking is still `needs_contact` with source `website` and empty money and studio notes

### Requirement: Booking submit resists automated bulk create
Public booking form submission SHALL reject automated bulk creates (hidden trap fields and/or origin rate limiting) so a script cannot fill Inbox with requests. A genuine visitor completing the visible fields SHALL still create at most one Person match and one unaccepted Booking per successful submit. The form SHALL NOT require an account.

The guest booking rate limit SHALL count every unauthenticated booking create in the window, regardless of the source value sent in the request.

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

#### Scenario: Non-website source does not skip the window
- **WHEN** an unauthenticated create sends a source other than website
- **THEN** it still counts toward the guest booking rate limit and is still stored as website

### Requirement: Public Write submit
Public Write SHALL create one `form_inquiries` record with `kind` `contact` (name, phone, message, trap). The server MAY upsert a Person from the phone so the photographer can reach them. The visitor SHALL NOT create or list People through the People API. Write SHALL NOT create a Booking.

Unauthenticated clients SHALL NOT create `form_inquiries` with a kind other than `contact`.

#### Scenario: Write lands in Inbox
- **WHEN** a visitor submits Write successfully
- **THEN** Inbox Messages shows that inquiry

#### Scenario: Guest cannot write a download event
- **WHEN** an unauthenticated client creates a form inquiry whose kind is not `contact`
- **THEN** the create is rejected
