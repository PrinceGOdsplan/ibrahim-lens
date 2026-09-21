# studio-notifications Specification

## Purpose

Sends optional outbound email for work the photographer would miss: new inbound events while Studio is idle, and a client “gallery ready” note. Mail does not replace Inbox, Bookings, or Deliveries, and it is not a live ticker while he is already in Studio.

## Requirements

### Requirement: Photographer notices follow Settings channel preferences
When outbound mail is configured and the photographer’s Email preference for an event is on, the system SHALL send one email to the notify address for that event. Studio being open SHALL NOT suppress that email. A missing SMTP configuration SHALL NOT prevent the underlying record from being created.

Default Email is on for a public booking request and for client Delivery feedback. Default Email is off for photographer self-actions (Library upload, adding an image to Portfolio). Those self-action emails SHALL send only after he turns Email on for that row.

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

#### Scenario: Upload without opt-in email
- **WHEN** the photographer uploads a Library image and Email is off for upload
- **THEN** the image is stored and no photographer email is sent for that upload

#### Scenario: Upload with opt-in email
- **WHEN** outbound mail is configured, Email is on for upload, and the photographer uploads a Library image successfully
- **THEN** the notify address receives one message that a photo was added

#### Scenario: He created the Delivery
- **WHEN** the photographer creates a Delivery
- **THEN** no photographer email is sent about that Delivery

### Requirement: In-app notices for enabled photographer events
When In-app is on for an event, Studio SHALL present a notice for that event that deep-links into Clients → Inbox or the relevant hub, and SHALL NOT create a second inbox. Action receipts on a write control are specified in `ux-state-integrity` and SHALL NOT appear as these notices.

#### Scenario: Feedback while Studio is open
- **WHEN** In-app is on for client feedback and a client submits Delivery feedback while Studio is open
- **THEN** Studio shows an in-app notice that leads to Inbox or Feedback, and Inbox still holds the item

#### Scenario: In-app off
- **WHEN** In-app is off for new booking and a visitor completes booking submit successfully
- **THEN** the Booking is created and Studio does not show an in-app notice for that booking

### Requirement: Client first-download mail
When outbound mail is configured, the client downloaded preference is on, and a Delivery has a snapshotted client email, the system SHALL send one email to that address on the first download from that Delivery. Further downloads on the same Delivery SHALL NOT send another client email. Viewing the gallery without downloading SHALL NOT count as a download.

#### Scenario: First download with address
- **WHEN** outbound mail is configured, client downloaded mail is on, the Delivery has a snapshotted email, and the client downloads an image for the first time
- **THEN** that address receives one message that they downloaded from the gallery, and later downloads on the same Delivery do not send another

#### Scenario: Download with no address
- **WHEN** a client downloads from a Delivery with no snapshotted email
- **THEN** the file is provided and no client email is sent

### Requirement: Client expiry mail only if they have not downloaded
When outbound mail is configured, the client expiring-if-not-downloaded preference is on, and a live Delivery has a snapshotted client email and no first download, the system SHALL send one email to that address about 24 hours before the 7-day expiry. The system SHALL NOT send that mail if the client has already downloaded, if the Delivery is revoked, or if no email was snapshotted.

#### Scenario: Expiring unused gallery
- **WHEN** a Delivery with a snapshotted email has never been downloaded, is not revoked, client expiry mail is on, and about 24 hours remain
- **THEN** that address receives one reminder that the gallery will expire, including the `/g/:token` link

#### Scenario: Already downloaded
- **WHEN** a Delivery’s first download has already been recorded and the expiry window arrives
- **THEN** no client expiry email is sent for that Delivery

### Requirement: Client notified when a Delivery is ready
When outbound mail is configured, the client gallery-ready preference is on, and the photographer creates a Delivery that has a snapshotted client email, the system SHALL send one email to that snapshotted address containing the tokenized `/g/:token` link. A Delivery without a snapshotted email SHALL still be created. Client mail SHALL NOT depend on whether the photographer is active in Studio. Later edits to a Person’s email SHALL NOT change the address used for that Delivery’s client mail.

#### Scenario: Delivery with email
- **WHEN** outbound mail is configured, gallery-ready mail is on, and the photographer creates a Delivery whose snapshotted client email is present
- **THEN** that address receives one message with the Delivery link, and the `/g/:token` page works as before

#### Scenario: Delivery without email
- **WHEN** the photographer creates a Delivery with no snapshotted client email
- **THEN** the Delivery is created and no client email is sent

### Requirement: Notifications are configured in Settings
Authenticated photographers SHALL set the notify address and per-event Email, In-app, and Mobile preferences for photographer events, plus on/off preferences for client gallery-ready, client downloaded, and client expiring-if-not-downloaded mail, from Settings → Notifications. Mobile preference controls SHALL be visible and disabled until Studio is installed on the home screen. Changing these settings SHALL NOT alter Booking or Delivery records.

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

### Requirement: New booking notices point at Inbox
Photographer notices for a new public booking request SHALL describe it as mail to handle in Inbox (Accept or Delete), not as a booking that needs a reply in the Bookings hub. In-app notice deep links SHALL open Clients → Inbox.

#### Scenario: In-app notice for a website request
- **WHEN** In-app notices are on for new booking and a visitor submits a booking request
- **THEN** the notice leads to Inbox, where the request can be accepted or deleted

#### Scenario: Email copy does not send them to the hub
- **WHEN** photographer email is sent for a new booking request
- **THEN** the message does not claim the request already lives in the Bookings hub as a job that needs a reply

### Requirement: In-app notices open from the app header
When Studio shows in-app notices, the control SHALL live in the Studio app header. Opening it SHALL present a list docked to that header. The list SHALL NOT cover the entire hub pane as a full-width overlay. Clearing or following a notice SHALL behave as today.

#### Scenario: Open notices
- **WHEN** the photographer activates Notices in the app header
- **THEN** they see the notice list attached to the header, and the hub surface remains the work area underneath

#### Scenario: Follow a notice
- **WHEN** the photographer opens a notice
- **THEN** they land on the linked hub and the notice is dismissed
