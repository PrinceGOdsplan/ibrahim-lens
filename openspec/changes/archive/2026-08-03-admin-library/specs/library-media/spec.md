## Purpose

Library media pool where all finished photographer images are uploaded and stored before any public or delivery use.

## ADDED Requirements

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

### Requirement: No watermarks in v1
Uploaded and delivered images SHALL NOT have watermark overlays applied in v1.

#### Scenario: Original remains unmarked
- **WHEN** an image is shown publicly or downloaded from a Delivery
- **THEN** it is not stamped with a watermark overlay

### Requirement: Multi-membership
A single Library image SHALL be allowed to belong to Portfolio, one or more albums, and one or more Work projects at the same time.

#### Scenario: Image used in multiple places
- **WHEN** the photographer flags an image for Portfolio and also adds it to an album and a Work project
- **THEN** all of those memberships are retained on the same Library image
