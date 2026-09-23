## MODIFIED Requirements

### Requirement: Photographer notices follow Settings channel preferences
When outbound mail is configured and the photographer’s Email preference for an event is on, the system SHALL send one email to the notify address for that event. Studio being open SHALL NOT suppress that email. A Studio auth cookie on the inbound public request SHALL NOT suppress photographer notice channels for public website booking requests or public Write messages. A missing SMTP configuration SHALL NOT prevent the underlying record from being created.

Default Email is on for a public booking request, a public Write message, and client Delivery feedback. Upload and add-to-Portfolio SHALL NOT send photographer email. Creating a Delivery SHALL NOT send photographer email.

In-app and Mobile for each photographer row follow their own preferences. Mobile SHALL NOT deliver unless Studio is installed on the home screen as specified in `studio-pwa`.

Notify hooks and authenticated notice routes (including Send test) SHALL resolve mail and push helpers from shared hook modules loadable inside PocketBase’s isolated handler context. They SHALL NOT depend on top-level functions declared only in other `*.pb.js` files being visible inside the handler.

#### Scenario: New booking with email on
- **WHEN** outbound mail is configured, Email is on for new booking, and a visitor completes booking submit successfully
- **THEN** the photographer’s notify address receives one message that a new booking needs a reply, whether or not Studio is open, and Clients → Bookings still shows that booking

#### Scenario: Booking while Studio cookie present
- **WHEN** Email or Mobile is on for new booking and a public booking is submitted from a browser that also holds a Studio session
- **THEN** photographer notice channels for booking still run

#### Scenario: Write while Studio cookie present
- **WHEN** Email or Mobile is on for Write and a public Write message is submitted from a browser that also holds a Studio session
- **THEN** photographer notice channels for message still run

#### Scenario: Send test notice
- **WHEN** the photographer is signed in, outbound mail is configured, a notify address is set, and they run Send test from Settings → Notifications
- **THEN** the notify address receives the test email, and when at least one push subscription exists Mobile also receives a test push

#### Scenario: New booking with email off
- **WHEN** Email is off for new booking and a visitor completes booking submit successfully
- **THEN** the Booking is created and no photographer email is sent for it

#### Scenario: Mail unset
- **WHEN** outbound mail is not configured and a visitor completes booking submit successfully
- **THEN** the Booking is created as today and no email send is attempted as a hard dependency of submit
