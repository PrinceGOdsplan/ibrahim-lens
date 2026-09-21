# website-content Specification

## Purpose
CMS for public marketing and site copy, including a capped custom services package builder and Portfolio-sourced Home featured picks.

## Requirements

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

### Requirement: Unpublished testimonials are Studio-only
Public list and view of testimonials SHALL include only rows with `published = true`. Unpublished drafts SHALL be readable only in an authenticated Studio session.

#### Scenario: Home still shows published quotes
- **WHEN** Website content includes published testimonials
- **THEN** Home can render those quotes

#### Scenario: Draft hidden from the public API
- **WHEN** a testimonial exists with published false
- **THEN** an unauthenticated list or view does not return that row
