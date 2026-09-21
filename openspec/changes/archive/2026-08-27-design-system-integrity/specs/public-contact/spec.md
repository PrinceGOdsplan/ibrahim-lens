## MODIFIED Requirements

### Requirement: Contact details
The system SHALL display configured public contact details on `/contact` below the booking section, sourced from Website Contact & booking reach-me fields.

A published email address SHALL be actionable as an email link, and a published phone number SHALL be actionable as a dial link, so a visitor on a phone can act on them directly instead of selecting and copying the text by hand. The displayed phone number SHALL be readable as a grouped number rather than an unbroken digit string, while the underlying dial target uses the stored international form.

#### Scenario: Details configured
- **WHEN** public contact details are set in Contact & booking
- **THEN** those details appear on `/contact` under the booking section

#### Scenario: Visitor taps the phone number

- **WHEN** a visitor on a phone taps the published phone number
- **THEN** their dialler opens with that number

#### Scenario: Visitor taps the email address

- **WHEN** a visitor taps the published email address
- **THEN** their mail client opens addressed to it

#### Scenario: Phone number readability

- **WHEN** a published phone number is displayed
- **THEN** it is grouped for reading rather than shown as a single run of digits

### Requirement: Booking section
The Contact page SHALL include a booking request section using the same form definition as the Home Book CTA scroll target, including custom questions (max 8) and a request calendar for any date/time.

On Contact, the booking section SHALL NOT repeat a heading and lead paragraph beneath the page's own H1 and lead, since the page exists for booking and the two pairs would say overlapping things. The shared form SHALL be able to render without its own heading block so the host page controls the heading hierarchy.

#### Scenario: Submit booking request
- **WHEN** a visitor submits a valid booking request from Contact
- **THEN** the request appears for management under Clients → Bookings and Inbox

#### Scenario: Pick any date time
- **WHEN** a visitor uses the booking calendar
- **THEN** they may select any preferred date and time as a request without auto-confirmation

#### Scenario: Contact heading hierarchy

- **WHEN** a visitor opens `/contact`
- **THEN** they read one heading and one lead for the page, not a second heading and lead immediately beneath them

#### Scenario: Home booking section keeps its heading

- **WHEN** a visitor reaches the booking section on Home
- **THEN** that section still carries its own heading, because Home is not otherwise about booking
