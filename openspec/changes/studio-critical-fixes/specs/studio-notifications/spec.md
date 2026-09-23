## MODIFIED Requirements

### Requirement: Photographer notices follow Settings channel preferences
When outbound mail is configured and the photographer’s Email preference for an event is on, the system SHALL send one email to the notify address for that event. Studio being open SHALL NOT suppress that email. A Studio auth cookie on the inbound public request SHALL NOT suppress photographer notice channels for public website booking requests or public Write messages. A missing SMTP configuration SHALL NOT prevent the underlying record from being created.

Default Email is on for a public booking request, a public Write message, and client Delivery feedback. Upload and add-to-Portfolio SHALL NOT send photographer email. Creating a Delivery SHALL NOT send photographer email.

In-app and Mobile for each photographer row follow their own preferences. Mobile SHALL NOT deliver unless Studio is installed on the home screen as specified in `studio-pwa`.

#### Scenario: New booking with email on
- **WHEN** outbound mail is configured, Email is on for new booking, and a visitor completes booking submit successfully
- **THEN** the photographer’s notify address receives one message that a new booking needs a reply, whether or not Studio is open, and Clients → Bookings still shows that booking

#### Scenario: Booking while Studio cookie present
- **WHEN** Email or Mobile is on for new booking and a public booking is submitted from a browser that also holds a Studio session
- **THEN** photographer notice channels for booking still run

#### Scenario: Write while Studio cookie present
- **WHEN** Email or Mobile is on for Write and a public Write message is submitted from a browser that also holds a Studio session
- **THEN** photographer notice channels for message still run

#### Scenario: New booking with email off
- **WHEN** Email is off for new booking and a visitor completes booking submit successfully
- **THEN** the Booking is created and no photographer email is sent for it

#### Scenario: Mail unset
- **WHEN** outbound mail is not configured and a visitor completes booking submit successfully
- **THEN** the Booking is created as today and no email send is attempted as a hard dependency of submit

#### Scenario: Upload does not email
- **WHEN** the photographer uploads a Library image
- **THEN** the image is stored and no photographer email is sent for that upload

#### Scenario: He created the Delivery
- **WHEN** the photographer creates a Delivery
- **THEN** no photographer email is sent about that Delivery

### Requirement: In-app notices for enabled photographer events
When In-app is on for an event, Studio SHALL present a notice for that event that deep-links into Clients → Inbox or the relevant hub, and SHALL NOT create a second inbox. While Studio is open, a newly arrived in-app notice SHALL also appear as a short-lived toast/banner the photographer can see without opening the header notices menu. Action receipts on a write control are specified in `ux-state-integrity` and SHALL NOT appear as these notices.

#### Scenario: Feedback while Studio is open
- **WHEN** In-app is on for client feedback and a client submits Delivery feedback while Studio is open
- **THEN** Studio shows an in-app notice that leads to Inbox or Feedback, and Inbox still holds the item

#### Scenario: Toast while Studio is open
- **WHEN** In-app is on for new booking and a visitor submits a booking while the photographer is already in Studio
- **THEN** a toast or banner appears for that booking without requiring the photographer to open the notices menu

#### Scenario: In-app off
- **WHEN** In-app is off for new booking and a visitor completes booking submit successfully
- **THEN** the Booking is created and Studio does not show an in-app notice for that booking
