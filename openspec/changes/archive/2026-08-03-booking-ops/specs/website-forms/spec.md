## MODIFIED Requirements

### Requirement: Booking questions builder (no contact inquiry builder)
The Website hub SHALL let the photographer edit **booking questions** (max 8) and related booking help/calendar toggles. It SHALL NOT expose a public **contact inquiry field builder** used to post general contact messages from the frontend.

#### Scenario: Booking questions still editable
- **WHEN** the photographer updates booking questions in Website
- **THEN** the public booking form reflects those questions

#### Scenario: No contact inquiry builder for intake
- **WHEN** the photographer opens Website form settings
- **THEN** they do not configure a separate public contact-message form for inbox intake

## ADDED Requirements

### Requirement: Booking submit creates ops records
Public booking form submission SHALL upsert/match a Person and create a Booking in `needs_contact` with answers and preferred date/time. Booking is the sole public message intake — no parallel contact inquiry create.

#### Scenario: Form creates needs_contact booking
- **WHEN** a visitor completes booking submit successfully
- **THEN** Clients → Bookings shows a new `needs_contact` booking for that Person

### Requirement: Nigeria phone input on booking form
The public booking phone field SHALL present a fixed **`+234` prefix** with an editable national number segment. If the user enters a leading `0` on that segment (immediately after the country code), the system SHALL strip that `0` before save/match.

#### Scenario: Strip trunk zero after +234
- **WHEN** a visitor enters national digits starting with `0` (e.g. `08031234567`) with prefix `+234`
- **THEN** the stored phone is normalized as `+2348031234567` (not `+2340803…`)

#### Scenario: Placeholder guides local digits
- **WHEN** the booking form phone control is shown
- **THEN** the prefix reads `+234` and the input placeholder indicates the remaining local digits
