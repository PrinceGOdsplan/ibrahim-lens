## Purpose

Tokenized client gallery for Deliveries: view images, download originals, submit feedback, and see time remaining before the 7-day expiry.

## ADDED Requirements

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
Delivery access in v1 SHALL rely on the secret token and 7-day expiry without requiring a share password.

#### Scenario: Open with token only
- **WHEN** a client opens a valid Delivery link
- **THEN** they are not prompted for a delivery password
