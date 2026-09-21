## ADDED Requirements

### Requirement: Unpublished testimonials are Studio-only
Public list and view of testimonials SHALL include only rows with `published = true`. Unpublished drafts SHALL be readable only in an authenticated Studio session.

#### Scenario: Home still shows published quotes
- **WHEN** Website content includes published testimonials
- **THEN** Home can render those quotes

#### Scenario: Draft hidden from the public API
- **WHEN** a testimonial exists with published false
- **THEN** an unauthenticated list or view does not return that row
