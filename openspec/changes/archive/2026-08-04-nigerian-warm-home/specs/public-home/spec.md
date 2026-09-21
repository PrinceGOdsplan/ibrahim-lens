## MODIFIED Requirements

### Requirement: Brand-forward home
The Home first viewport SHALL present Ibrahim Lens as the hero-level brand with a short lifestyle supporting line that signals place or market (e.g. Lagos / Nigeria when copy supports it), a dominant photo plane that MAY rotate as a slideshow of Portfolio-sourced featured images, and dual primary actions: book a session and view work. The first viewport SHALL NOT rely on cool placeless understatement alone.

#### Scenario: Visitor lands on home
- **WHEN** a visitor opens `/`
- **THEN** they see Ibrahim Lens branding, a short supporting message, a dominant photo plane (or rotating featured slides), and clear actions to book and to view work

#### Scenario: Featured slideshow
- **WHEN** multiple Home featured images exist
- **THEN** the hero can advance through those images as a slideshow with visitor-accessible controls

### Requirement: Work proof for fashion brands
Home SHALL surface up to three website-visible Work projects as an even proof grid when such Work exists. Each item SHALL link to its Work detail. When no published Work exists, Home SHALL omit or softly empty the proof block without looking broken.

#### Scenario: Fashion Work published
- **WHEN** one or more Work projects are marked Show on website
- **THEN** Home shows an even proof section (2 or 3 items preferred) using those projects (covers/titles) linking to `/work/:slug`

#### Scenario: No published Work
- **WHEN** no Work is shown on the website
- **THEN** Home remains cohesive without a broken proof grid

### Requirement: Portfolio-sourced featured images
Home atmosphere / Selected imagery SHALL display Portfolio-sourced featured images without watermarks when configured. These images support mood below the fold and SHALL NOT replace the Work proof block for fashion brand credibility.

#### Scenario: Featured images render
- **WHEN** Home featured picks exist from Portfolio
- **THEN** those images appear in the Home atmosphere section unmarked

### Requirement: Integrated marketing sections
Home SHALL compose as one continuous page: what-I-shoot lanes (Events · Portraits · Fashion brands), Work proof, Portfolio atmosphere, About tease, then booking — sharing one warm craft language. Optional services/testimonials CMS blocks MAY appear only if they do not break cohesion or reintroduce card grids.

#### Scenario: Home with CMS content
- **WHEN** Website content includes services or testimonials
- **THEN** those sections appear only in a form that matches the warm cohesive Home rhythm (non-card)

#### Scenario: Cohesive scroll without CMS extras
- **WHEN** services/testimonials are empty
- **THEN** Home still reads as a complete warm pitch via lanes, Work proof (when Work exists), Portfolio atmosphere (when featured exists), About tease, and Book

### Requirement: Book CTA scrolls to booking form
Home SHALL provide a Book CTA that scrolls to the booking request form on the page (same form definition as Contact). A secondary View work CTA SHALL navigate to Work or Portfolio as designed without replacing Book.

#### Scenario: Home book CTA
- **WHEN** a visitor activates the Home Book CTA
- **THEN** the page scrolls to the booking request form configured in the Website Contact editor

#### Scenario: Home view work CTA
- **WHEN** a visitor activates View work
- **THEN** they reach public Work or Portfolio to browse shoots

## ADDED Requirements

### Requirement: What I shoot lanes
Home SHALL present three clear shooting lanes — Events, Portraits, and Fashion brands — as editorial identity with imagery per lane, not a long service supermarket.

#### Scenario: Lanes visible
- **WHEN** a visitor scrolls past the hero
- **THEN** they can identify Events, Portraits, and Fashion brands as what Ibrahim Lens covers, each with an image
