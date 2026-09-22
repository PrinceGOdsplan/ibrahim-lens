## MODIFIED Requirements

### Requirement: Default share preview image exists

The production site SHALL serve a default Open Graph image at the path configured by `VITE_OG_IMAGE` (default `/og-default.jpg`) as an image response, not the SPA HTML document. Share unfurlers that read baseline tags in `index.html` SHALL receive a reachable photograph URL.

#### Scenario: og-default is an image

- **WHEN** a client requests `GET /og-default.jpg` (or the configured default OG path)
- **THEN** the response is an image (for example `image/jpeg`) with a successful status

### Requirement: Unknown public paths return 404

Unknown public website paths that are not Studio, Delivery, API, or static assets SHALL return HTTP 404. Known SPA routes (Home, About, Portfolio, Work and Work stories, Contact, Privacy, Terms, Studio, Delivery) SHALL continue to load the SPA shell.

#### Scenario: Garbage path is 404

- **WHEN** a visitor requests a path that is not a known public or Studio route
- **THEN** the origin responds with status 404
