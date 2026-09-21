## ADDED Requirements

### Requirement: Tags in app-like assign flow
Assigning portfolio tags SHALL be possible from Library image detail / modal flows with plain-language wording (tags for Portfolio filters), without requiring a tutorial to find Settings-only assignment as the sole path. Tag list management MAY remain under Settings.

#### Scenario: Tag while editing an image
- **WHEN** the photographer edits an image in Library
- **THEN** they can assign existing portfolio tags without leaving for an unexplained Settings-only dead end as the only option

## MODIFIED Requirements

### Requirement: Assign tags to portfolio images
Authenticated photographers SHALL assign tags to Portfolio images for public filtering, including from Library image editing UI.

#### Scenario: Filterable tag assignment
- **WHEN** the photographer assigns a tag to a Portfolio image
- **THEN** visitors can filter `/portfolio` by that tag when filters are shown
