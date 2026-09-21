## ADDED Requirements

### Requirement: Booking before contact details
The Contact page SHALL present the booking request section before displayed contact details. Contact details (email, phone, location) and WhatsApp SHALL appear under the booking section as secondary direct-contact options. Contact H1 SHALL remain “Let’s shoot”.

#### Scenario: Contact stack order
- **WHEN** a visitor opens `/contact`
- **THEN** they encounter Let’s shoot, then booking first, then contact details and WhatsApp below it, then FAQ when present

### Requirement: WhatsApp under booking submit
When a public phone number is configured, Contact SHALL offer WhatsApp as a quiet secondary control associated with the booking form (under or immediately after primary submit), in addition to listing WhatsApp with contact details. WhatsApp SHALL NOT use solid brass primary styling or official green WhatsApp chrome.

#### Scenario: WhatsApp always with form
- **WHEN** contact phone is configured and a visitor views the Contact booking form
- **THEN** a WhatsApp option is available without replacing the booking submit control

## MODIFIED Requirements

### Requirement: Contact page shows booking, not a separate hello form
The public Contact page SHALL present the shared booking form first under the Let’s shoot heading, then photographer contact details (from globals) including WhatsApp when phone is set. It SHALL NOT offer a separate general “contact / say hello” inquiry form that creates inbox contact messages.

#### Scenario: Visitor opens Contact
- **WHEN** a visitor opens `/contact`
- **THEN** they can submit a booking request, see displayed email/phone/location and WhatsApp under booking when configured, and do not see a separate contact-message form

### Requirement: Contact details
The system SHALL display configured public contact details on `/contact` below the booking section.

#### Scenario: Details configured
- **WHEN** public contact details are set in Website globals
- **THEN** those details appear on `/contact` under the booking section
