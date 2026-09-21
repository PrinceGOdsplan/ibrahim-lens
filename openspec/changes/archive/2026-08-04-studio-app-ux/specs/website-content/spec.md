## ADDED Requirements

### Requirement: Website Home checklist and primary CTAs
Website → Home SHALL present a Soft night section checklist (e.g. Featured, Services, Work on Home, Portfolio strip, About) with ready/empty cues, an Open public page control, and primary CTAs: Edit Featured, Edit Services, Edit Work on Home, Portfolio strip, and About tease. Detailed editors SHALL open in full-screen modals rather than dominating the hub page.

#### Scenario: Home hub at a glance
- **WHEN** the photographer opens Website → Home
- **THEN** they see checklist status and the primary edit actions without scrolling through all section forms

### Requirement: Services editor modal
The Home Services cards (three booked-for slots: title, body, image) SHALL be editable from an Edit Services full-screen modal using the shared image gallery for image picks, then title/body fields after selection.

#### Scenario: Change a Service card image
- **WHEN** the photographer picks an image for a Service card in the gallery and returns
- **THEN** they can finish title/body for that card in the Services modal

### Requirement: Portfolio strip editor modal
Home Portfolio strip (formerly atmosphere) SHALL be editable from a Portfolio strip modal with auto vs manual mode and manual picks via the shared gallery.

#### Scenario: Manual Portfolio strip
- **WHEN** the photographer sets Portfolio strip to manual and picks images
- **THEN** Home public Portfolio strip uses those picks

### Requirement: About photo without dead-end hop
Setting the About photo SHALL be available from Website About (or About tease-related UI) via the shared gallery / flag flow so the photographer is not forced to abandon Website for a cryptic Library-only hunt as the sole path.

#### Scenario: Set About photo from Website
- **WHEN** the photographer sets About photo from Website
- **THEN** the flagged About photo updates for public About and Home tease

### Requirement: More site settings naming
The tucked rare CMS area SHALL be labeled More site settings (not Site chrome) and remain collapsed by default.

#### Scenario: Open More site settings
- **WHEN** the photographer expands More site settings
- **THEN** they can edit footer, eyebrows, SEO, and legal bodies as before under the new name

### Requirement: Soft night Home curator via app modals
The Website Home experience SHALL let the photographer curate Soft night Home sections via checklist and modal editors: Featured / hero picks (Portfolio only) with captions editable after pick, Services (three slots with title, body, and image), Work on Home (explicit picks from website-visible Work, maximum 3), Portfolio strip (auto from Portfolio excluding About photo, or manual Portfolio picks), and About tease headline/lead. Hero rotating captions remain Library image captions editable in the Featured modal flow after picks.

#### Scenario: Configure Services
- **WHEN** the photographer sets title, body, and image for each of three Home Services cards
- **THEN** the public Home Services section reflects those values

#### Scenario: Work on Home picks
- **WHEN** the photographer selects up to three website-visible Work stories for Home
- **THEN** Home Selected Work shows those picks in the chosen order rather than an implicit first-three sort

#### Scenario: Portfolio strip auto mode
- **WHEN** Portfolio strip mode is auto
- **THEN** Home Portfolio strip uses Portfolio images excluding the About photo
