## ADDED Requirements

### Requirement: Explore nav without Home link
Primary public navigation SHALL link to About, Portfolio, Work, and Contact. The brand/wordmark SHALL navigate to Home. Delivery gallery routes SHALL NOT appear in main navigation. A dedicated Home text link SHALL NOT appear in the primary nav row.

#### Scenario: Visitor opens the site
- **WHEN** a visitor loads the public site
- **THEN** they see Ibrahim Lens branding and links to About, Portfolio, Work, and Contact without a separate Home nav item

### Requirement: Home header film then solid on scroll
On the Home route, the public header SHALL start as a film treatment over the hero and SHALL switch to a solid Soft night bar (blur/raised surface acceptable) after the visitor scrolls past the hero region. Prefer fixed/sticky behavior so navigation remains available while scrolling Home.

#### Scenario: Scroll past hero
- **WHEN** a visitor on `/` scrolls past the hero
- **THEN** the header becomes a solid Soft night bar and remains usable

### Requirement: Book on non-home chrome
On public routes other than Home, desktop primary chrome SHALL include a Book control targeting Contact booking (`/contact#booking`). WhatsApp SHALL NOT appear in the header nav (desktop or mobile menu); WhatsApp remains under the booking form and in the footer when phone is configured.

#### Scenario: Inner page desktop Book
- **WHEN** a visitor views Portfolio, Work, About, or Contact on a desktop-width viewport
- **THEN** they can reach Book from the header targeting Contact booking, and WhatsApp is not shown in the header

### Requirement: Mobile menu Book
The public mobile menu SHALL offer Book a session (to Contact booking) in addition to primary explore links. WhatsApp SHALL NOT be required in the mobile menu when it remains available under booking and in the footer.

#### Scenario: Mobile Book
- **WHEN** a visitor opens the mobile menu
- **THEN** Book a session is available and WhatsApp is not required in that menu

### Requirement: No WhatsApp in Home hero chrome
Public site chrome SHALL NOT place WhatsApp in the Home hero CTA row.

#### Scenario: Hero without WhatsApp
- **WHEN** a visitor views the Home hero
- **THEN** WhatsApp is not offered as a hero CTA

### Requirement: Footer WhatsApp remains
When a public phone number is configured, the public footer SHALL continue to include a WhatsApp link.

#### Scenario: Footer WhatsApp present
- **WHEN** contact phone is configured and a visitor views the public footer
- **THEN** a WhatsApp link is available

## MODIFIED Requirements

### Requirement: Public site navigation
The system SHALL provide public navigation via Ibrahim Lens branding (to Home) plus links to About, Portfolio, Work, and Contact. Delivery gallery routes SHALL NOT appear in main navigation. Home SHALL be reachable from the brand/wordmark, not as a duplicate primary nav text link.

#### Scenario: Visitor opens the site
- **WHEN** a visitor loads the public site
- **THEN** they see Ibrahim Lens branding and links to About, Portfolio, Work, and Contact
