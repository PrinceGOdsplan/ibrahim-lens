## MODIFIED Requirements

### Requirement: Booking questions builder (no contact inquiry builder)
The Website Contact & booking tab SHALL let the photographer edit booking questions (max 8) and related booking help/calendar toggles together with Contact page voice and reach-me fields. It SHALL NOT expose a public contact inquiry field builder or `contact_fields` intake path used to post general contact messages from the frontend.

#### Scenario: Booking questions still editable
- **WHEN** the photographer updates booking questions in Contact & booking
- **THEN** the public booking form reflects those questions

#### Scenario: No contact inquiry builder for intake
- **WHEN** the photographer opens Contact & booking
- **THEN** they do not configure a separate public contact-message form for inbox intake

## ADDED Requirements

### Requirement: Contact page voice in booking editor
Contact & booking SHALL allow editing Contact H1 (default “Let’s shoot”) and a short intro line used on `/contact` above the booking form.

#### Scenario: Custom Contact intro
- **WHEN** the photographer saves a Contact intro
- **THEN** `/contact` shows that intro above booking
