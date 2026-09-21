# library-albums Specification

## Purpose

Albums group Library images for organization and for client Deliveries.
## Requirements
### Requirement: Album management
Authenticated photographers SHALL create, rename, and delete albums and add or remove Library images within albums.

#### Scenario: Create album and add images
- **WHEN** the photographer creates an album and adds Library images to it
- **THEN** those images are grouped under that album for organization and delivery selection

### Requirement: Albums are deliverable
Albums SHALL be selectable when creating a Delivery (Clients) using the same delivery mechanism as image picks or Work.

#### Scenario: Album available for delivery selection
- **WHEN** the photographer creates a Delivery
- **THEN** they can select an album or multiple albums as the delivery contents

### Requirement: Album list cover thumbnails
Library Album list cards SHALL show a cover thumbnail using the first image in the album by default. The photographer MAY override which album image is shown as the cover when the product supports an album cover field; otherwise first-image default is sufficient.

#### Scenario: Album list shows thumb
- **WHEN** the photographer views the Albums list with albums that have images
- **THEN** each card shows a thumbnail from the album’s images

### Requirement: Albums may use either photo pile
Album image memberships SHALL accept photos from Gallery or Portfolio piles.

#### Scenario: Add Portfolio copy to album
- **WHEN** the photographer adds a Portfolio copy to an album
- **THEN** the album includes that photo without requiring a Gallery original

### Requirement: Upload into an album
Authenticated photographers SHALL upload files into a selected album from that album’s surface. Those files SHALL be held (not Gallery) and attached to the album. The photographer SHALL still be able to pick existing Gallery or Portfolio photos into the album.

#### Scenario: Add files on the album
- **WHEN** the photographer uploads images on a selected album
- **THEN** the album contains those photos without placing them on the Gallery wall

#### Scenario: Pick existing into an album
- **WHEN** the photographer picks Gallery or Portfolio photos into an album
- **THEN** those photos are attached and keep their Gallery or Portfolio membership

