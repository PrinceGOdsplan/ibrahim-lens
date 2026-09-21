## MODIFIED Requirements

### Requirement: Work index
The system SHALL list only Work projects marked Show on website on `/work`, presented with warm premium covers/planes consistent with Home proof and Portfolio craft.

#### Scenario: Visitor opens Work index
- **WHEN** a visitor opens `/work`
- **THEN** they see website-visible Work projects only in the warm public visual language

### Requirement: Work detail image set
Each website-visible Work detail page SHALL showcase only the images belonging to that Work project in a premium warm gallery with immersive open and no watermarks.

#### Scenario: Visitor opens a Work project
- **WHEN** a visitor opens `/work/:slug` for a website-visible Work project
- **THEN** they see that project’s metadata and only its images in the warm premium gallery language

## ADDED Requirements

### Requirement: Work eligible as Home fashion proof
Website-visible Work projects SHALL be usable as Home proof items (especially fashion brand shoots) without requiring a separate brands CMS.

#### Scenario: Home links into Work
- **WHEN** Home shows a proof item for a published Work project
- **THEN** activating it opens that project’s public Work detail
