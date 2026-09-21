## ADDED Requirements

### Requirement: Work cover picker
Authenticated photographers SHALL choose a cover image for a Work project from that project’s attached Library images (or clear it to fall back to the first image).

#### Scenario: Set cover
- **WHEN** the photographer picks a cover from the Work’s images
- **THEN** public Work listings and detail prefer that cover

### Requirement: Work list reorder
Authenticated photographers SHALL reorder website-visible Work projects in Studio so `/work` list order matches Studio sort.

#### Scenario: Reorder Work
- **WHEN** the photographer changes Work sort order
- **THEN** `/work` lists projects in that order

### Requirement: Work eligible for Home curator
Website-visible Work projects SHALL be selectable in Website → Home Work picks (maximum 3). Work that is not shown on the website SHALL NOT appear in that picker.

#### Scenario: Hidden Work not pickable
- **WHEN** a Work project is not shown on the website
- **THEN** it cannot be added to Home Work picks
