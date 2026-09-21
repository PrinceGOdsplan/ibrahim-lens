## MODIFIED Requirements

### Requirement: Privacy policy page
The system SHALL provide a Privacy page whose body content is managed from Website Site chrome (with a Soft night–suitable default when empty), explaining what inquiry/booking data is collected and how it is used. The default Privacy body SHALL also state that when Studio Assistant is used, a name, last-four phone digits, and booking or message text may be sent to the service that writes the replies.

#### Scenario: Visitor opens Privacy
- **WHEN** a visitor opens the Privacy page from the footer link
- **THEN** they see privacy policy content from Site chrome or the default

#### Scenario: Default mentions Assistant
- **WHEN** Privacy is using the shipped default body
- **THEN** that body includes the Studio Assistant sentence about data sent for replies
