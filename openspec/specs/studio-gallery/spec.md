# studio-gallery Specification

## Purpose
Defines the Studio Gallery hub for Ibrahim Lens: rename from Library, thumb-first photo wall, room tabs including a separate Portfolio room, density control, quiet edit sheet, and sort/filter — matching quiet Website Studio patterns.
## Requirements
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
The Gallery wall SHALL support sorting and filtering by date, name, and tag, and SHALL provide a control to change column count (about 3–8 columns) with the preference persisted for the photographer’s browser. Those controls SHALL live behind Arrange and SHALL NOT occupy the pinned chrome until Arrange is opened.

#### Scenario: Change density and filter
- **WHEN** the photographer opens Arrange, sets a denser column count, and filters by a tag
- **THEN** the grid updates and the column preference remains on a later visit

### Requirement: Portfolio as a Gallery room
Portfolio SHALL appear as a tab/room inside Gallery with its own photo pile (copies), not as badges on every Gallery tile.

#### Scenario: Open Portfolio room
- **WHEN** the photographer opens the Portfolio room inside Gallery
- **THEN** they browse Portfolio copies separately from the everyday Gallery wall

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

### Requirement: Room-local ingest
Each Gallery hub room SHALL offer adding photos in that room. The Gallery room compact Add and wall drop SHALL upload into the Gallery pile only. The Portfolio room SHALL upload into the Portfolio pile. Albums and Work SHALL upload into the selected album or project (held). Studio SHALL NOT use one header Add as the ingest for Portfolio, albums, and Work.

#### Scenario: Add in Portfolio
- **WHEN** the photographer is in the Portfolio room and adds image files
- **THEN** those files enter the Portfolio pile without switching them to the Gallery room as Gallery originals

#### Scenario: Add on an album
- **WHEN** the photographer is in Albums with an album selected and adds image files
- **THEN** those files attach to that album

#### Scenario: Gallery header Add stays Gallery
- **WHEN** the photographer uses Add photos in the Gallery room chrome
- **THEN** the files enter the Gallery pile only

### Requirement: Live wall while photos land
Adding photos in Gallery or Portfolio SHALL place ghost tiles on that room’s wall immediately and upload in the background. The hub SHALL remain usable while files land: browsing, opening other photos, and switching rooms SHALL NOT wait on a page-wide busy lock. Creates SHALL still run one file at a time.

#### Scenario: Drop onto Gallery
- **WHEN** the photographer drops allowed image files onto the Gallery wall
- **THEN** ghost tiles appear on Gallery at once and the rest of the hub stays clickable while those files upload one after another

#### Scenario: Open another photo during upload
- **WHEN** files are still landing
- **THEN** the photographer can open an already-stored photo without waiting for the batch to finish

### Requirement: Optional rename when the name is still a camera name
Studio SHALL NOT require a review sheet before photos enter Gallery. A skippable rename strip SHALL appear only when a landing file still uses a camera-style name. Skipping SHALL leave the file name as stored. Size and type limits SHALL be explained when a file is rejected, not as always-on header copy.

#### Scenario: Camera filenames
- **WHEN** the photographer adds photos whose names still look like camera dumps
- **THEN** a rename strip appears that can be skipped without blocking the wall

#### Scenario: Already named files
- **WHEN** the photographer adds photos that already have human names
- **THEN** no review or rename sheet is required before they land

#### Scenario: File too large
- **WHEN** a chosen file exceeds the upload limit
- **THEN** that file is rejected with the size ceiling stated, and allowed files in the same pick still land

### Requirement: One surface per Gallery room
Each Gallery room SHALL present one primary surface. Portfolio SHALL offer Photos and Website order as a mode, not both stacked. Albums and Work SHALL open on a cover wall of those items; opening one SHALL show only that item’s photo wall, not the list beside the photos. Sort, tag, and column density SHALL stay behind an Arrange control until opened. A find field MAY remain in the toolbar.

#### Scenario: Portfolio modes
- **WHEN** the photographer opens Portfolio
- **THEN** they see either the photo wall or the public-order list, not both at once

#### Scenario: Arrange stays put away
- **WHEN** the photographer is browsing Gallery and has not opened Arrange
- **THEN** sort, tag, and columns are not occupying the chrome

#### Scenario: Albums open as a wall
- **WHEN** the photographer opens the Albums room with no album selected
- **THEN** they see a wall of album covers, not a list next to photos inside an album

#### Scenario: Open an album
- **WHEN** the photographer opens an album from that wall
- **THEN** they see that album’s photo wall, and can go back to the album wall

#### Scenario: Work cover without a second grid
- **WHEN** the photographer is in a Work photo wall
- **THEN** the cover is marked on the wall, and they can set cover from the photo sheet, without a separate cover picker grid

### Requirement: Photo sheet is the photo, then More
Opening a Gallery photo SHALL show the full image and a Photo name field. Albums, Work, tags, and delete SHALL sit behind More. Opening a Portfolio photo SHALL show the full image and a Line on the website field for the public line. Opening a photo from Portfolio, an album, or Work SHALL NOT offer Albums, Work, or tags — those belong on the Gallery original. Gallery SHALL NOT offer adding to Portfolio from the photo sheet or from wall hover.

#### Scenario: Open a Gallery photo
- **WHEN** the photographer opens a Gallery original
- **THEN** they see the photo and can name it, without a control that sends it to Portfolio

#### Scenario: Open a Portfolio photo
- **WHEN** the photographer opens a Portfolio photo
- **THEN** they can edit the line on the website, and they cannot add that photo to an album or Work from this sheet

#### Scenario: Open a photo already in an album or Work
- **WHEN** the photographer opens a photo from an album or Work
- **THEN** they do not see Albums, Work, tags, or Line on the website on that sheet — Line on the website belongs on Portfolio

### Requirement: Portfolio ingest only from the Portfolio room
Photos SHALL enter Portfolio only while the Portfolio room is open: Add or drop on that room, or From Gallery to copy from Gallery. The Gallery room SHALL NOT add to Portfolio.

#### Scenario: From Gallery on Portfolio
- **WHEN** the photographer is in Portfolio and picks photos From Gallery
- **THEN** those Gallery originals become Portfolio copies

#### Scenario: Gallery does not send
- **WHEN** the photographer is in the Gallery room
- **THEN** hovering or opening a photo does not add it to Portfolio

### Requirement: Plain names in Gallery chrome
Gallery chrome SHALL use Album, Work, Gallery, and Portfolio as the room names. It SHALL NOT call those rooms a set, a story, or the pile. Empty and error copy SHALL use those same names. Form fields SHALL have a visible label that names the answer, and a placeholder that is only a short example of that same answer. lucide icons SHALL sit beside room and toolbar labels so the control is recognizable without replacing the word.

#### Scenario: Empty Gallery
- **WHEN** Gallery has no photos yet
- **THEN** the empty wall says Gallery is empty rather than listing add-review-commit steps

#### Scenario: Work form fields
- **WHEN** the photographer opens a Work
- **THEN** each field is labelled (Name, Page address, Short description, About this Work, Client, Where it was shot, Date of the shoot) and empty placeholders are examples, not nicknames or leftover field names

#### Scenario: Add control
- **WHEN** the photographer looks at Gallery chrome
- **THEN** Add is an icon plus the word Add, not an unlabeled glyph

