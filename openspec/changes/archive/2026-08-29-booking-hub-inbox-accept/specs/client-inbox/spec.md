## ADDED Requirements

### Requirement: Accept or delete unaccepted booking requests
Inbox SHALL present each unaccepted website booking request with an Accept action and a Delete action. Feedback items SHALL NOT offer Accept. Unaccepted requests SHALL remain in Inbox until one of those actions.

#### Scenario: Accept moves to the hub
- **WHEN** the photographer accepts a booking request in Inbox
- **THEN** that booking leaves Inbox and appears in the Bookings hub as `pending`

#### Scenario: Delete never becomes a hub booking
- **WHEN** the photographer deletes a booking request in Inbox
- **THEN** that request is removed and does not appear in the Bookings hub

#### Scenario: Unaccepted remains
- **WHEN** the photographer neither accepts nor deletes a booking request
- **THEN** it remains in Inbox as unconfirmed mail

## MODIFIED Requirements

### Requirement: Unified inbox
The system SHALL present unaccepted website booking requests, feedback, and delivery-related events in Clients → Inbox with a type discriminator. Public **contact** form messages are out of scope — bookings remain the sole public intake channel. Unaccepted booking requests are mail in Inbox, not hub bookings.

#### Scenario: Booking arrives
- **WHEN** a visitor submits the public booking form
- **THEN** the photographer sees an unaccepted booking request in Inbox, not a new row in the Bookings hub

#### Scenario: Delivery event arrives
- **WHEN** a Delivery is downloaded or receives feedback
- **THEN** a corresponding inbox item can appear for the photographer

### Requirement: Deep links to focused tabs
Inbox items SHALL allow navigation to the relevant Bookings hub, Feedback, or Deliveries detail where applicable. Booking request items SHALL offer Accept and Delete on the message itself rather than requiring a hop to the hub first.

#### Scenario: Open accepted booking from inbox activity
- **WHEN** the photographer opens a related booking after it has been accepted
- **THEN** they reach the Bookings hub for that booking
