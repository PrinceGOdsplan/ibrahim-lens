## Purpose

Opt-in curation of Library images for the public Portfolio gallery and Home featured picks.

## ADDED Requirements

### Requirement: Portfolio membership
Authenticated photographers SHALL add or remove Library images from Portfolio and reorder Portfolio images.

#### Scenario: Show on Portfolio
- **WHEN** the photographer marks a Library image for Portfolio
- **THEN** that image becomes eligible for display on `/portfolio`

#### Scenario: Remove from Portfolio
- **WHEN** the photographer removes a Library image from Portfolio
- **THEN** it is no longer shown on `/portfolio` but remains in the Library

### Requirement: Home featured source
Home featured/highlight images SHALL be selectable only from images that are in Portfolio.

#### Scenario: Featured pick must be portfolio image
- **WHEN** the photographer chooses Home featured images
- **THEN** only Portfolio-membered Library images are available to pick
