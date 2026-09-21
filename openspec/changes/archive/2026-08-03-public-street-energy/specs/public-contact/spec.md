## ADDED Requirements

### Requirement: Booking before contact details
The Contact page SHALL present the booking request section before displayed contact details. Contact details (email, phone, location) and WhatsApp SHALL appear under the booking section as secondary direct-contact options.

#### Scenario: Contact stack order
- **WHEN** a visitor opens `/contact`
- **THEN** they encounter booking first, then contact details and WhatsApp below it, then FAQ when present

### Requirement: WhatsApp as direct photographer contact
When a public phone number is configured, Contact SHALL offer a WhatsApp link as a secondary way to contact the photographer directly (not as a hero CTA).

#### Scenario: WhatsApp on Contact
- **WHEN** contact phone is configured
- **THEN** a WhatsApp link appears with contact details under the booking section

## MODIFIED Requirements

### Requirement: Contact page shows booking, not a separate hello form
The public Contact page SHALL present the shared booking form first, then photographer contact details (from globals) including WhatsApp when phone is set. It SHALL NOT offer a separate general “contact / say hello” inquiry form that creates inbox contact messages.

#### Scenario: Visitor opens Contact
- **WHEN** a visitor opens `/contact`
- **THEN** they can submit a booking request, see displayed email/phone/location and WhatsApp under booking when configured, and do not see a separate contact-message form

### Requirement: Contact details
The system SHALL display configured public contact details on `/contact` below the booking section.

#### Scenario: Details configured
- **WHEN** public contact details are set in Website globals
- **THEN** those details appear on `/contact` under the booking section
