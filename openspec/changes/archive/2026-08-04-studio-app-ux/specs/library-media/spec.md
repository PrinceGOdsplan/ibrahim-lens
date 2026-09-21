## ADDED Requirements

### Requirement: Compact Library image presentation
Library image grids SHALL use compact thumbnails and show clear image metadata (at least caption presence and key flags such as Portfolio / About photo) without requiring oversized tiles or infinite-scroll browsing as the primary pattern.

#### Scenario: Scan Library on phone
- **WHEN** the photographer browses Library images on a phone
- **THEN** they can recognize caption/flag state from compact tiles and meta without endless oversized cards

### Requirement: Upload flow clarity
Library upload SHALL present a straightforward add-photos flow with plain-language errors (size/type) suitable for phone use.

#### Scenario: Upload from phone
- **WHEN** the photographer uploads allowed images from a phone
- **THEN** images enter the Library with clear success or error feedback

### Requirement: Caption after gallery pick
When Studio opens the shared gallery for a Website or Library task, confirming a selection SHALL return the photographer to a detail step where caption (and role flags such as About photo when applicable) can be set for the selected image(s).

#### Scenario: Caption Featured pick
- **WHEN** the photographer selects a Featured image and returns from the gallery
- **THEN** they can edit that image’s caption in the Featured modal

### Requirement: About photo flag
Library media SHALL support an explicit About photo flag (stored as artist portrait when needed). Setting a new About photo SHALL clear the previous flag so at most one image is flagged. Public About and Home artist slots SHALL use the flagged image rather than a caption equal to “Artist”. Studio SHALL label this control About photo.

#### Scenario: Flag About photo
- **WHEN** the photographer marks a Library image as About photo
- **THEN** `/about` and Home artist presentation use that image

#### Scenario: Caption Artist no longer required
- **WHEN** an image has caption “Artist” but is not flagged
- **THEN** Soft night does not treat it as the About photo solely because of that caption
