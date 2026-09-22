## MODIFIED Requirements

### Requirement: Health is a URL, not a Studio product
The system SHALL expose a cheap health URL for operators. Studio SHALL NOT become an observability, APM, or on-call product. A thin Dashboard strip for public-site visit counts and top pages (sourced from Cloudflare Web Analytics) is allowed as desk context; it SHALL NOT expand into full traffic analytics, vitals debugging, or uptime monitoring inside Studio.

#### Scenario: Operator pings health
- **WHEN** an operator requests the health URL
- **THEN** they receive a cheap OK response without requiring Studio UI

#### Scenario: No observability hub
- **WHEN** the photographer uses Studio
- **THEN** they are not presented with an observability or uptime dashboard as a hub
