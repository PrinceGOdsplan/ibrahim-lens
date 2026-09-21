## REMOVED Requirements

### Requirement: Client first-download mail
**Reason**: The product dropped client “you downloaded” mail. First download still records `downloaded_at` so expiry mail stays off.
**Migration**: Use “Client expiry mail only if they have not downloaded” and `client-gallery` download marking. Settings SHALL NOT offer a client-downloaded mail toggle.

## MODIFIED Requirements

### Requirement: Photographer notices follow Settings channel preferences
When outbound mail is configured and the photographer’s Email preference for an event is on, the system SHALL send one email to the notify address for that event. Studio being open SHALL NOT suppress that email. A missing SMTP configuration SHALL NOT prevent the underlying record from being created.

Default Email is on for a public booking request, a public Write message, and client Delivery feedback. Upload and add-to-Portfolio SHALL NOT send photographer email. Creating a Delivery SHALL NOT send photographer email.

In-app and Mobile for each photographer row follow their own preferences. Mobile SHALL NOT deliver unless Studio is installed on the home screen as specified in `studio-pwa`.

#### Scenario: New booking with email on
- **WHEN** outbound mail is configured, Email is on for new booking, and a visitor completes booking submit successfully
- **THEN** the photographer’s notify address receives one message that a new booking needs a reply, whether or not Studio is open, and Clients → Bookings still shows that booking

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

### Requirement: Client expiry mail only if they have not downloaded
When outbound mail is configured, the client expiring-if-not-downloaded preference is on, and a live Delivery has a snapshotted client email and no first download, the system SHALL send one email to that address about 24 hours before the 7-day expiry. The system SHALL NOT send that mail if the client has already downloaded, if the Delivery is revoked, or if no email was snapshotted. The system SHALL NOT send a client “you downloaded” email.

#### Scenario: Expiring unused gallery
- **WHEN** a Delivery with a snapshotted email has never been downloaded, is not revoked, client expiry mail is on, and about 24 hours remain
- **THEN** that address receives one reminder that the gallery will expire, including the `/g/:token` link

#### Scenario: Already downloaded
- **WHEN** a Delivery’s first download has already been recorded and the expiry window arrives
- **THEN** no client expiry email is sent for that Delivery

### Requirement: Notifications are configured in Settings
Authenticated photographers SHALL set the notify address and per-event Email, In-app, and Mobile preferences for photographer events (booking, Write, feedback), plus on/off preferences for client gallery-ready and client expiring-if-not-downloaded mail, from Settings → Notifications. Settings SHALL NOT offer client-downloaded mail or photographer upload / Portfolio email rows. Mobile preference controls SHALL be visible and disabled until Studio is installed on the home screen. Changing these settings SHALL NOT alter Booking or Delivery records.

#### Scenario: Disable client gallery mail
- **WHEN** the photographer turns off client gallery-ready mail and later creates a Delivery with a snapshotted email
- **THEN** the Delivery is created and no client email is sent

#### Scenario: Disable photographer booking email
- **WHEN** the photographer turns off Email for new booking and a visitor submits a booking
- **THEN** the Booking is created and no photographer email is sent

#### Scenario: Notify address
- **WHEN** the photographer saves a notify address in Settings → Notifications
- **THEN** subsequent photographer notices use that address

#### Scenario: Mobile disabled before install
- **WHEN** Studio is not on the home screen and the photographer opens Settings → Notifications
- **THEN** Mobile preference controls are visible, disabled, and explain that Add to Home Screen is required
