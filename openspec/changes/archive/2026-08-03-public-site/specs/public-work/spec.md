## Purpose

Public Work showcase for photographer shoots that are explicitly set to show on the website; each detail page shows only that Work project’s images.

## ADDED Requirements

### Requirement: Work index
The system SHALL list only Work projects marked Show on website on `/work`.

#### Scenario: Visitor opens Work index
- **WHEN** a visitor opens `/work`
- **THEN** they see website-visible Work projects only

### Requirement: Work detail image set
Each website-visible Work detail page SHALL showcase only the images belonging to that Work project.

#### Scenario: Visitor opens a Work project
- **WHEN** a visitor opens `/work/:slug` for a website-visible Work project
- **THEN** they see that project’s metadata and only its images

### Requirement: Hidden Work not public
Work projects not marked Show on website SHALL NOT be publicly listed or viewable on `/work` routes.

#### Scenario: Hidden Work denied
- **WHEN** a visitor requests a Work project that is not shown on the website
- **THEN** the system does not expose its images and shows not-found or equivalent denial

### Requirement: Distinct from Deliveries
Public Work pages SHALL NOT require a delivery token.

#### Scenario: Public Work has no token gate
- **WHEN** a visitor opens a website-visible Work page
- **THEN** they can view it without a delivery token
