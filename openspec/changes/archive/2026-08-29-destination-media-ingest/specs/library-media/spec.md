## MODIFIED Requirements

### Requirement: Two photo piles Gallery and Portfolio
Media SHALL live in three memberships: Gallery (everyday pile), Portfolio (public Portfolio pile, including one-way copies from Gallery and files uploaded into Portfolio), and held (files uploaded into an album or Work that MUST NOT appear on the Gallery wall). Sending a Gallery photo to Portfolio SHALL create a Portfolio copy without replacing the Gallery original. Uploading a file into Portfolio, an album, or Work SHALL NOT create a Gallery original.

#### Scenario: Send to Portfolio
- **WHEN** the photographer sends a Gallery photo to Portfolio
- **THEN** a Portfolio copy is created and the Gallery original remains

#### Scenario: Gallery wall is Gallery-only
- **WHEN** the photographer opens the Gallery room after uploading into Portfolio, an album, or Work
- **THEN** those destination uploads are absent from the Gallery wall

## ADDED Requirements

### Requirement: Held photos stay off the Gallery wall
A file uploaded into an album or Work SHALL be stored as a held photo, attached to that album or Work, and SHALL NOT be listed as Gallery. One held photo MAY belong to more than one album or Work. Website image pickers MAY continue to offer Gallery and Portfolio piles and SHALL NOT treat held photos as Gallery.

#### Scenario: Upload into an album
- **WHEN** the photographer uploads files while an album is selected
- **THEN** those files are attached to that album and do not appear on the Gallery wall

### Requirement: Last holder deletes held photos
Deleting an album or Work SHALL remove that album or Work’s attachment. If a held photo is then attached to no album and no Work, the system SHALL delete that held photo as part of the same confirmed delete. Gallery and Portfolio photos attached to the album or Work SHALL remain in their piles.

#### Scenario: Delete the last album that holds a photo
- **WHEN** the photographer deletes an album that is the last album or Work holding a held photo
- **THEN** after confirm, the album is gone and that held photo is deleted

#### Scenario: Shared held photo survives
- **WHEN** the photographer deletes an album that shares a held photo with another album or Work
- **THEN** the album is gone and the held photo remains on the other album or Work
