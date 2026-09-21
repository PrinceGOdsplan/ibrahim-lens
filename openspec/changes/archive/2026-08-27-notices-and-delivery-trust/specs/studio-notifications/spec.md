## Purpose

Sends optional outbound email for work the photographer would miss: new inbound events while Studio is idle, and a client “gallery ready” note. Mail does not replace Inbox, Bookings, or Deliveries, and it is not a live ticker while he is already in Studio.

## ADDED Requirements

### Requirement: Photographer mail is only for new inbound work while Studio is idle
When outbound mail is configured, the system SHALL email the photographer’s notify address only for new inbound work he did not create himself: a public booking request, or client feedback on a Delivery. The system SHALL NOT send that mail while the photographer is active in Studio. The email SHALL NOT be required for the Booking or feedback record to exist.

Studio-created bookings, Delivery create/revoke, status edits, and Delivery expiry SHALL NOT produce photographer email.

#### Scenario: New booking while he is away
- **WHEN** outbound mail is configured, the photographer has not been active in Studio recently, and a visitor completes booking submit successfully
- **THEN** the photographer’s notify address receives one message that a new booking needs a reply, and Clients → Bookings still shows that booking

#### Scenario: New booking while he is in Studio
- **WHEN** outbound mail is configured, the photographer is active in Studio, and a visitor completes booking submit successfully
- **THEN** the Booking is created as today and no photographer email is sent for it

#### Scenario: Client feedback while he is away
- **WHEN** outbound mail is configured, the photographer has not been active in Studio recently, and a client submits Delivery feedback
- **THEN** the photographer’s notify address receives one message that new feedback arrived, and Inbox still shows that item

#### Scenario: Mail unset
- **WHEN** outbound mail is not configured and a visitor completes booking submit successfully
- **THEN** the Booking is created as today and no email send is attempted as a hard dependency of submit

#### Scenario: He created the Delivery
- **WHEN** the photographer creates a Delivery
- **THEN** no photographer email is sent about that Delivery

### Requirement: Client notified when a Delivery is ready
When outbound mail is configured and the photographer creates a Delivery for a Person or client email that is present, the system SHALL send one email to that address containing the tokenized `/g/:token` link. A Delivery without an email SHALL still be created. Client mail SHALL NOT depend on whether the photographer is active in Studio.

#### Scenario: Delivery with email
- **WHEN** outbound mail is configured and the photographer creates a Delivery whose client has an email
- **THEN** that address receives one message with the Delivery link, and the `/g/:token` page works as before

#### Scenario: Delivery without email
- **WHEN** the photographer creates a Delivery with no client email
- **THEN** the Delivery is created and no client email is sent

### Requirement: Notifications are configured in Settings
Authenticated photographers SHALL set the photographer notify address, enable or disable photographer away-notices, and enable or disable client gallery-ready mail from Settings → Notifications. Changing these settings SHALL NOT alter Booking or Delivery records.

#### Scenario: Disable client gallery mail
- **WHEN** the photographer turns off client gallery-ready mail and later creates a Delivery with an email
- **THEN** the Delivery is created and no client email is sent

#### Scenario: Disable photographer away-notices
- **WHEN** the photographer turns off photographer away-notices and a visitor submits a booking while Studio is idle
- **THEN** the Booking is created and no photographer email is sent

#### Scenario: Notify address
- **WHEN** the photographer saves a notify address in Settings → Notifications
- **THEN** subsequent photographer notices use that address
