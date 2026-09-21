## ADDED Requirements

### Requirement: Compact Add in pinned Gallery chrome
Gallery SHALL offer adding photos as a compact control in the pinned hub chrome (title row), not as a large drop-zone card beside the heading. Dropping files SHALL target the photo wall. Choosing files through a picker SHALL remain available.

#### Scenario: Add from the header
- **WHEN** the photographer activates Add photos in the Gallery chrome
- **THEN** they can pick files without a large dashed upload card occupying the header

#### Scenario: Drop on the wall
- **WHEN** the photographer drops image files onto the Gallery or Portfolio wall
- **THEN** those files begin uploading

### Requirement: Windowed Gallery wall
The Gallery and Portfolio walls SHALL load a first page of thumbnails when the room opens, not the entire pile. Further pages SHALL load as the photographer scrolls the wall. Changing room, sort, or tag filter SHALL start again from the first page.

#### Scenario: Open Gallery with many photos
- **WHEN** the photographer opens Gallery and many photos exist
- **THEN** only a first page of thumbnails is requested, and more load as they scroll the wall

#### Scenario: Filter resets the window
- **WHEN** the photographer changes sort or tag filter
- **THEN** the wall shows the first page of the new result, not a mix of the previous pages
