## Purpose

Public Contact page and site forms: booking is the only visitor message intake from the frontend.

## MODIFIED Requirements

### Requirement: Contact page shows booking, not a separate hello form
The public Contact page SHALL present photographer contact details (from globals) and the shared booking form. It SHALL NOT offer a separate general “contact / say hello” inquiry form that creates inbox contact messages.

#### Scenario: Visitor opens Contact
- **WHEN** a visitor opens `/contact`
- **THEN** they can submit a booking request and see displayed email/phone/location if configured, without a separate contact-message form

## ADDED Requirements

### Requirement: Booking is sole public intake channel
Incoming visitor messages from the public frontend SHALL enter Studio only via the booking form (Person + Booking). Contact-kind form inquiries SHALL NOT be created from the public site in this product direction.

#### Scenario: No public contact inquiry create
- **WHEN** a visitor uses the public site to reach the photographer
- **THEN** the path is booking submit (or static displayed contact details), not a contact-inquiry form post
