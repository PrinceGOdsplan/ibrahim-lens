## MODIFIED Requirements

### Requirement: Public site navigation
The system SHALL provide public navigation to Home, About, Portfolio, Work, and Contact. Delivery gallery routes SHALL NOT appear in main navigation. On viewports where horizontal link wrapping would degrade the atelier hero, the system SHALL provide a dedicated mobile menu. Over full-bleed or overlapping hero surfaces, public nav SHALL support a film-thin or transparent treatment.

#### Scenario: Visitor opens the site
- **WHEN** a visitor loads the public site
- **THEN** they see Ibrahim Lens branding and links to Home, About, Portfolio, Work, and Contact

#### Scenario: Mobile menu available
- **WHEN** a visitor uses a small viewport on the public site
- **THEN** they can open a dedicated menu to reach the primary public destinations

#### Scenario: Delivery path not in nav
- **WHEN** a visitor views primary public navigation
- **THEN** Delivery `/g/:token` routes are not listed as main nav items
