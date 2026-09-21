## Purpose

Keeps the public origin from being framed or script-injected casually, and keeps PocketBase Admin off the open internet on the production host.

## ADDED Requirements

### Requirement: Public origin framing and script policy
The public origin SHALL send a Content-Security-Policy that defaults to same-origin script and connect, allows Google Fonts used by the site, and sets frame-ancestors to same-origin. It SHALL also send an equivalent frame-denial header so older clients do not embed the site.

#### Scenario: Homepage headers
- **WHEN** a client requests the public homepage
- **THEN** the response includes a Content-Security-Policy with frame-ancestors 'self' and a same-origin frame header

#### Scenario: Studio page is not embeddable
- **WHEN** a third-party page tries to iframe `/studio` or a public route
- **THEN** the origin policy does not allow that embed

### Requirement: PocketBase Admin is not anonymously public
On the production host, PocketBase Admin (`/_/`) SHALL NOT be reachable with only the Admin password. An additional operator control SHALL sit in front (shared-secret basic auth on the reverse proxy, or an equivalent access policy).

#### Scenario: Anonymous Admin fetch
- **WHEN** an unauthenticated visitor requests `/_/` on the production host without the extra operator secret
- **THEN** the Admin UI is not served
