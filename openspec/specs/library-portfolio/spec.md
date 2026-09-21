# library-portfolio Specification

## Purpose

Opt-in curation of Library images for the public Portfolio gallery and Home featured picks.
## Requirements
### Requirement: Portfolio membership
Authenticated photographers SHALL add or remove Library images from Portfolio and reorder Portfolio images.

#### Scenario: Show on Portfolio
- **WHEN** the photographer marks a Library image for Portfolio
- **THEN** that image becomes eligible for display on `/portfolio`

#### Scenario: Remove from Portfolio
- **WHEN** the photographer removes a Library image from Portfolio
- **THEN** it is no longer shown on `/portfolio` but remains in the Library

### Requirement: Home featured source
Home featured/highlight images SHALL be selectable from the Gallery pile or the Portfolio pile.

#### Scenario: Featured pick must be portfolio image
- **WHEN** the photographer chooses Home featured images
- **THEN** they may pick from Gallery or Portfolio photos

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

### Requirement: Direct Portfolio upload
Authenticated photographers SHALL upload files directly into the Portfolio pile. Those files SHALL be eligible for public `/portfolio` according to Portfolio order and SHALL NOT create a Gallery original.

#### Scenario: Upload in the Portfolio room
- **WHEN** the photographer adds image files from the Portfolio room
- **THEN** those files appear in the Portfolio pile and not on the Gallery wall

