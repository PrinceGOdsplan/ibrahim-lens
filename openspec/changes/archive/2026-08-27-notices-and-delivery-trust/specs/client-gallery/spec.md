## MODIFIED Requirements

### Requirement: No password gate in v1
Delivery access SHALL rely on the secret token and 7-day expiry without requiring a share password.

#### Scenario: Open with token only
- **WHEN** a client opens a valid Delivery link
- **THEN** they are not prompted for a delivery password

## ADDED Requirements

### Requirement: Quiet view mark on Delivery photographs
While viewing a live Delivery gallery (including the immersive viewer), each photograph SHALL carry a quiet photographer wordmark: small, low opacity, in a corner — not a diagonal stamp, and not loud enough to dominate the frame. The mark SHALL NOT be applied to public Home, Portfolio, Work, or About photographs.

#### Scenario: Client views a Delivery frame
- **WHEN** a client opens a photograph in a valid Delivery gallery
- **THEN** a quiet corner wordmark is visible on the view and does not cover the subject as a diagonal overlay

#### Scenario: Public site unmarked
- **WHEN** a visitor views Home, Portfolio, or Work
- **THEN** those photographs are not shown with the Delivery view mark
