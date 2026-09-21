## Purpose

Shared public craft system for Ibrahim Lens: asymmetric atelier tokens, film-thin navigation with mobile menu, intentional motion, immersive image open, and editorial (non-card) layout patterns reused across public surfaces.

## ADDED Requirements

### Requirement: Asymmetric atelier visual system
The public site SHALL use a coherent asymmetric atelier visual system: deep ink / near-black ground, cool ivory text, sparse soft-white or muted-steel accent (not champagne-gold-forward), and editorial typography. Public marketing layouts SHALL NOT rely on bordered card grids as the default container.

#### Scenario: Public page uses atelier tokens
- **WHEN** a visitor opens any primary public marketing page
- **THEN** the page presents the atelier ground/text/accent language without Studio light-tool chrome

#### Scenario: No default card grid on marketing
- **WHEN** Home services or testimonials content is shown
- **THEN** those sections use editorial list or strip layouts rather than equal bordered card tiles as the primary pattern

### Requirement: Film-thin public navigation and mobile menu
Public navigation SHALL support a film-thin or transparent treatment over full-bleed hero surfaces and SHALL provide a dedicated mobile menu (not only wrapping desktop links).

#### Scenario: Hero with film nav
- **WHEN** a visitor views Home with a full-bleed or overlapping hero plane
- **THEN** primary nav does not read as a heavy solid dashboard bar over the image

#### Scenario: Small viewport menu
- **WHEN** a visitor uses a small viewport
- **THEN** they can open a dedicated mobile menu to reach Home, About, Portfolio, Work, and Contact

### Requirement: Intentional motion vocabulary
Public atelier surfaces SHALL include at least two intentional motion treatments (for example reveal, subtle image scale, or type settle) that create presence without decorative noise (no bounce loops, particle effects, or purple glow).

#### Scenario: Home presence motions
- **WHEN** a visitor lands on Home
- **THEN** they experience at least two restrained motion cues tied to brand or hero imagery

### Requirement: Immersive image open
Where Portfolio, Work detail, or Delivery galleries present browseable images, the system SHALL provide an immersive open (lightbox or cinema-style) so visitors can view images larger than the grid thumb, with a clear way to dismiss and move between images when multiple exist.

#### Scenario: Open portfolio image
- **WHEN** a visitor activates a Portfolio gallery image
- **THEN** they see an immersive larger view without watermarks and can dismiss it

#### Scenario: Navigate multiple in immersive view
- **WHEN** a visitor is in immersive view with multiple images in the current set
- **THEN** they can move to the next or previous image and close the view
