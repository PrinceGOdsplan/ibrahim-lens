## Purpose

Composes the Ibrahim Lens home page from brand hero, Portfolio-sourced featured images, marketing teasers, and a Book CTA that scrolls to the booking form.

## ADDED Requirements

### Requirement: Brand-forward home
The system SHALL present Ibrahim Lens branding as the primary first-viewport signal with a short supporting message and primary call to action.

#### Scenario: Visitor lands on home
- **WHEN** a visitor opens `/`
- **THEN** they see Ibrahim Lens branding, one supporting message, and a clear CTA without Studio dashboard chrome

### Requirement: Portfolio-sourced featured images
Home featured/highlight images SHALL display only images selected from Portfolio, without watermarks.

#### Scenario: Featured images render
- **WHEN** Home featured picks exist from Portfolio
- **THEN** those images appear in the Home featured section unmarked

### Requirement: Integrated marketing sections
The system SHALL render services teaser and testimonials teaser on Home when content exists, without separate primary nav routes for those sections.

#### Scenario: Home with CMS content
- **WHEN** Website content includes services or testimonials
- **THEN** those sections appear on Home

### Requirement: Book CTA scrolls to booking form
Home SHALL provide a Book CTA that scrolls to the booking request form on the page (same form definition as Contact).

#### Scenario: Home book CTA
- **WHEN** a visitor activates the Home Book CTA
- **THEN** the page scrolls to the booking request form configured in the Website Contact editor
