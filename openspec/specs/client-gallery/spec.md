# client-gallery Specification

## Purpose
Tokenized client gallery for Deliveries: view images, download originals, submit feedback, and see time remaining before the 7-day expiry.

## Requirements

### Requirement: Open delivery by token
Clients SHALL access Delivery images via `/g/:token` without an account.

#### Scenario: Valid token
- **WHEN** a client opens a valid unexpired Delivery link
- **THEN** they can view the delivered images

#### Scenario: Invalid revoked or expired token
- **WHEN** a client opens an invalid, revoked, or expired Delivery link
- **THEN** the system denies access and does not reveal image assets

### Requirement: Download originals
Clients SHALL be able to download delivered images at original resolution without watermarks.

#### Scenario: Download original
- **WHEN** a client downloads an image from a valid Delivery
- **THEN** the file provided is the original-resolution asset without a watermark overlay

### Requirement: Expiry countdown for clients
The client gallery SHALL show a clear countdown or time-remaining indicator until the 7-day expiry.

#### Scenario: Client sees time left
- **WHEN** a client views a valid Delivery gallery
- **THEN** they can see when access will expire

### Requirement: No password gate in v1
Delivery access SHALL rely on the secret token and 7-day expiry without requiring a share password.

#### Scenario: Open with token only
- **WHEN** a client opens a valid Delivery link
- **THEN** they are not prompted for a delivery password

### Requirement: Quiet view mark on Delivery photographs
While viewing a live Delivery gallery (including the immersive viewer), each photograph SHALL carry a quiet photographer wordmark: small, low opacity, in a corner — not a diagonal stamp, and not loud enough to dominate the frame. The mark SHALL NOT be applied to public Home, Portfolio, Work, or About photographs.

#### Scenario: Client views a Delivery frame
- **WHEN** a client opens a photograph in a valid Delivery gallery
- **THEN** a quiet corner wordmark is visible on the view and does not cover the subject as a diagonal overlay

#### Scenario: Public site unmarked
- **WHEN** a visitor views Home, Portfolio, or Work
- **THEN** those photographs are not shown with the Delivery view mark

### Requirement: Download is distinct from view for notices
A client download of an original SHALL be the event that marks the Delivery downloaded and that suppresses client expiry mail, as specified in `studio-notifications`. Opening the gallery or viewing a frame SHALL NOT count as a download. The system SHALL NOT send a client “you downloaded” email.

That download event SHALL be authored by the server when it serves the original file. The gallery page SHALL NOT need to POST a download event for the Delivery to be marked downloaded.

#### Scenario: Open gallery without download
- **WHEN** a client opens a valid Delivery link and looks at photographs without downloading
- **THEN** they still see the countdown and images, and no download or expiry-suppression side effect of a download occurs

#### Scenario: Original file served
- **WHEN** a client downloads an original from a valid Delivery
- **THEN** the Delivery is marked downloaded even if the gallery page does not POST an inquiry, and no client download email is sent
