## MODIFIED Requirements

### Requirement: Tag filtering
The system SHALL allow visitors to filter portfolio images by tag when tags exist.

The filter row SHALL present each tag as a discrete control with its own bounded hit area, so the row reads as a set of controls rather than a run of words. The selected filter SHALL be distinguishable by more than colour alone — a fill, an outline, an underline, or equivalent — so the current state survives for visitors who do not perceive the colour difference.

The tag list offered to visitors SHALL be presented in a stable, readable order that does not separate tags differing only in letter case, and SHALL offer an option to clear the filter and see everything.

#### Scenario: Filter by tag
- **WHEN** a visitor selects a portfolio tag
- **THEN** only Portfolio images with that tag are shown

#### Scenario: Selected filter is distinguishable without colour

- **WHEN** a filter is selected
- **THEN** its state is conveyed by a non-colour treatment in addition to any colour change

#### Scenario: Filter row reads as controls

- **WHEN** a visitor views the filter row
- **THEN** each tag presents as its own control rather than as words in a continuous line of text

#### Scenario: Clearing the filter

- **WHEN** a visitor has selected a tag and wants to see the full gallery
- **THEN** an option to clear the filter is available
