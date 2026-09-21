## ADDED Requirements

### Requirement: Home Soft night curator
The Website Home tab SHALL let the photographer curate Soft night Home sections in page order: featured/hero picks (Portfolio only), lanes (three slots with title, body, and image), Work on Home (explicit picks from website-visible Work, maximum 3), atmosphere (auto from Portfolio excluding Artist portrait, or manual Portfolio picks), and About tease headline/lead. Hero rotating captions remain Library image captions; Home SHALL coach that captions are edited in Library.

#### Scenario: Configure lanes
- **WHEN** the photographer sets title, body, and image for each of three Home lanes
- **THEN** the public Home lanes section reflects those values

#### Scenario: Work on Home picks
- **WHEN** the photographer selects up to three website-visible Work stories for Home
- **THEN** Home Selected Work shows those picks in the chosen order rather than an implicit first-three sort

#### Scenario: Atmosphere auto mode
- **WHEN** atmosphere mode is auto
- **THEN** Home atmosphere uses Portfolio images excluding the Artist portrait image

### Requirement: About editor with Artist portrait
The Website About tab SHALL edit about body and optional subtitle, and SHALL show the current Artist portrait (from Library Artist flag) with guidance to change it in Library.

#### Scenario: About without Artist
- **WHEN** no Library image is flagged as Artist portrait
- **THEN** Studio shows that About will use the Soft night placeholder until one is set in Library

### Requirement: Contact and booking merged editor
The Website Contact & booking tab SHALL combine Contact page voice (H1 defaulting to “Let’s shoot”, short intro), booking help text, request calendar toggle, booking questions (max 8), and reach-me fields (phone, email, location, Instagram). Phone SHALL continue to drive public WhatsApp links.

#### Scenario: Save reach-me and booking together
- **WHEN** the photographer updates phone and booking questions in Contact & booking
- **THEN** public Contact and Home booking reflect both without a separate Globals tab

### Requirement: Site chrome tucked fields
Site chrome (tucked) SHALL let the photographer edit footer blurb, Soft night section eyebrows, Privacy and Terms bodies, site display name / rare fallbacks, and SEO entry points. Soft night craft tokens, fonts, and interaction chrome SHALL NOT be editable there.

#### Scenario: Edit footer blurb
- **WHEN** the photographer saves a footer blurb in Site chrome
- **THEN** the public footer shows that blurb

#### Scenario: Edit an eyebrow
- **WHEN** the photographer changes the Home lanes eyebrow in Site chrome
- **THEN** the public Home lanes section uses the new eyebrow label

### Requirement: Empty-state coaching
When Home featured, Artist portrait, or Home Work picks are empty, Website SHALL coach what Soft night public will fall back to.

#### Scenario: No featured images
- **WHEN** Home featured is empty
- **THEN** Studio states the public hero fallback behavior clearly

### Requirement: Testimonials promote path visible
The Testimonials Website tab SHALL surface a path to publish testimonials promoted from client delivery feedback (in addition to manual create).

#### Scenario: Promote affordance present
- **WHEN** the photographer opens Website → Testimonials
- **THEN** they can reach or initiate promote-from-feedback without hunting only in Clients

## MODIFIED Requirements

### Requirement: Editable website sections
Authenticated photographers SHALL edit Soft night Home curation, About, Contact & booking, Testimonials, FAQ, and tucked Site chrome content from the Website hub.

#### Scenario: Update Home curator
- **WHEN** the photographer updates Home lanes or featured picks in Website → Home
- **THEN** the public Home reflects those updates

### Requirement: Home featured from Portfolio
Home featured/highlight images SHALL be chosen only from Library images that are in Portfolio.

#### Scenario: Select Home featured images
- **WHEN** the photographer configures Home featured images
- **THEN** only Portfolio images are selectable

### Requirement: Testimonials manual and promoted
Authenticated photographers SHALL create testimonials manually and SHALL be able to publish testimonials promoted from client feedback after editing.

#### Scenario: Save a testimonial
- **WHEN** the photographer saves a testimonial (manual or edited promotion)
- **THEN** it can appear in the Home testimonials teaser

## REMOVED Requirements

### Requirement: Custom services packages with max entries
**Reason**: Service packages are deleted; Soft night does not use a packages teaser.
**Migration**: Remove `service_packages` data and Studio Services UI; do not relocate packages to another surface.

### Requirement: No public services page
**Reason**: Packages capability removed entirely; no services teaser remains.
**Migration**: None — Home no longer expects services packages.

### Requirement: Contact details in globals
**Reason**: Contact details move into Contact & booking; Globals top tab is removed.
**Migration**: Edit phone/email/location/Instagram under Website → Contact & booking; Site chrome holds footer-only chrome.
