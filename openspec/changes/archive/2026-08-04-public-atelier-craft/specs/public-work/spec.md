## MODIFIED Requirements

### Requirement: Work index
The system SHALL list only Work projects marked Show on website on `/work`, presenting covers as artistic image planes (asymmetric or full-bleed-leaning covers with editorial titles) rather than a uniform equal card grid.

#### Scenario: Visitor opens Work index
- **WHEN** a visitor opens `/work`
- **THEN** they see website-visible Work projects only with cover-forward artistic presentation

### Requirement: Work detail image set
Each website-visible Work detail page SHALL showcase only the images belonging to that Work project, using atelier gallery rhythm and immersive open consistent with Portfolio craft.

#### Scenario: Visitor opens a Work project
- **WHEN** a visitor opens `/work/:slug` for a website-visible Work project
- **THEN** they see that project’s metadata and only its images in an artistic gallery layout

#### Scenario: Immersive open from Work detail
- **WHEN** a visitor activates an image on a Work detail page
- **THEN** they can view it immersively and dismiss the view
