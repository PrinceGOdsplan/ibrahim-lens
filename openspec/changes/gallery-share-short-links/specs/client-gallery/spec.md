## MODIFIED Requirements

### Requirement: Open delivery by token
Clients SHALL access Delivery images via `/g/:code` without an account, where `:code` is either the Delivery’s secret token or its short share code. Both forms SHALL open the same live gallery when the Delivery is valid.

#### Scenario: Valid token
- **WHEN** a client opens a valid unexpired Delivery link using the long token
- **THEN** they can view the delivered images

#### Scenario: Valid short share code
- **WHEN** a client opens a valid unexpired Delivery link using the short share code
- **THEN** they can view the delivered images as with the long token link

#### Scenario: Invalid revoked or expired token
- **WHEN** a client opens an invalid, revoked, or expired Delivery link (short or long)
- **THEN** the system denies access and does not reveal image assets

### Requirement: Short share URL for copying and client mail
When a Delivery has a short share code, photographer-facing copy/share actions and client gallery-ready / expiry emails SHALL use the short `/g/{short_code}` URL. New Deliveries SHALL receive a short share code at creation. Long token URLs SHALL remain valid for existing and new Deliveries.

#### Scenario: Copy link in Studio
- **WHEN** the photographer copies a Delivery share link that has a short code
- **THEN** the clipboard contains the short `/g/{short_code}` URL on the site origin

#### Scenario: Client gallery-ready mail
- **WHEN** gallery-ready mail is sent for a Delivery that has a short code
- **THEN** the message link uses the short `/g/{short_code}` URL
