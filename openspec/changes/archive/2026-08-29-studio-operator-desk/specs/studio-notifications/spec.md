## REMOVED Requirements

### Requirement: Photographer mail is only for new inbound work while Studio is idle
**Reason**: Idle gating and the old two-toggle model were replaced by the channel matrix; this change further drops self-action email and adds Write.
**Migration**: Use “Photographer notices for inbound work” and Settings matrix requirements below.

## ADDED Requirements

### Requirement: Photographer notices for inbound work
When outbound mail is configured and Email is on for the event, the system SHALL email the notify address (or login email if notify is empty) for: a public booking request, a public Write message, and client Delivery feedback. Studio being open SHALL NOT suppress that email. Upload and add-to-Portfolio SHALL NOT send photographer email. Creating a Delivery SHALL NOT send photographer email. A missing SMTP configuration SHALL NOT prevent the underlying record from being created.

#### Scenario: New booking with email on
- **WHEN** outbound mail is configured, Email is on for booking, and a visitor completes booking submit successfully
- **THEN** the notify address receives one branded message about the booking request

#### Scenario: Write message with email on
- **WHEN** outbound mail is configured, Email is on for Write (message), and a visitor completes Write submit successfully
- **THEN** the notify address receives one branded message about the new message

#### Scenario: Upload does not email
- **WHEN** the photographer uploads a Library image
- **THEN** no photographer email is sent for that upload

#### Scenario: Mail unset
- **WHEN** outbound mail is not configured and a visitor completes booking submit successfully
- **THEN** the Booking is created and no email send is attempted as a hard dependency of submit

### Requirement: In-app and mobile for inbound events
When In-app is on for booking, Write, or feedback, Studio SHALL present a notice with title, relative time, and deep link into Inbox (or Feedback). Notices for those events SHALL survive a refresh while unread in Inbox. Mobile follows the same events when Studio is installed and Mobile is on. Upload and Portfolio SHALL NOT appear as photographer notice matrix rows for Email; In-app/Mobile for those self-actions MAY be omitted from Settings.

#### Scenario: Write while Studio is open
- **WHEN** In-app is on for Write and a visitor submits Write while Studio is open
- **THEN** the bell shows a notice that leads to Inbox Messages

#### Scenario: Clear notice marks read
- **WHEN** the photographer opens an inbound notice from the bell
- **THEN** they land on the linked Inbox item and unread state aligns with Inbox

### Requirement: Client gallery-ready and expiry mail only
When outbound mail is configured and the Delivery has a snapshotted client email: gallery-ready mail SHALL send on create when that preference is on; expiry-if-not-downloaded mail SHALL send about 24 hours before expiry when that preference is on and the client has not downloaded. The system SHALL NOT send a client “you downloaded” email.

#### Scenario: Delivery with email
- **WHEN** outbound mail is configured, gallery-ready is on, and a Delivery is created with a snapshotted email
- **THEN** that address receives one branded gallery-ready message with the `/g/:token` link

#### Scenario: First download
- **WHEN** a client downloads from a Delivery for the first time
- **THEN** `downloaded_at` may be recorded for expiry logic and no client download email is sent

### Requirement: Branded mail and health
Outbound Studio and client notices SHALL use branded HTML (From name Ibrahim Lens, clear subject, body with link). Settings SHALL surface whether SMTP appears configured and the last send success or error. Test send SHALL send a real sample without changing Bookings or Deliveries.

#### Scenario: Test send
- **WHEN** the photographer uses Send test with SMTP and a notify address configured
- **THEN** they receive a branded test message and Settings records success or the error

#### Scenario: Health when unset
- **WHEN** SMTP is not enabled
- **THEN** Settings → Notifications shows that outbound mail is not configured

## MODIFIED Requirements

### Requirement: Notifications are configured in Settings
Authenticated photographers SHALL set the notify address and per-event Email, In-app, and Mobile preferences for inbound photographer events (booking, Write, feedback), plus on/off for client gallery-ready and client expiring-if-not-downloaded, from Settings → Notifications. Mobile controls SHALL stay visible and disabled until Studio is installed on the home screen. Changing these settings SHALL NOT alter Booking or Delivery records.

#### Scenario: Disable client gallery mail
- **WHEN** the photographer turns off client gallery-ready mail and later creates a Delivery with a snapshotted email
- **THEN** the Delivery is created and no client email is sent

#### Scenario: Disable booking email
- **WHEN** the photographer turns off Email for new booking and a visitor submits a booking
- **THEN** the Booking is created and no photographer email is sent

#### Scenario: Notify address
- **WHEN** the photographer saves a notify address in Settings → Notifications
- **THEN** subsequent photographer notices use that address

#### Scenario: Mobile disabled before install
- **WHEN** Studio is not on the home screen and the photographer opens Settings → Notifications
- **THEN** Mobile preference controls are visible, disabled, and explain that Add to Home Screen is required
