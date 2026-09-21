## MODIFIED Requirements

### Requirement: Brand-forward home
The system SHALL present Ibrahim Lens branding as the primary first-viewport signal with exactly one short supporting message and a single primary Book call to action. The first viewport SHALL also present one dominant featured image plane (full-bleed and/or controlled overlap). A secondary Portfolio call to action SHALL NOT compete in the first viewport (Portfolio remains available via primary nav).

#### Scenario: Visitor lands on home
- **WHEN** a visitor opens `/`
- **THEN** they see Ibrahim Lens branding, one supporting message, one Book CTA, and one dominant featured plane without Studio dashboard chrome and without a second primary CTA in the first viewport

### Requirement: Portfolio-sourced featured images
Home featured/highlight images SHALL display only images selected from Portfolio, without watermarks. The first featured pick SHALL serve as the hero dominant plane. Any additional featured picks SHALL appear in a horizontal Selected strip (or equivalent asymmetric strip) below the first viewport — not as an equal tile collage inside the hero.

#### Scenario: Single featured hero
- **WHEN** at least one Home featured Portfolio image exists
- **THEN** the first viewport uses one of those images as the dominant plane unmarked

#### Scenario: Extra featured in Selected strip
- **WHEN** more than one Home featured Portfolio image exists
- **THEN** images beyond the hero appear in a Selected strip below the first viewport rather than as a multi-tile grid inside the hero

#### Scenario: No featured configured
- **WHEN** no Home featured images are configured
- **THEN** the hero still presents brand, one line, and Book with an intentional empty or fallback treatment (not a broken layout)

## ADDED Requirements

### Requirement: Editorial below-fold marketing
Services and testimonials on Home, when content exists, SHALL appear below the first viewport in editorial (non-card-grid) layouts consistent with the asymmetric atelier system.

#### Scenario: Home with CMS content below fold
- **WHEN** Website content includes services or testimonials
- **THEN** those sections appear on Home below the hero/Selected area without using bordered equal card grids as the primary pattern
