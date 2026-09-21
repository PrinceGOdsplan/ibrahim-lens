## MODIFIED Requirements

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
