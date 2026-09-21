## ADDED Requirements

### Requirement: Hero CTAs are Book and Portfolio only
The Home first viewport SHALL offer exactly two primary actions: Book (scroll to on-page booking) and Portfolio (navigate to `/portfolio`). The hero SHALL NOT include a WhatsApp control.

#### Scenario: Hero CTA row
- **WHEN** a visitor views the Home hero
- **THEN** they see Book and Portfolio CTAs and do not see WhatsApp in the hero CTA group

### Requirement: Street-craft accents on Home
Home SHALL use the shared public street-craft ornamental system (sparse grain/ribbons) without replacing photo-first hierarchy.

#### Scenario: Home craft
- **WHEN** a visitor scrolls Home sections
- **THEN** sparse ornamental accents are present and do not obscure Book, lanes, Work proof, or booking

## MODIFIED Requirements

### Requirement: Brand-forward home
The system SHALL present Ibrahim Lens branding as the primary first-viewport signal with a short supporting message and primary call to action, plus a Portfolio secondary CTA linking to `/portfolio`.

#### Scenario: Visitor lands on home
- **WHEN** a visitor opens `/`
- **THEN** they see Ibrahim Lens branding, one supporting message, Book and Portfolio CTAs, and no Studio dashboard chrome
