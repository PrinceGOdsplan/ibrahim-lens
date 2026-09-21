## Purpose

Manage booking requests submitted from the public booking form so the photographer can confirm or follow up from Studio.

## ADDED Requirements

### Requirement: Review booking requests
Authenticated photographers SHALL review booking requests under Clients → Bookings, including requested date/time and answers to custom questions.

#### Scenario: New booking appears
- **WHEN** a visitor submits a booking request
- **THEN** it appears in Clients → Bookings with request details

### Requirement: Confirm or contact workflow
Booking handling SHALL be request-only: the photographer can confirm or mark that the client needs to be contacted about changes, without auto-confirming from the calendar.

#### Scenario: Confirm booking
- **WHEN** the photographer confirms a booking request
- **THEN** the booking status reflects confirmation in Studio

#### Scenario: Needs client contact
- **WHEN** the photographer marks that changes require contacting the client
- **THEN** the booking status reflects that follow-up state
