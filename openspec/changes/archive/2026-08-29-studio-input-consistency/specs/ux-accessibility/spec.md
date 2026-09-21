## MODIFIED Requirements

### Requirement: Visible keyboard focus
Every interactive control SHALL present a focus indicator visible against its own background. Where a default focus outline is suppressed, a replacement indicator SHALL be provided that does not rely solely on a one-pixel border colour change.

Studio text, textarea, and select fields SHALL use the same visible focus ring on light and night.

#### Scenario: Public booking field focus
- **WHEN** a keyboard user focuses a public booking form field
- **THEN** a focus indicator clearly distinguishable from the unfocused state is shown

#### Scenario: Primary Book action focus
- **WHEN** a keyboard user focuses the primary Book action
- **THEN** a focus indicator is shown

#### Scenario: Studio notes field focus
- **WHEN** a keyboard user focuses a Studio notes textarea
- **THEN** a focus ring is shown, not only a bottom-border colour change

## ADDED Requirements

### Requirement: Studio save status contrast
Transient Studio save confirmation text SHALL use a Studio token that meets 4.5:1 against the active Studio ground (light or night). It SHALL NOT use a light-only green that fails on the night desk.

#### Scenario: Photo name saved on night
- **WHEN** the photographer saves a photo name in the image sheet while night mode is active
- **THEN** the Saved status remains readable against the night panel
