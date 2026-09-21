# app-shell Specification

## Purpose

Defines the public and Studio application shell for Ibrahim Lens, including routing, branding chrome, hub navigation, and legal page routes.

## Requirements

### Requirement: Public site navigation
The system SHALL provide public navigation via Ibrahim Lens branding (to Home) plus links to About, Portfolio, Work, and Contact. Delivery gallery routes SHALL NOT appear in main navigation. Home SHALL be reachable from the brand/wordmark, not as a duplicate primary nav text link.

#### Scenario: Visitor opens the site
- **WHEN** a visitor loads the public site
- **THEN** they see Ibrahim Lens branding and links to About, Portfolio, Work, and Contact

### Requirement: Explore nav without Home link
Primary public navigation SHALL link to About, Portfolio, Work, and Contact. The brand/wordmark SHALL navigate to Home. Delivery gallery routes SHALL NOT appear in main navigation. A dedicated Home text link SHALL NOT appear in the primary nav row.

#### Scenario: Visitor opens the site without Home link
- **WHEN** a visitor loads the public site
- **THEN** they see Ibrahim Lens branding and links to About, Portfolio, Work, and Contact without a separate Home nav item

### Requirement: Home header film then solid on scroll
On the Home route, the public header SHALL start as a film treatment over the hero and SHALL switch to a solid Soft night bar (blur/raised surface acceptable) after the visitor scrolls past the hero region. Prefer fixed/sticky behavior so navigation remains available while scrolling Home.

#### Scenario: Scroll past hero
- **WHEN** a visitor on `/` scrolls past the hero
- **THEN** the header becomes a solid Soft night bar and remains usable

### Requirement: Book on non-home chrome
On public routes, including Home, desktop primary chrome SHALL include a Book control targeting Contact booking (`/contact#booking`). On Home this control SHALL remain available while the film hero is on screen, not only after the header turns solid. WhatsApp SHALL NOT appear in the desktop header nav. WhatsApp remains under the booking form and in the footer when phone is configured, and MAY also appear in the mobile menu alongside Instagram.

#### Scenario: Inner page desktop Book
- **WHEN** a visitor views Portfolio, Work, About, or Contact on a desktop-width viewport
- **THEN** they can reach Book from the header targeting Contact booking, and WhatsApp is not shown in the desktop header

#### Scenario: Home film header Book
- **WHEN** a visitor is on `/` still over the hero
- **THEN** the header still offers Book targeting `/contact#booking`

### Requirement: Mobile menu Book
The public mobile menu SHALL offer Book a session (to Contact booking) in addition to primary explore links. When Instagram and/or phone are configured, Instagram and WhatsApp SHALL appear as secondary links in the mobile menu (WhatsApp when phone is set).

#### Scenario: Mobile Book
- **WHEN** a visitor opens the mobile menu
- **THEN** Book a session is available

#### Scenario: Mobile menu socials
- **WHEN** a visitor opens the mobile menu and Instagram and phone are configured
- **THEN** Instagram and WhatsApp appear as secondary links alongside each other

### Requirement: Mobile menu readable contrast
The public mobile menu SHALL present explore links in foreground-level contrast by default, muting only the active route when applicable. When the visitor is on Home (no explore item active), explore links SHALL remain readable rather than all muted.

#### Scenario: Open menu on Home
- **WHEN** a visitor on `/` opens the mobile menu
- **THEN** explore links are clearly readable and Book a session remains available

### Requirement: Safe-area padding on public chrome
The fixed public header and the full-screen mobile menu SHALL include padding that respects CSS environment safe-area insets so brand, menu toggle, and Close remain clear of notch and home-indicator regions. The offset applied to page content below the fixed header SHALL account for the same insets, so content is not obscured by the header on devices reporting a top inset. That offset SHALL be derived from the header's actual occupied height rather than assumed.

#### Scenario: Header clears notch
- **WHEN** the public header is shown on a device reporting a top safe-area inset
- **THEN** header controls are not clipped by the system UI region

#### Scenario: Content clears the header on a notched device
- **WHEN** a visitor opens a public route other than Home on a device reporting a top safe-area inset
- **THEN** the first heading of that page is fully visible below the header rather than obscured by it

### Requirement: No WhatsApp in Home hero chrome
Public site chrome SHALL NOT place WhatsApp in the Home hero CTA row.

#### Scenario: Hero without WhatsApp
- **WHEN** a visitor views the Home hero
- **THEN** WhatsApp is not offered as a hero CTA

### Requirement: Footer WhatsApp remains
When a public phone number is configured (Contact & booking reach-me), the public footer SHALL continue to include a WhatsApp link.

#### Scenario: Footer WhatsApp present
- **WHEN** contact phone is configured and a visitor views the public footer
- **THEN** a WhatsApp link is available

### Requirement: Footer blurb from CMS
When a footer blurb is set in Website Site chrome, the public footer SHALL display that blurb; otherwise Soft night default footer copy MAY appear.

#### Scenario: Custom footer blurb
- **WHEN** footer blurb is saved in Site chrome
- **THEN** the public footer shows that blurb

### Requirement: Legal pages
The system SHALL provide Privacy and Terms pages linked from the public site footer (or equivalent secondary links).

#### Scenario: Visitor opens privacy
- **WHEN** a visitor opens the Privacy page
- **THEN** they see privacy policy content suitable for a site that collects contact and booking inquiries

### Requirement: Studio hub chrome
The system SHALL provide a Studio shell at `/studio` with navigation to Dashboard, Gallery, Website, Bookings, Clients, and Settings.

#### Scenario: Authenticated photographer enters Studio
- **WHEN** an authenticated photographer opens `/studio`
- **THEN** they see the six-hub Studio navigation and can open each hub route, including Bookings

### Requirement: Studio nav Gallery label
Studio primary navigation SHALL label the media hub Gallery and link to the Gallery route (replacing Library as the visible hub name).

#### Scenario: Nav shows Gallery
- **WHEN** the photographer views Studio navigation
- **THEN** they see Gallery instead of Library for the media hub

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

### Requirement: Navigation resets reading position
Navigating to a different public route SHALL place the visitor at the start of the new page. Navigating to an in-page target SHALL place the visitor at that target. Returning to a previous entry in history SHOULD restore the position the visitor had on that entry.

#### Scenario: Follow a footer link from deep in a page
- **WHEN** a visitor scrolled far down a page follows a footer link to another route
- **THEN** the new page is presented from its start rather than at the previous scroll offset

#### Scenario: Follow an in-page booking target
- **WHEN** a visitor follows a link targeting the booking form on Contact
- **THEN** the booking form is brought into view

#### Scenario: Navigate back
- **WHEN** a visitor navigates back to a page they had scrolled
- **THEN** their previous reading position on that page is restored

### Requirement: Bypass repeated navigation
Public pages and the Delivery page SHALL provide a control, reachable as the first focusable element, that moves focus past the header and navigation directly to the main content region. The control SHALL be visually hidden until focused.

#### Scenario: Keyboard user bypasses the header
- **WHEN** a keyboard user presses Tab immediately after a public page loads
- **THEN** a visible bypass control receives focus, and activating it moves focus to the main content region

### Requirement: Public routes load without Studio code
Loading a public route SHALL NOT require downloading the code for Studio hubs. Route groups SHALL be delivered separately so that a first-time visitor's initial download covers only the public surface they requested.

#### Scenario: Visitor loads Home
- **WHEN** a first-time visitor loads Home
- **THEN** the Studio hub code is not part of the initial download

#### Scenario: Photographer opens Studio
- **WHEN** the photographer navigates to a Studio hub
- **THEN** the Studio code is fetched at that point and the hub renders

### Requirement: Book reachable from Home chrome

Home SHALL offer a Book affordance in its persistent chrome, not only in the hero. Because Home is a long public page, a visitor who has scrolled past the hero SHALL still have a way to reach booking without scrolling back up or opening the mobile menu.

On Home that control SHALL target Contact booking (`/contact#booking`). On other public routes the Contact-booking target is unchanged. WhatsApp SHALL NOT be added to the desktop header by this requirement.

#### Scenario: Scrolled past the Home hero on desktop

- **WHEN** a visitor on `/` has scrolled past the hero
- **THEN** the header offers a Book control targeting Contact booking

#### Scenario: Home header Book target

- **WHEN** a visitor activates the Home header Book control
- **THEN** they are taken to `/contact#booking` rather than an on-page Home form

#### Scenario: Inner routes unchanged

- **WHEN** a visitor views Portfolio, Work, About, or Contact
- **THEN** the header Book control continues to target Contact booking as it does today

### Requirement: Film grain stays below chrome and dialogs
The public film-grain overlay SHALL NOT sit above the header, skip link, or mobile menu. Overlay chrome SHALL remain operable and un-washed.

#### Scenario: Open mobile menu on Home
- **WHEN** a visitor opens the public mobile menu
- **THEN** menu links are not covered by the grain overlay
