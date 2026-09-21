# public-soft-night Specification

## Purpose

Defines Soft night public craft for Ibrahim Lens: warm-dark color ladder, brass accent diet, Syne/Sora type rules, quieter eyebrows, and Street Plain voice for chrome (not Studio).

## Requirements

### Requirement: Soft night color ladder
The public site SHALL use a warm-dark Soft night palette: warm-brown near-black base, a slightly raised surface for booking/forms, a deeper well for atmosphere panels (testimonials/footer), warm off-white foreground, separate body vs muted text roles, and a softer brass accent reserved for primary Book actions and rare emphasis—not for every section eyebrow.

Studio defaults to its light tool desk. Studio MAY offer an opt-in night appearance that is Soft-night–related in colour only; public Soft night type (Syne/Sora), Street Plain voice, and visitor craft remain public-only.

#### Scenario: Public pages use Soft night tokens
- **WHEN** a visitor views any public page chrome
- **THEN** backgrounds and text read as warm dark Soft night (not cool metallic black-and-gold everywhere)

#### Scenario: Studio night is Soft-night–related, not public craft
- **WHEN** the photographer enables Studio night mode
- **THEN** Studio uses a Soft-night–related colour ladder while keeping Studio type and tool patterns, and public Soft night visitor craft is unchanged

### Requirement: Accent diet
Brass/accent color SHALL NOT be the default color for section eyebrows, footer link hovers, or decorative labels. Primary Book CTAs MAY use solid brass; WhatsApp and secondary links SHALL remain muted or foreground—not solid brass and not official WhatsApp green chrome.

#### Scenario: Eyebrows are quiet
- **WHEN** a visitor views section labels on Home or inner pages
- **THEN** those labels are muted/quiet when present, and brass is not applied to every eyebrow

### Requirement: Typography pairing
Public display type SHALL remain Syne and body/UI type SHALL remain Sora. Section eyebrows SHALL be fewer and quieter (reduced tracking shout) than the prior street-energy gold-eyebrow pattern.

This SHALL hold for every public surface a visitor can see, including surfaces rendered outside the page's element tree — the mobile navigation drawer, the full-size image viewer, and any dialog or overlay attached elsewhere in the document. A public overlay SHALL NOT fall back to the Studio faces because of where it is mounted. Studio's own type pairing remains Cormorant/Figtree and SHALL NOT appear on a public surface.

#### Scenario: Fonts unchanged pairing
- **WHEN** a visitor views public headlines and body copy
- **THEN** headlines use Syne and body uses Sora

#### Scenario: Mobile navigation drawer

- **WHEN** a visitor opens the public mobile navigation
- **THEN** its links and wordmark use the public pairing, matching the header wordmark rather than the Studio serif

#### Scenario: Full-size image viewer chrome

- **WHEN** a visitor opens a photograph at full size
- **THEN** the viewer's caption, counter, and controls use the public pairing

### Requirement: Street Plain chrome voice
Public chrome copy SHALL prefer Street Plain wording grounded in the photographer’s caption rhythm (short, concrete). Home About tease headline SHALL be “Less talk.” / “More visuals.” (or equivalent line break). Contact page H1 SHALL remain “Let’s shoot”. Work surfaces SHALL use the product word Work, not Projects.

#### Scenario: About tease on Home
- **WHEN** a visitor views the Home About tease
- **THEN** the tease headline communicates Less talk / More visuals rather than a generic “eye behind the frame” slogan

#### Scenario: Work naming
- **WHEN** a visitor views Work index or Home Work proof headings
- **THEN** chrome uses Work (not Projects) as the product label

### Requirement: Soft night remains mobile-usable
Soft night public craft (warm-dark tokens, brass Book CTAs, quiet eyebrows, Street Plain voice) SHALL remain usable on narrow viewports: interactive chrome contrast and Book hierarchy SHALL not degrade solely because the visitor is on a phone-width screen.

#### Scenario: Soft night on phone
- **WHEN** a visitor uses the public site on a narrow viewport
- **THEN** Soft night Book CTAs and readable chrome remain intact (no return to muted-everywhere mobile menu or inaccessible hero controls)

### Requirement: Soft night content-fed not theme-CMS
Soft night public craft tokens, fonts, Book brass treatment, sticky booking, and film→solid header SHALL remain code-defined. Studio SHALL feed Soft night content and structure (Home curator, Contact & booking, Site chrome copy) without exposing theme controls.

#### Scenario: No token editor
- **WHEN** the photographer opens Website Site chrome
- **THEN** they can edit content chrome (footer, eyebrows, legal, SEO) but not Soft night color or font tokens
