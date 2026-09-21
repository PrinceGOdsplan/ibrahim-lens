## ADDED Requirements

### Requirement: Album list cover thumbnails
Library Album list cards SHALL show a cover thumbnail using the first image in the album by default. The photographer MAY override which album image is shown as the cover when the product supports an album cover field; otherwise first-image default is sufficient.

#### Scenario: Album list shows thumb
- **WHEN** the photographer views the Albums list with albums that have images
- **THEN** each card shows a thumbnail from the album’s images
