## Purpose

Lets the photographer install Studio on a phone home screen as a standalone tool app, with Web Push only after that install, while the public site and client galleries stay ordinary websites.

## ADDED Requirements

### Requirement: Studio is installable on the home screen
The system SHALL offer Add to Home Screen (or the platform equivalent) for Studio routes under `/studio`. The public Soft night site and Delivery galleries under `/g/` SHALL NOT present as an installable application.

#### Scenario: Install from Studio
- **WHEN** the photographer is signed in on `/studio` on a supporting mobile browser
- **THEN** they can add Studio to the home screen and reopen it in standalone chrome without the public marketing pages as the app start URL

#### Scenario: Public site not an app
- **WHEN** a visitor is on Home, About, Portfolio, Work, Contact, or `/g/:token`
- **THEN** the site does not present those routes as a Studio application install

### Requirement: Mobile notices require home-screen install
Web Push for photographer Mobile preferences SHALL be available only after Studio is added to the home screen. Until then, Mobile preference controls in Settings SHALL remain disabled. Permission for push SHALL be requested from Studio after install (or from Settings), not on the public site and not on first login before any install.

#### Scenario: Push after install
- **WHEN** Studio is on the home screen, Mobile is on for new booking, push permission is granted, and a visitor completes booking submit successfully
- **THEN** the installed Studio app can receive a phone notice for that booking

#### Scenario: No install
- **WHEN** Studio is not on the home screen and a visitor completes booking submit successfully
- **THEN** no Web Push is sent, even if the photographer previously toggled Mobile in a way the UI does not persist as enabled
