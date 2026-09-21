## MODIFIED Requirements

### Requirement: Book on non-home chrome
On public routes, including Home, desktop primary chrome SHALL include a Book control targeting Contact booking (`/contact#booking`). On Home this control SHALL remain available while the film hero is on screen, not only after the header turns solid. WhatsApp SHALL NOT appear in the desktop header nav. WhatsApp remains under the booking form and in the footer when phone is configured, and MAY also appear in the mobile menu alongside Instagram.

#### Scenario: Inner page desktop Book
- **WHEN** a visitor views Portfolio, Work, About, or Contact on a desktop-width viewport
- **THEN** they can reach Book from the header targeting Contact booking, and WhatsApp is not shown in the desktop header

#### Scenario: Home film header Book
- **WHEN** a visitor is on `/` still over the hero
- **THEN** the header still offers Book targeting `/contact#booking`

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
- **THEN** the header Book control continues to target Contact booking

## ADDED Requirements

### Requirement: Film grain stays below chrome and dialogs
The public film-grain overlay SHALL NOT sit above the header, skip link, or mobile menu. Overlay chrome SHALL remain operable and un-washed.

#### Scenario: Open mobile menu on Home
- **WHEN** a visitor opens the public mobile menu
- **THEN** menu links are not covered by the grain overlay
