## Purpose

Defines the Studio Gallery hub for Ibrahim Lens: rename from Library, thumb-first photo wall, room tabs including a separate Portfolio room, density control, quiet edit sheet, and sort/filter — matching quiet Website Studio patterns.

## ADDED Requirements

### Requirement: Gallery hub naming
Studio SHALL label the media hub Gallery (not Library) in navigation and page chrome. The shared Website image picker SHALL keep pick-oriented naming (e.g. Pick photos), not replace the Gallery hub.

#### Scenario: Open Gallery from Studio nav
- **WHEN** the photographer opens Studio → Gallery
- **THEN** they see the Gallery hub with room tabs for Gallery, Portfolio, Albums, and Work

### Requirement: Thumb-first Gallery wall
The Gallery room photo wall SHALL show image thumbnails without caption text or Portfolio membership badges under each tile. Details and infrequent actions SHALL open in a quiet slide-in sheet (usable on phone like Website panels).

#### Scenario: Browse Gallery wall
- **WHEN** the photographer views the Gallery room
- **THEN** they see a clean thumbnail grid without under-tile labels, and tapping a photo opens a quiet sheet for details

### Requirement: Sort filter and column density
The Gallery wall SHALL support sorting and filtering by date, name, and tag, and SHALL provide a control to change column count (about 3–8 columns) with the preference persisted for the photographer’s browser.

#### Scenario: Change density and filter
- **WHEN** the photographer sets a denser column count and filters by a tag
- **THEN** the grid updates and the column preference remains on a later visit

### Requirement: Portfolio as a Gallery room
Portfolio SHALL appear as a tab/room inside Gallery with its own photo pile (copies), not as badges on every Gallery tile.

#### Scenario: Open Portfolio room
- **WHEN** the photographer opens the Portfolio room inside Gallery
- **THEN** they browse Portfolio copies separately from the everyday Gallery wall
