## Purpose

Lets the photographer install Studio on a phone home screen as a standalone tool app — including login — with iOS chrome, no page zoom, a cached app shell, launch splash, and Web Push that can actually complete, while the public site and client galleries stay ordinary websites.

## ADDED Requirements

### Requirement: Studio is installable on the home screen
The system SHALL offer Add to Home Screen (or the platform equivalent) for Studio routes under `/studio`, including `/studio/login`. The public Soft night site and Delivery galleries under `/g/` SHALL NOT present as an installable application. Reopening the installed icon SHALL start in Studio, not on a public marketing page.

#### Scenario: Install from Studio
- **WHEN** the photographer is on a `/studio` route in a supporting mobile browser
- **THEN** they can add Studio to the home screen and reopen it in standalone chrome without the public marketing pages as the app start URL

#### Scenario: Public site not an app
- **WHEN** a visitor is on Home, About, Portfolio, Work, Contact, or `/g/:token`
- **THEN** the site does not present those routes as a Studio application install

### Requirement: Login is part of the installed Studio app
Unauthenticated Studio routes SHALL use the same standalone app chrome as signed-in hubs: Studio light surface, safe-area insets, Studio theme color, and the Studio web-app identity. They SHALL NOT render as a public-site page or as a document that lacks the Studio install metadata.

#### Scenario: Cold start signed out
- **WHEN** the photographer opens the installed Studio icon and has no session
- **THEN** they see Studio sign-in inside the installed app chrome, not the public site and not a zoomed Safari-like document

#### Scenario: Sign-in on a 13 Pro class phone
- **WHEN** the photographer focuses the email or password field on Studio login on a 390-wide phone
- **THEN** the installed app does not page-zoom; the form remains fully visible without pinching

### Requirement: iOS standalone identity on Studio routes
While a Studio route is shown, the document SHALL expose the Studio manifest, a touch icon, and the Apple web-app tags that make Add to Home Screen open fullscreen standalone with a status bar suited to the Studio light surface. Those tags SHALL NOT be left on public or Delivery documents.

#### Scenario: Standalone detection after install from Studio
- **WHEN** the photographer adds Studio from a `/studio` route and reopens the icon
- **THEN** the window reports as standalone (display-mode or iOS standalone) so Mobile notice controls can enable

#### Scenario: Public page does not keep Studio identity
- **WHEN** a visitor leaves Studio and opens a public page
- **THEN** the document no longer presents Studio as the installable app for that page

### Requirement: Mobile notices require home-screen install
Web Push for photographer Mobile preferences SHALL be available only after Studio is added to the home screen. Until then, Mobile preference controls in Settings SHALL remain disabled. Permission for push SHALL be requested from a photographer tap in installed Studio (Settings), not automatically on first load, not on the public site, and not on first login before install.

#### Scenario: Push after install and tap
- **WHEN** Studio is on the home screen, the photographer has allowed phone notices from a tap, Mobile is on for new booking, and a visitor completes booking submit successfully
- **THEN** the installed Studio app can receive a phone notice for that booking

#### Scenario: No install
- **WHEN** Studio is not on the home screen and a visitor completes booking submit successfully
- **THEN** no Web Push is sent, even if the photographer previously toggled Mobile in a way the UI does not persist as enabled

#### Scenario: Auto-prompt does not count
- **WHEN** installed Studio loads without the photographer tapping Allow phone notices, and the platform would ignore a permission request that is not a tap
- **THEN** Mobile remains off until they tap the Settings control; the load itself SHALL NOT be the only permission path

### Requirement: Studio app shell is cached
The Studio service worker SHALL cache the Studio app shell (Studio static assets and the documents needed to open login or hubs) so a reopen is fast and a brief offline still shows Studio chrome rather than a blank browser error. It SHALL NOT cache Library originals, thumbs, or public marketing pages as the install cache. API reads while offline MAY fail with a reachable Studio empty/error state.

#### Scenario: Reopen with a warm cache
- **WHEN** the photographer has opened installed Studio once, then opens the icon again
- **THEN** Studio chrome appears from cache without waiting on a full network download of the shell

#### Scenario: Photos are not the offline cache
- **WHEN** the worker fills the Studio cache
- **THEN** PocketBase photo files are not stored as the app-shell cache

### Requirement: Launch splash and home-screen icon
Installed Studio SHALL show a Studio-light launch splash (not the public dark site) on supported iPhones and SHALL use a maskable (or purpose-any plus maskable) icon. The manifest MAY list shortcuts to Dashboard, Gallery, and Bookings.

#### Scenario: Cold start splash
- **WHEN** the photographer opens the installed icon on an iPhone 13 Pro class device
- **THEN** the launch surface is the Studio light ground, not the public Soft night page

#### Scenario: Shortcuts
- **WHEN** the platform shows web-app shortcuts for Studio
- **THEN** Dashboard, Gallery, and Bookings are available as destinations under `/studio`
