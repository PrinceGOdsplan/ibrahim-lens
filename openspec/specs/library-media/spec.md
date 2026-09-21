# library-media Specification

## Purpose

Library media pool where all finished photographer images are uploaded and stored before any public or delivery use.
## Requirements
### Requirement: Upload and store finished images
Authenticated photographers SHALL upload finished images into the Library where they are stored whether or not they are used elsewhere.

#### Scenario: Upload without further use
- **WHEN** the photographer uploads images and does not add them to Portfolio, albums, Work, or a Delivery
- **THEN** the images remain stored in the Library as storage-only assets

### Requirement: Maximum upload size
The system SHALL reject uploads that exceed the configured maximum file size (default 25MB per file via env).

#### Scenario: Oversized file rejected
- **WHEN** the photographer uploads a file larger than the configured maximum
- **THEN** the upload is rejected with a clear error and the file is not stored

### Requirement: Originals and thumbnails
The system SHALL store the original image and generate thumbnail derivatives for use in Studio grids and public listings.

#### Scenario: Grid uses thumbnail
- **WHEN** Library or public grids display an image
- **THEN** a thumbnail derivative is used while the original remains available for Delivery downloads and full-size viewing where appropriate

### Requirement: Stored originals remain unmarked
Uploaded Library originals SHALL NOT be stamped with a watermark in storage. Public listings that use those originals or their thumbnails SHALL remain unmarked. A quiet view mark MAY appear only on Delivery gallery viewing, not on the stored file and not on download originals.

#### Scenario: Original remains unmarked
- **WHEN** an image is stored in the Library or shown on a public page
- **THEN** the stored file is not stamped with a watermark overlay

#### Scenario: Delivery download still unmarked
- **WHEN** a client downloads an image from a valid Delivery
- **THEN** the downloaded file is the unmarked original-resolution asset

### Requirement: Multi-membership
A single Library image SHALL be allowed to belong to Portfolio, one or more albums, and one or more Work projects at the same time.

#### Scenario: Image used in multiple places
- **WHEN** the photographer flags an image for Portfolio and also adds it to an album and a Work project
- **THEN** all of those memberships are retained on the same Library image

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

### Requirement: Compact Library image presentation
Library image grids SHALL use compact thumbnails. On the Gallery hub wall, tiles SHALL not require caption text or Portfolio badges under each image. The wall SHALL present a first page of thumbnails and load further pages as the photographer scrolls that wall; requesting every thumbnail as soon as the hub opens SHALL NOT be the primary pattern.

#### Scenario: Scan Library on phone
- **WHEN** the photographer browses Library images on a phone
- **THEN** they can recognize images from compact tiles without endless oversized cards

#### Scenario: First page then more
- **WHEN** the photographer opens the Gallery wall
- **THEN** a first page of thumbnails appears, and scrolling the wall loads more

### Requirement: Upload flow clarity
Library upload SHALL present a straightforward add-photos flow with plain-language errors (size/type) suitable for phone use.

Upload is the most-used action in the hub and SHALL be presented as a designed affordance rather than an unstyled system control. On pointer devices the photographer SHALL be able to drop files onto a visible target, and that target SHALL indicate when a dragged file is over it. Choosing files through a picker SHALL remain available, since drag-and-drop is not usable on touch.

The control SHALL NOT require a review step before allowed files begin landing in the destination pile. Accepted formats and the size ceiling SHALL be stated when a file is rejected, and SHALL NOT occupy the hub header before anything is chosen. The control SHALL NOT rely on browser-generated text such as a no-file-selected label to communicate its state.

#### Scenario: Upload from phone
- **WHEN** the photographer uploads allowed images from a phone
- **THEN** images enter the Library with clear success or error feedback

#### Scenario: Dropping files onto the target
- **WHEN** the photographer drags image files over the upload target on a pointer device
- **THEN** the target indicates it will accept them, and dropping begins the upload

#### Scenario: Constraints stated on rejection
- **WHEN** the photographer chooses a file that is the wrong type or over the size ceiling
- **THEN** the rejection names the accepted formats or the size ceiling, without those rules sitting as header copy beforehand

#### Scenario: Picker still available on touch
- **WHEN** the photographer uses Library on a touch device
- **THEN** they can open a file picker, since dragging is unavailable

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

#### Scenario: Caption Artist no longer required (About photo)
- **WHEN** an image has caption “Artist” but is not flagged
- **THEN** Soft night does not treat it as the About photo solely because of that caption

### Requirement: Library quiet accordion and section Save
Library editing surfaces (upload, tags, and comparable detail sections) SHALL use quiet accordion sections with one open at a time and explicit Save with Saving / Saved / Error feedback, consistent with Studio quiet panel patterns.

#### Scenario: Save Library section
- **WHEN** the photographer expands a Library section, edits fields, and saves
- **THEN** the UI shows Saving then Saved, or Error if the save fails

### Requirement: Two photo piles Gallery and Portfolio
Media SHALL live in three memberships: Gallery (everyday pile), Portfolio (public Portfolio pile, including one-way copies from Gallery and files uploaded into Portfolio), and held (files uploaded into an album or Work that MUST NOT appear on the Gallery wall). Sending a Gallery photo to Portfolio SHALL create a Portfolio copy without replacing the Gallery original. Uploading a file into Portfolio, an album, or Work SHALL NOT create a Gallery original.

#### Scenario: Send to Portfolio
- **WHEN** the photographer sends a Gallery photo to Portfolio
- **THEN** a Portfolio copy is created and the Gallery original remains

#### Scenario: Gallery wall is Gallery-only
- **WHEN** the photographer opens the Gallery room after uploading into Portfolio, an album, or Work
- **THEN** those destination uploads are absent from the Gallery wall

### Requirement: Delete Gallery with Portfolio copy prompt
Deleting a Gallery photo that has one or more Portfolio copies SHALL prompt the photographer to delete Gallery only or delete both. Deleting Gallery only SHALL leave Portfolio copies available.

#### Scenario: Delete Gallery only
- **WHEN** the photographer chooses Gallery only on delete
- **THEN** the Gallery photo is removed and Portfolio copies remain

#### Scenario: Delete both
- **WHEN** the photographer chooses delete both
- **THEN** the Gallery photo and its Portfolio copies are removed

### Requirement: Website may pick either pile
Website image pickers SHALL allow selecting photos from Gallery or Portfolio.

#### Scenario: Pick Featured from Gallery
- **WHEN** the photographer picks a Featured image from Gallery
- **THEN** that Gallery photo may be used on the public Home featured slideshow

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

