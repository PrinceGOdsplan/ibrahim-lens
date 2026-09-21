## Purpose

Albums group Library images for organization and for client Deliveries.

## ADDED Requirements

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
