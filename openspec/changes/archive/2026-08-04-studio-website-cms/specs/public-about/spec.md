## ADDED Requirements

### Requirement: Artist portrait from Library flag
`/about` SHALL display the Library image flagged as Artist portrait when present, not an image selected only by caption text “Artist”.

#### Scenario: Flagged portrait on About
- **WHEN** a Library image is flagged as Artist portrait
- **THEN** `/about` shows that image in the artist slot

### Requirement: About subtitle from CMS
`/about` SHALL show an optional subtitle from Website About when set; otherwise Soft night default identity line MAY appear.

#### Scenario: Custom About subtitle
- **WHEN** About subtitle is saved in Website
- **THEN** `/about` shows that subtitle
