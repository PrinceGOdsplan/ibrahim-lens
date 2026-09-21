## ADDED Requirements

### Requirement: Book reachable from Home chrome

Home SHALL offer a Book affordance in its persistent chrome, not only in the hero. Because Home is the longest public page, a visitor who has scrolled past the hero SHALL still have a way to reach booking without scrolling back up or opening the mobile menu.

On Home that control SHALL target the on-page booking section, consistent with the Home Book CTA, rather than navigating to Contact. On other public routes the existing Contact-booking target is unchanged. WhatsApp SHALL NOT be added to the desktop header by this requirement.

#### Scenario: Scrolled past the Home hero on desktop

- **WHEN** a visitor on `/` has scrolled past the hero
- **THEN** the header offers a Book control, and activating it brings the on-page booking section into view

#### Scenario: Home header Book target

- **WHEN** a visitor activates the Home header Book control
- **THEN** the page scrolls to the on-page booking form rather than navigating to `/contact`

#### Scenario: Inner routes unchanged

- **WHEN** a visitor views Portfolio, Work, About, or Contact
- **THEN** the header Book control continues to target Contact booking as it does today
