# public-mobile Specification

## Purpose

Defines Soft night public mobile responsiveness for Ibrahim Lens: safe areas, readable mobile menu, hero chrome, denser scroll on small screens, and booking submit comfort — without changing Studio or desktop Soft night identity.

## Requirements

### Requirement: Narrow viewport usability
On viewports roughly phone-width, the public site SHALL remain usable without horizontal overflow: brand, Book CTAs, and primary navigation (hamburger menu) SHALL remain reachable, and Soft night contrast SHALL keep interactive text readable.

#### Scenario: Phone-width Home
- **WHEN** a visitor opens `/` on a narrow viewport
- **THEN** they can open the menu, read the hero brand and Book CTA, and scroll the page without horizontal scrolling

### Requirement: Safe area respect
Fixed public header and full-screen mobile menu SHALL respect device safe-area insets (notch / home indicator) so controls are not obscured by system UI.

#### Scenario: Notched device header
- **WHEN** a visitor uses a device with a top safe-area inset
- **THEN** header brand and menu controls sit clear of the system status/notch region

### Requirement: Mobile menu contrast
Public mobile menu explore links SHALL use foreground-level contrast by default. Only the current route MAY appear muted (or equivalently emphasized); links SHALL NOT all appear muted when no explore item matches the current path (e.g. Home).

#### Scenario: Menu opened from Home
- **WHEN** a visitor on `/` opens the mobile menu
- **THEN** About, Portfolio, Work, and Contact are clearly readable (not all muted)

### Requirement: Hero slide controls on small screens
Home hero slideshow controls SHALL expose a single current slide state for accessibility, provide adequate touch targets, and sit clear of the bottom system gesture area alongside hero CTAs.

#### Scenario: Slide control state
- **WHEN** multiple hero slides exist
- **THEN** only the active slide control is marked current and controls remain tappable above the home-indicator zone

### Requirement: Reduced scroll density on small screens
On small screens, Home lane cards SHALL use a slightly shorter aspect than desktop, and atmosphere masonry SHALL use a single column below a small breakpoint, to reduce excessive vertical stacking without abandoning photo-first Soft night.

#### Scenario: Lanes and atmosphere on phone
- **WHEN** a visitor scrolls Home lanes and atmosphere on a narrow viewport
- **THEN** lanes are not full desktop-tall aspect stacks and atmosphere is single-column

### Requirement: Booking submit comfort on small screens
The shared public booking form SHALL keep Request booking as the primary Soft night action and, on small screens, keep that submit control easy to reach while filling a long form (sticky or equivalently persistent primary affordance). WhatsApp under submit SHALL remain secondary when phone is configured.

#### Scenario: Long booking form on phone
- **WHEN** a visitor fills the booking form on a narrow viewport with several fields
- **THEN** they can reach Request booking without losing the primary Soft night CTA hierarchy, and WhatsApp remains a quiet secondary option when available

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
