# library-work Specification

## Purpose

Work projects group Library images into shoot/case-study sets that are private by default and optionally shown on the public Work pages.
## Requirements
### Requirement: Work project management
Authenticated photographers SHALL create, edit, and delete Work projects with metadata such as title, slug, cover, and description, and SHALL attach Library images to each project.

A Work project SHALL additionally carry the fields its public story page presents: narrative body copy, and shoot facts covering the client or subject, the location, and when the shoot took place. These fields SHALL be optional, so a project can be published with only a title and description as it can today, and the public page omits what is not set.

#### Scenario: Create Work from Library images
- **WHEN** the photographer creates a Work project and selects Library images for it
- **THEN** those images form that Work project’s image set

#### Scenario: Add narrative to a project

- **WHEN** the photographer edits a Work project
- **THEN** they can enter narrative body copy and shoot facts for its public story page

#### Scenario: Publish without narrative

- **WHEN** the photographer publishes a Work project having filled only title and description
- **THEN** the project publishes, and its story page omits the unset fields rather than showing empty labels

### Requirement: Hidden by default
New and existing Work projects SHALL be hidden from the public website until explicitly set to show on the website.

#### Scenario: Default not on website
- **WHEN** the photographer creates a Work project without enabling Show on website
- **THEN** it does not appear on `/work` and its detail is not publicly accessible

### Requirement: Show on website opt-in
Authenticated photographers SHALL be able to set a Work project to show on the website, making it eligible for `/work` and `/work/:slug`.

#### Scenario: Publish Work to website
- **WHEN** the photographer enables Show on website for a Work project
- **THEN** that project becomes listable and viewable on the public Work routes

### Requirement: Deliverable regardless of website visibility
A Work project SHALL be selectable for a Delivery whether or not it is shown on the website.

#### Scenario: Deliver hidden Work
- **WHEN** the photographer creates a Delivery from a Work project that is not shown on the website
- **THEN** the Delivery can include that project’s images for the client without making the project public

### Requirement: Work cover picker
Authenticated photographers SHALL choose a cover image for a Work project from that project’s attached Library images (or clear it to fall back to the first image).

#### Scenario: Set cover
- **WHEN** the photographer picks a cover from the Work’s images
- **THEN** public Work listings and detail prefer that cover

### Requirement: Work list reorder
Authenticated photographers SHALL reorder website-visible Work projects in Studio so `/work` list order matches Studio sort.

#### Scenario: Reorder Work
- **WHEN** the photographer changes Work sort order
- **THEN** `/work` lists projects in that order

### Requirement: Work eligible for Home curator
Website-visible Work projects SHALL be selectable in Website → Home Work picks (maximum 3). Work that is not shown on the website SHALL NOT appear in that picker.

#### Scenario: Hidden Work not pickable
- **WHEN** a Work project is not shown on the website
- **THEN** it cannot be added to Home Work picks

### Requirement: Work list cover thumbnails
Library Work list cards SHALL show a cover thumbnail: the Work cover image when set, otherwise the first attached image. The photographer MAY override which attached image is the cover.

#### Scenario: Work list shows thumb
- **WHEN** the photographer views the Work list with projects that have images
- **THEN** each card shows a cover thumbnail

#### Scenario: Default cover is first image
- **WHEN** no cover override is set
- **THEN** the first image in the Work set is used as the list thumbnail

### Requirement: Website-visible Work list supports Works curation
Work items marked Show on website SHALL appear in the Website → Home Works curator with a cover thumbnail and clear on/off state so the photographer can select and order Home Works without leaving Studio Website for identity alone.

#### Scenario: Website Work appears in Works editor
- **WHEN** a Work item is marked Show on website and the photographer opens Works
- **THEN** that Work appears with a thumbnail and can be toggled on for Home (subject to the three-item max)

### Requirement: Work may use either photo pile
Work image memberships and covers SHALL accept photos from Gallery or Portfolio piles.

#### Scenario: Add Gallery photo to Work
- **WHEN** the photographer adds a Gallery photo to a Work story
- **THEN** that photo appears in the Work set

### Requirement: Upload into a Work project
Authenticated photographers SHALL upload files into a selected Work project from that project’s surface. Those files SHALL be held (not Gallery) and attached to the project. The photographer SHALL still be able to pick existing Gallery or Portfolio photos into the project. Held photos on a Work project that is shown on the website SHALL be viewable on the public Work routes.

#### Scenario: Add files on Work
- **WHEN** the photographer uploads images on a selected Work project
- **THEN** the project contains those photos without placing them on the Gallery wall

#### Scenario: Published Work shows held photos
- **WHEN** a Work project shown on the website includes held photos
- **THEN** guests can see those photos on the public Work page

