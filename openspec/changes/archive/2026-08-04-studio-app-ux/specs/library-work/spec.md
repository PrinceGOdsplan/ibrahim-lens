## ADDED Requirements

### Requirement: Work list cover thumbnails
Library Work list cards SHALL show a cover thumbnail: the Work cover image when set, otherwise the first attached image. The photographer MAY override which attached image is the cover.

#### Scenario: Work list shows thumb
- **WHEN** the photographer views the Work list with projects that have images
- **THEN** each card shows a cover thumbnail

#### Scenario: Default cover is first image
- **WHEN** no cover override is set
- **THEN** the first image in the Work set is used as the list thumbnail
