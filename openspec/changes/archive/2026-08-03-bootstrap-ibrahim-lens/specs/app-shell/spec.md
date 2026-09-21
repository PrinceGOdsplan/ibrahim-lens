## Purpose

Defines the public and Studio application shell for Ibrahim Lens, including routing, branding chrome, hub navigation, and legal page routes.

## ADDED Requirements

### Requirement: Public site navigation
The system SHALL provide public navigation to Home, About, Portfolio, Work, and Contact. Delivery gallery routes SHALL NOT appear in main navigation.

#### Scenario: Visitor opens the site
- **WHEN** a visitor loads the public site
- **THEN** they see Ibrahim Lens branding and links to Home, About, Portfolio, Work, and Contact

### Requirement: Legal pages
The system SHALL provide Privacy and Terms pages linked from the public site footer (or equivalent secondary links).

#### Scenario: Visitor opens privacy
- **WHEN** a visitor opens the Privacy page
- **THEN** they see privacy policy content suitable for a site that collects contact and booking inquiries

### Requirement: Studio hub chrome
The system SHALL provide a Studio shell at `/studio` with navigation to Dashboard, Library, Website, Clients, and Settings.

#### Scenario: Authenticated photographer enters Studio
- **WHEN** an authenticated photographer opens `/studio`
- **THEN** they see the five-hub Studio navigation and can open each hub route

### Requirement: Post-login landing
After successful authentication the system SHALL redirect the photographer to the Dashboard.

#### Scenario: Successful login redirect
- **WHEN** the photographer logs in successfully
- **THEN** they land on the Studio Dashboard

### Requirement: Reserved delivery route
The system SHALL reserve public paths under `/g/:token` for client delivery galleries without linking them from main navigation.

#### Scenario: Delivery path not in nav
- **WHEN** a visitor views main navigation
- **THEN** no Delivery or `/g/` link is shown

### Requirement: Unknown routes
The system SHALL show a not-found experience for unknown public or Studio paths.

#### Scenario: Unknown public path
- **WHEN** a visitor opens a path that does not exist
- **THEN** the system shows a not-found page with a way back to Home
