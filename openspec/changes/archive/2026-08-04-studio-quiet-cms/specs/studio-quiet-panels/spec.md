## Purpose

Defines quiet Studio panel patterns for Ibrahim Lens Website and Library: accordion sections with one open at a time, explicit section Save feedback, quieter light inputs, and reliable page scroll unlock after nested overlays.

## ADDED Requirements

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
Studio form controls on Website and Library SHALL use the light Studio palette with thinner borders and less boxed chrome than heavy outline card buttons, without adopting Soft night public input styling.

#### Scenario: Edit a text field
- **WHEN** the photographer focuses an input in a quiet section
- **THEN** the control remains Studio-light with restrained border treatment

### Requirement: Nested overlay scroll unlock
Opening and closing nested Studio panels or image galleries SHALL NOT leave the underlying page unable to scroll or click after overlays are closed. Body scroll lock SHALL remain coordinated with the count of open overlays.

#### Scenario: Close gallery over editor
- **WHEN** the photographer opens an editor panel, opens the image gallery on top, then closes both
- **THEN** the Studio page remains scrollable and clickable without a refresh
