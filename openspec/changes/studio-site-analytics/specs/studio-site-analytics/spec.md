## ADDED Requirements

### Requirement: Studio site analytics API

The system SHALL expose an authenticated Studio endpoint that returns Cloudflare Web Analytics visit totals and top public page paths for a selected period. The Cloudflare API token SHALL remain server-side only.

#### Scenario: Authenticated photographer loads visits

- **WHEN** a signed-in Studio user requests site analytics for a period
- **THEN** the response includes a visit total and an ordered list of top public paths with view counts

#### Scenario: Missing Cloudflare config

- **WHEN** the Cloudflare token or site tag is not configured
- **THEN** the endpoint responds with a soft unavailable payload (not a hard Studio failure) so Dashboard desk data can still load

#### Scenario: Guest cannot read analytics

- **WHEN** an unauthenticated client requests the site analytics endpoint
- **THEN** the request is rejected

### Requirement: Public paths only

Top paths SHALL exclude Studio, Delivery, API, Admin, and static asset prefixes. Included paths are public marketing routes (Home, About, Portfolio, Work, Contact, Privacy, Terms).

#### Scenario: Studio paths omitted

- **WHEN** RUM data includes `/studio` traffic
- **THEN** those paths do not appear in the top-pages list returned to Studio
