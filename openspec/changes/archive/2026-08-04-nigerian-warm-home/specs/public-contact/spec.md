## MODIFIED Requirements

### Requirement: Contact page shows booking, not a separate hello form
The public Contact page SHALL present photographer contact details (from globals) and the shared booking form using the warm cohesive public craft (editorial, non-card). It SHALL NOT offer a separate general “contact / say hello” inquiry form that creates inbox contact messages.

#### Scenario: Visitor opens Contact
- **WHEN** a visitor opens `/contact`
- **THEN** they can submit a booking request and see displayed email/phone/location if configured, without a separate contact-message form, in the warm public visual language
