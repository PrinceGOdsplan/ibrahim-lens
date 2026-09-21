## MODIFIED Requirements

### Requirement: Manage deliveries
Authenticated photographers SHALL list, revoke, and inspect Deliveries from Clients → Deliveries, including expiry status and client name.

#### Scenario: Revoke delivery
- **WHEN** the photographer revokes a Delivery
- **THEN** the tokenized page no longer grants access and previously issued file URLs for that Delivery no longer serve image bytes

#### Scenario: Studio expiry messaging
- **WHEN** the photographer views a Delivery in Studio
- **THEN** they see the client name and when the 7-day access ends

## ADDED Requirements

### Requirement: Delivery file bytes follow the live token
Image bytes served for a Delivery SHALL be reachable only while that Delivery is unexpired and not revoked. After expiry or revoke, a previously copied file URL SHALL stop serving those bytes. Public Portfolio and Work file URLs SHALL remain independent of Delivery revoke.

#### Scenario: Expired file URL
- **WHEN** seven days have passed since Delivery creation and a client reuses a file URL obtained from that Delivery
- **THEN** the image bytes are not served

#### Scenario: Revoke cuts files, not the Library original
- **WHEN** the photographer revokes a Delivery
- **THEN** Delivery file URLs stop serving and the Library originals remain in Studio
