## Purpose

Work projects group Library images into shoot/case-study sets that are private by default and optionally shown on the public Work pages.

## ADDED Requirements

### Requirement: Work project management
Authenticated photographers SHALL create, edit, and delete Work projects with metadata such as title, slug, cover, and description, and SHALL attach Library images to each project.

#### Scenario: Create Work from Library images
- **WHEN** the photographer creates a Work project and selects Library images for it
- **THEN** those images form that Work project’s image set

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
