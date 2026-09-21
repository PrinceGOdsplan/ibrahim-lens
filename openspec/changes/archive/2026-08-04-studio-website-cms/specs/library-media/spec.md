## ADDED Requirements

### Requirement: Caption editing in Library
Authenticated photographers SHALL edit a Library image caption from Studio. Public Soft night SHALL use captions for hero rotating lines and image alt/labels where applicable.

#### Scenario: Update caption
- **WHEN** the photographer saves a new caption on a Portfolio image used in Home featured
- **THEN** the Home hero supporting line can use that caption

### Requirement: Artist portrait flag
Library media SHALL support an explicit Artist portrait flag. Setting a new Artist portrait SHALL clear the previous Artist flag so at most one image is flagged. Public About and Home artist slots SHALL use the flagged image rather than a caption equal to “Artist”.

#### Scenario: Flag Artist portrait
- **WHEN** the photographer marks a Library image as Artist portrait
- **THEN** `/about` and Home artist presentation use that image

#### Scenario: Caption Artist no longer required
- **WHEN** an image has caption “Artist” but is not flagged
- **THEN** Soft night does not treat it as the Artist portrait solely because of that caption
