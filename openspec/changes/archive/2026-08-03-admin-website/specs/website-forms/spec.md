## Purpose

Single Contact-style editor for public contact inquiry fields and booking request questions, with a capped question set.

## ADDED Requirements

### Requirement: Contact and booking questions together
Authenticated photographers SHALL configure contact form fields and booking questions in the same Website Contact editor.

#### Scenario: Edit booking questions beside contact fields
- **WHEN** the photographer opens the Contact editor
- **THEN** they can edit both contact inquiry fields and booking questions in that place

### Requirement: Booking questions max entries
Booking questions SHALL support a photographer-defined set with a maximum of 8 questions.

#### Scenario: Cap booking questions
- **WHEN** the photographer already has 8 booking questions
- **THEN** the system prevents adding another until one is removed

### Requirement: Request calendar configuration
Booking form configuration SHALL include a request calendar where clients pick any preferred date and time (not photographer availability slots).

#### Scenario: Calendar is request-any-time
- **WHEN** booking form settings are enabled
- **THEN** clients can pick any date/time as a request without auto-confirmed availability
