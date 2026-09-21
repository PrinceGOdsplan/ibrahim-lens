## ADDED Requirements

### Requirement: Featured list grows to five with per-item upload or pick
Website → Home Featured SHALL allow a growing list of up to five Portfolio images. For each Featured item the photographer SHALL be able to Upload a new image (into Library/Portfolio as appropriate) or Pick from Library, then set a caption under that photo. Featured section changes SHALL persist via the section Save control.

#### Scenario: Add Featured slot and caption
- **WHEN** the photographer adds a Featured item (under the five-item max), uploads or picks a Portfolio image, sets a caption, and saves the Featured section
- **THEN** that image and caption are available for the public Home featured slideshow

#### Scenario: Featured cap
- **WHEN** five Featured items already exist
- **THEN** the system prevents adding another until one is removed

### Requirement: Works curation with thumbs toggle and drag
Website → Home SHALL label the Work teaser curator **Works**. The Works editor SHALL list all website-visible Work with cover thumbnails and on/off toggles, allow at most three on, and allow drag reorder only among the selected three. Order and selection SHALL persist via the section Save control.

#### Scenario: Toggle Works on Home
- **WHEN** the photographer turns on up to three website-visible Work items, reorders those selected items by drag, and saves
- **THEN** public Home Selected Work shows those picks in the saved order

#### Scenario: Fourth Work cannot turn on
- **WHEN** three Work items are already on
- **THEN** turning on another is blocked until one is turned off

### Requirement: Website tabs quiet accordion
About, Contact & booking, Testimonials, FAQ, and More site settings SHALL use quiet accordion sections (one open) with explicit Save status, matching the quiet Studio panel patterns.

#### Scenario: More site settings accordion
- **WHEN** the photographer expands Footer & identity while SEO is open
- **THEN** SEO collapses and Footer & identity is the only open section, with Save feedback available on that section
