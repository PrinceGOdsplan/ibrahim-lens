## ADDED Requirements

### Requirement: Public touch targets

Public interactive controls SHALL present a touch target of at least 44×44 CSS pixels. Where a control's visible treatment is deliberately small — a carousel dot, a quiet secondary link — the target SHALL be enlarged by padding around it rather than by enlarging the visible mark, so the design intent is preserved while the control stays reliably tappable.

This SHALL cover, at minimum: slideshow and testimonial position controls, pause controls, footer navigation and legal links, see-more links, booking form inputs and selects, and primary submit controls. Adjacent stacked links SHALL have enough separation that a tap intended for one does not land on its neighbour.

Inline links inside a running paragraph are exempt, since enlarging them would break the line they sit in.

#### Scenario: Carousel position controls

- **WHEN** a visitor taps a testimonial or slideshow position control on a phone
- **THEN** the tap registers on a target at least 44px in both dimensions, while the visible dot stays small

#### Scenario: Stacked footer links

- **WHEN** a visitor taps a footer navigation link on a phone
- **THEN** the intended link activates rather than the one above or below it

#### Scenario: Booking form controls

- **WHEN** a visitor fills the booking form on a phone
- **THEN** each input, select, and the submit control meets the minimum target

#### Scenario: Inline prose link

- **WHEN** a paragraph contains an inline link
- **THEN** it is not padded to 44px, because doing so would disrupt the paragraph
