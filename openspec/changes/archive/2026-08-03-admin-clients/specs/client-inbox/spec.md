## Purpose

One Studio Inbox for contact inquiries, booking requests, feedback, and delivery-related events.

## ADDED Requirements

### Requirement: Unified inbox
The system SHALL present contact messages, booking requests, feedback alerts, and delivery events in Clients → Inbox with a type discriminator.

#### Scenario: Contact form arrives
- **WHEN** a visitor submits the public contact form
- **THEN** an inbox item of type contact appears

#### Scenario: Delivery event arrives
- **WHEN** a Delivery is downloaded or receives feedback
- **THEN** a corresponding inbox item can appear for the photographer

### Requirement: Deep links to focused tabs
Inbox items SHALL allow navigation to the relevant Bookings, Feedback, or Deliveries detail where applicable.

#### Scenario: Open booking from inbox
- **WHEN** the photographer opens a booking inbox item
- **THEN** they can reach the booking management view for that request
