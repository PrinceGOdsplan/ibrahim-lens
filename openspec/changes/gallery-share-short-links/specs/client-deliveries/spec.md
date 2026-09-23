## MODIFIED Requirements

### Requirement: Delivery share link is copyable
Studio SHALL let the photographer copy a public Delivery URL. When the Delivery has a short share code, that copied URL SHALL use `/g/{short_code}` on the site origin; otherwise it MAY use the long token path. Opening either URL SHALL reach the same guest gallery for a live Delivery.

#### Scenario: Copy short link
- **WHEN** the photographer copies the share link for a Delivery that has a short code
- **THEN** the copied text is the site origin plus `/g/` plus the short code
