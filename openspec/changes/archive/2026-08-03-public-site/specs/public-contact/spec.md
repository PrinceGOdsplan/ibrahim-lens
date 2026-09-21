## Purpose

Contact page combining inquiry form, FAQ, contact details, and a booking request section that shares the Home booking form definition.

## ADDED Requirements

### Requirement: Contact form submission
The system SHALL accept a validated contact inquiry on `/contact` and store it for Studio Inbox review.

#### Scenario: Successful inquiry
- **WHEN** a visitor submits a valid contact form
- **THEN** the inquiry is accepted and becomes visible in Clients → Inbox

### Requirement: FAQ on contact
The system SHALL display FAQ content on the contact page when FAQ entries exist.

#### Scenario: FAQ present
- **WHEN** FAQ content is published
- **THEN** visitors can read it on `/contact` without a separate FAQ primary nav page

### Requirement: Contact details
The system SHALL display configured public contact details on `/contact`.

#### Scenario: Details configured
- **WHEN** public contact details are set in Website globals
- **THEN** those details appear on `/contact`

### Requirement: Booking section
The Contact page SHALL include a booking request section using the same form definition as the Home Book CTA scroll target, including custom questions (max 8) and a request calendar for any date/time.

#### Scenario: Submit booking request
- **WHEN** a visitor submits a valid booking request from Contact
- **THEN** the request appears for management under Clients → Bookings and Inbox

#### Scenario: Pick any date time
- **WHEN** a visitor uses the booking calendar
- **THEN** they may select any preferred date and time as a request without auto-confirmation
