## ADDED Requirements

### Requirement: Visual pick for delivery contents
Studio SHALL let the photographer choose Delivery contents by tapping photographs, album covers, or Work covers. It SHALL NOT use a checkbox list of filenames as the photo picker. Photo picks SHALL use the shared Studio image gallery (Gallery and Portfolio). Album and Work picks SHALL show covers. Create SHALL stay disabled until a client name (or Person) and at least one valid source selection exist.

#### Scenario: Pick photographs for a delivery
- **WHEN** the photographer creates a Delivery from photographs
- **THEN** they tap thumbs in the shared image gallery and confirm, rather than ticking a filename checkbox list

#### Scenario: Pick an album or Work
- **WHEN** the photographer creates a Delivery from albums or a Work project
- **THEN** they tap cover tiles for those collections

#### Scenario: Create without a selection
- **WHEN** the photographer has a client name but has not chosen photographs, albums, or Work
- **THEN** Create stays disabled (or is rejected with an error next to the create panel)

### Requirement: Delivery file copy completes with create
When an authenticated photographer creates a Delivery, the system SHALL copy the selected originals into per-delivery files as part of that create. The photographer SHALL NOT be required to download and re-upload those originals in the browser. If the copy cannot complete, the Delivery SHALL NOT remain as a working gallery with missing files.

#### Scenario: Create copies files without a browser re-upload
- **WHEN** the photographer creates a Delivery from selected photographs
- **THEN** the Delivery’s client gallery files exist without the Studio tab fetching each original and posting it again

#### Scenario: Copy failure does not leave a half delivery
- **WHEN** the file copy fails after a Delivery record is inserted
- **THEN** the photographer sees a create error and that Delivery is not left as an active gallery with no files

### Requirement: Inspect and edit a delivery after create
Studio SHALL let the photographer open a Delivery after it is created and see the photographs on it. They SHALL be able to edit client name, email, and studio notes. Changing the photograph set after create is out of scope.

#### Scenario: Open a delivery in Studio
- **WHEN** the photographer selects a Delivery in Clients → Deliveries
- **THEN** they see that Delivery’s photographs and can save a new name, email, or studio notes

### Requirement: Guest gallery shows only that Delivery's files
The tokenized `/g/:token` page SHALL list only `delivery_files` that belong to that Delivery, even when the visitor is also signed in to Studio. Photograph thumbs SHALL use file sizes that exist on those copies.

#### Scenario: Logged-in preview matches the selection
- **WHEN** the photographer opens their own Delivery link while signed in to Studio
- **THEN** the gallery shows only the photographs chosen for that Delivery, and those photographs render
