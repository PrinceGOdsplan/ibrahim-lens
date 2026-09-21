## ADDED Requirements

### Requirement: Portfolio pile feeds public Portfolio
Public Portfolio and Portfolio-ordered Studio curation SHALL use the Portfolio photo pile (copies), not Gallery membership flags on everyday uploads.

#### Scenario: Public Portfolio after promote
- **WHEN** a photo exists only as a Portfolio copy
- **THEN** it can appear on public `/portfolio` according to Portfolio order

### Requirement: Migrate in_portfolio flags to Portfolio copies
On upgrade, media previously flagged in Portfolio SHALL become Portfolio copies while originals remain in the Gallery pile.

#### Scenario: Migrate existing Portfolio flags
- **WHEN** migration runs on an existing Studio library
- **THEN** formerly flagged Portfolio images exist as Portfolio copies and Gallery originals remain without requiring those flags for membership
