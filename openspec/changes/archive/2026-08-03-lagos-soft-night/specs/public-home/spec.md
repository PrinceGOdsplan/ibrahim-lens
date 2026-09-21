## ADDED Requirements

### Requirement: Hero CTAs Soft night Book and Portfolio
The Home first viewport SHALL offer Book (scroll to on-page booking) as the primary Soft night CTA (solid brass or equivalent primary treatment) and Portfolio (to `/portfolio`) as a quieter secondary control. The hero SHALL NOT include WhatsApp.

#### Scenario: Hero CTA row
- **WHEN** a visitor views the Home hero
- **THEN** they see a primary Book control and a secondary Portfolio control and do not see WhatsApp in the hero CTA group

### Requirement: Rotating short hero captions
Home hero SHALL continue to rotate short supporting captions (slide- or content-driven). Captions SHALL stay brief and Street Plain–compatible (ops and/or photographer cut lines), not long soft-memory paragraphs.

#### Scenario: Caption rotates
- **WHEN** multiple hero slides or caption sources exist
- **THEN** the supporting line under the brand updates as slides change

### Requirement: WhatsApp under Home booking form
When a public phone is configured, the Home booking section SHALL offer a quiet WhatsApp link under the primary booking submit control so WhatsApp remains an option without replacing the form.

#### Scenario: Prefer WhatsApp from Home booking
- **WHEN** a visitor reaches the Home booking form and phone is configured
- **THEN** they can open WhatsApp from a secondary control under the form while Request booking remains primary

### Requirement: Home About tease Less talk More visuals
The Home About tease headline SHALL present “Less talk.” and “More visuals.” (line-broken as needed) and link to `/about`.

#### Scenario: About tease headline
- **WHEN** a visitor views the Home About tease
- **THEN** the headline is Less talk / More visuals rather than a generic photographer slogan

### Requirement: Home Work section uses Work
Home Work proof chrome SHALL label the section with Work (not Projects).

#### Scenario: Work proof heading
- **WHEN** website-visible Work items appear on Home
- **THEN** section chrome refers to Work

## MODIFIED Requirements

### Requirement: Brand-forward home
The system SHALL present Ibrahim Lens branding as the primary first-viewport signal with a short rotating supporting message, Soft night primary Book CTA scrolling to on-page booking, and Portfolio secondary CTA linking to `/portfolio`, without Studio dashboard chrome.

#### Scenario: Visitor lands on home
- **WHEN** a visitor opens `/`
- **THEN** they see Ibrahim Lens branding, a short supporting message, Book and Portfolio CTAs, and no Studio dashboard chrome
