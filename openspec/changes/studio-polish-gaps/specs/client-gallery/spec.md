## ADDED Requirements

### Requirement: Delivery share links expose a photograph preview

When a messenger or other link unfurler fetches a Delivery URL `/g/:token` without running JavaScript, the response HTML SHALL include Open Graph title, description, and image tags for that Delivery. The `og:image` SHALL be an absolute URL to a photograph from that Delivery when one exists (served through the existing tokenized delivery-file path), otherwise the site default share image. Public SPA behavior for human visitors is unchanged.

#### Scenario: WhatsApp unfurls a Delivery link with a photo

- **WHEN** a client pastes a valid `/g/:token` link into WhatsApp (or another crawler that reads initial HTML)
- **THEN** the preview shows the client gallery title and a photograph from that Delivery

#### Scenario: Expired Delivery has no live gallery preview image

- **WHEN** a crawler requests `/g/:token` for a revoked or expired Delivery
- **THEN** the response does not expose Delivery photographs

### Requirement: Tokenized feedback always reaches Studio notices

Submitting Delivery feedback with a valid guest token SHALL create the photographer Feedback inbox item and fire photographer notice channels for feedback, even when a Studio auth cookie is also present in the browser. Studio-only creates without a guest token SHALL NOT spam Feedback notices.

#### Scenario: Client sends feedback while photographer cookies exist

- **WHEN** a visitor opens `/g/:token` in a browser that still holds a Studio session and submits feedback with a non-empty message
- **THEN** the feedback row is created, the Feedback inbox gains an item, and photographer notice channels for feedback run
