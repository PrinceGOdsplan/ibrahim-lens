## ADDED Requirements

### Requirement: Contact voice from Contact and booking
`/contact` SHALL use Contact H1 and intro from Website Contact & booking when set, defaulting H1 to “Let’s shoot”.

#### Scenario: Default Let’s shoot
- **WHEN** Contact H1 is unset
- **THEN** `/contact` still shows Let’s shoot

## MODIFIED Requirements

### Requirement: Contact page shows booking, not a separate hello form
The public Contact page SHALL present the shared booking form under the Contact heading/intro from Contact & booking, then photographer contact details (phone, email, location, WhatsApp when phone is set). It SHALL NOT offer a separate general contact inquiry form that creates inbox contact messages.

#### Scenario: Visitor opens Contact
- **WHEN** a visitor opens `/contact`
- **THEN** they can submit a booking request, see displayed reach-me details and WhatsApp under booking when configured, and do not see a separate contact-message form

### Requirement: Contact details
The system SHALL display configured public contact details on `/contact` below the booking section, sourced from Website Contact & booking reach-me fields.

#### Scenario: Details configured
- **WHEN** public contact details are set in Contact & booking
- **THEN** those details appear on `/contact` under the booking section
