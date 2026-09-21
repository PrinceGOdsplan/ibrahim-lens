# studio-quiet-panels Specification

## Purpose

Defines quiet Studio panel patterns for Ibrahim Lens Website and Library: accordion sections with one open at a time, explicit section Save feedback, quieter light inputs, and reliable page scroll unlock after nested overlays.
## Requirements
### Requirement: Accordion sections one open
Website and Library editing surfaces SHALL present collapsible sections where opening one section closes any other open section on that surface.

#### Scenario: Expand a section
- **WHEN** the photographer expands one section while another is open
- **THEN** the previously open section collapses and only the newly opened section remains expanded

### Requirement: Explicit section Save status
Each expanded editable section SHALL provide an explicit Save control and SHALL show clear Saving, Saved, or Error feedback after the photographer attempts to save that section.

#### Scenario: Save section succeeds
- **WHEN** the photographer edits fields in an expanded section and activates Save
- **THEN** the UI shows Saving then Saved (or Error with a recoverable message if the save fails)

### Requirement: Quieter Studio inputs
Studio form controls on Website, Library, Bookings, Clients, Settings, and login SHALL share one field language: underline transparent text and multiline fields; quieter muted labels; a visible focus ring (not only a one-pixel border tint). Closed controls that need a box (selects, phone prefix) SHALL fill with the Studio **panel** token, not the page ground, so they remain visible on night. Studio SHALL NOT adopt public Soft night visitor form styling or Syne/Sora.

#### Scenario: Edit a text field
- **WHEN** the photographer focuses an input in a quiet section
- **THEN** the control remains Studio-light with restrained border treatment

#### Scenario: Edit a text field on light
- **WHEN** the photographer focuses an input in a quiet section on the light desk
- **THEN** the control uses underline Studio chrome with a visible focus ring

#### Scenario: Edit a text field on night
- **WHEN** the photographer focuses an input while night mode is active
- **THEN** the control uses night Studio tokens with the same underline chrome and focus ring, not public Soft night form styling

#### Scenario: Notes match name fields
- **WHEN** the photographer edits booking or person notes
- **THEN** the notes field uses the same underline language as adjacent name and email fields

#### Scenario: Select lifts on night
- **WHEN** night mode is active and a Studio select is shown
- **THEN** the select fill is the panel token, distinct from the page ground

### Requirement: Nested overlay scroll unlock
Opening and closing nested Studio panels or image galleries SHALL NOT leave the underlying page unable to scroll or click after overlays are closed. Body scroll lock SHALL remain coordinated with the count of open overlays.

#### Scenario: Close gallery over editor
- **WHEN** the photographer opens an editor panel, opens the image gallery on top, then closes both
- **THEN** the Studio page remains scrollable and clickable without a refresh

### Requirement: Panels size to available space
A Studio list or panel SHALL NOT be constrained to a fixed height that forces it to scroll while unused space remains below it on screen. Where a region needs its own scroll — a photo wall, or a long list beside a detail pane — its height SHALL derive from the space actually available under any pinned hub chrome, so scrolling begins only when the content genuinely exceeds that leftover height. Scrolling that region SHALL NOT move the Studio shell.

A region SHALL NOT cut a row mid-height at its lower edge in a way that reads as clipped content rather than as a scrollable boundary.

#### Scenario: List shorter than the viewport
- **WHEN** a list's content would fit in the space available on screen
- **THEN** it is shown without an inner scrollbar

#### Scenario: List longer than the viewport
- **WHEN** a list's content exceeds the space available
- **THEN** it scrolls within the space it has, using the full height available to it rather than a smaller fixed height

#### Scenario: Bookings list beside its detail pane
- **WHEN** the photographer opens Clients → Bookings on a desktop viewport
- **THEN** the list occupies the height available beside the detail pane rather than a fixed height with empty space beneath it

#### Scenario: Gallery wall uses leftover height
- **WHEN** the photographer opens Gallery on a desktop viewport
- **THEN** the photo wall fills the height under the pinned Gallery chrome and scrolls there, without unused empty space below a shorter box

### Requirement: Detail panes use the width they occupy

A detail pane SHALL make use of the width it is given. Where a pane is wide and its content is narrow, related fields SHALL be arranged to use that width rather than stacking in a narrow column beside a large empty area.

Content that the photographer needs on arriving at a record SHALL be visible rather than collapsed behind a disclosure while space to show it remains unused. Disclosures remain appropriate for genuinely secondary detail and for narrow viewports.

#### Scenario: Wide booking detail pane

- **WHEN** the photographer selects a booking on a desktop viewport
- **THEN** the pane's fields use the available width rather than occupying a narrow column beside empty space

#### Scenario: Primary detail is visible on arrival

- **WHEN** the photographer opens a booking and space is available to show it
- **THEN** the payment state is visible without first expanding a disclosure

#### Scenario: Narrow viewport keeps disclosures

- **WHEN** the photographer opens a booking on a phone
- **THEN** sections may remain collapsed, because there is not room to show them at once

