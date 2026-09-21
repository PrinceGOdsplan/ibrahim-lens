# public-home Specification

## Purpose
Composes the Ibrahim Lens home page from brand hero, Portfolio-sourced featured images, marketing teasers, and a Book CTA that scrolls to the booking form.

## Requirements

### Requirement: Brand-forward home
The system SHALL present Ibrahim Lens branding as the primary first-viewport signal with a short rotating supporting message, Soft night primary Book CTA targeting Contact booking (`/contact#booking`), and Portfolio secondary CTA linking to `/portfolio`, without Studio dashboard chrome.

#### Scenario: Visitor lands on home
- **WHEN** a visitor opens `/`
- **THEN** they see Ibrahim Lens branding, a short supporting message, Book and Portfolio CTAs, and no Studio dashboard chrome

### Requirement: Hero CTAs Soft night Book and Portfolio
The Home first viewport SHALL offer Book (to `/contact#booking`) as the primary Soft night CTA (solid brass or equivalent primary treatment) and Portfolio (to `/portfolio`) as a quieter secondary control. The hero SHALL NOT include WhatsApp. The hero SHALL NOT mount the booking form.

#### Scenario: Hero CTA row
- **WHEN** a visitor views the Home hero
- **THEN** they see a primary Book control and a secondary Portfolio control and do not see WhatsApp in the hero CTA group

### Requirement: Rotating short hero captions
Home hero SHALL continue to rotate short supporting captions (slide- or content-driven). Captions SHALL stay brief and Street Plain–compatible (ops and/or photographer cut lines), not long soft-memory paragraphs.

#### Scenario: Caption rotates
- **WHEN** multiple hero slides or caption sources exist
- **THEN** the supporting line under the brand updates as slides change

### Requirement: Portfolio-sourced featured images
Home featured/highlight images SHALL display only images selected from Portfolio, without watermarks.

#### Scenario: Featured images render
- **WHEN** Home featured picks exist from Portfolio
- **THEN** those images appear in the Home featured section unmarked

### Requirement: Integrated marketing sections
The system SHALL render published testimonials on Home when content exists, without a separate primary nav route for testimonials. The system SHALL NOT render service packages on Home (packages removed).

#### Scenario: Home with testimonials
- **WHEN** Website content includes published testimonials
- **THEN** the testimonials section appears on Home

#### Scenario: No services teaser
- **WHEN** a visitor views Home
- **THEN** no service-packages teaser is shown

### Requirement: Book CTA scrolls to booking form
Home SHALL provide a Book CTA that navigates to the Contact booking form (`/contact#booking`), the same form definition used on Contact. Home SHALL NOT include an on-page booking form.

#### Scenario: Home book CTA
- **WHEN** a visitor activates the Home Book CTA
- **THEN** they reach the booking request form on Contact

### Requirement: Home About tease Less talk More visuals
The Home About tease headline SHALL present “Less talk.” and “More visuals.” (line-broken as needed) by default when Website About tease fields are empty, and SHALL link to `/about`. When About tease fields are set in Website, those values SHALL be used instead.

#### Scenario: About tease headline default
- **WHEN** a visitor views the Home About tease and CMS tease fields are empty
- **THEN** the headline is Less talk / More visuals rather than a generic photographer slogan

### Requirement: Home Work section uses Work
Home Work proof chrome SHALL label the section with Work (not Projects).

#### Scenario: Work proof heading
- **WHEN** website-visible Work items appear on Home
- **THEN** section chrome refers to Work

### Requirement: Hero mobile chrome clearance
On small screens, Home hero Book and Portfolio CTAs and slideshow controls SHALL sit with enough bottom clearance that they are not obscured by the system home-indicator / gesture bar. Slideshow controls SHALL mark only the active slide as current.

#### Scenario: Hero CTAs and dots on phone
- **WHEN** a visitor views the Home hero on a narrow viewport with multiple slides
- **THEN** Book and Portfolio remain tappable and only one slide control is current

### Requirement: Home lanes shorter on small screens
Home Portraits / Fashion / Lifestyle lane cards SHALL use a slightly reduced aspect ratio on small screens versus desktop, while remaining photo-first.

#### Scenario: Lane aspect on phone
- **WHEN** a visitor views Home lanes on a narrow viewport
- **THEN** each lane card is shorter than the desktop tall aspect while still showing a portrait-oriented frame

### Requirement: Atmosphere single column on small screens
Home atmosphere masonry SHALL render as a single column below a small breakpoint and may use multiple columns on larger viewports.

#### Scenario: Atmosphere on phone
- **WHEN** a visitor views the Home atmosphere section on a narrow viewport
- **THEN** frames stack in one column

### Requirement: Home load failure is visible
If Home cannot load Website or media sources, the page SHALL present an error with a way to retry rather than rendering as an empty finished site.

#### Scenario: PocketBase unreachable
- **WHEN** Home’s content fetch fails
- **THEN** the visitor sees an error and can retry

### Requirement: Home lanes from CMS
Home Portraits / Fashion / Lifestyle lane cards SHALL render title, body, and image from Website Home curator configuration (with Soft night defaults when unset).

#### Scenario: Custom lane body
- **WHEN** lane bodies are saved in Website → Home
- **THEN** Home lanes show those bodies

### Requirement: Home Work from explicit picks
Home Selected Work SHALL show the photographer’s Home Work picks (max 3) when configured; otherwise it MAY fall back to website-visible Work in Studio sort order.

#### Scenario: Explicit Home Work
- **WHEN** three Work stories are picked for Home
- **THEN** those three appear in Home Selected Work in pick order

### Requirement: Atmosphere from CMS mode
Home atmosphere masonry SHALL follow Website atmosphere mode: auto (Portfolio excluding Artist portrait) or manual Portfolio picks.

#### Scenario: Manual atmosphere
- **WHEN** atmosphere mode is manual with selected images
- **THEN** Home atmosphere shows those images

### Requirement: About tease from CMS
Home About tease headline and lead SHALL use Website About tease fields when set, defaulting to Soft night “Less talk. / More visuals.” and About body truncate when unset.

#### Scenario: Default About tease
- **WHEN** About tease fields are empty
- **THEN** Home still shows Soft night Less talk / More visuals defaults

### Requirement: Home eyebrows from Site chrome
Home section eyebrows SHALL use Site chrome values when set, otherwise Soft night defaults.

#### Scenario: Custom Atmosphere eyebrow
- **WHEN** the Atmosphere eyebrow is customized in Site chrome
- **THEN** Home atmosphere uses that label

### Requirement: Lane grid adapts to lane count

The Home lane section SHALL lay out however many lanes are configured without leaving a partially filled row that reads as a mistake. The grid SHALL adapt its track count to the number of lanes rather than assuming a fixed three.

When the lane count does not divide evenly into the available tracks, the section SHALL resolve the remainder deliberately — by reducing the track count, by widening the trailing items to fill the row, or by another treatment that leaves no lane sitting alone beside empty columns.

#### Scenario: Four lanes configured

- **WHEN** four lanes are configured in Website → Home and a visitor views Home on a wide viewport
- **THEN** the lanes are laid out with no single card orphaned beside two empty columns

#### Scenario: Three lanes configured

- **WHEN** three lanes are configured
- **THEN** they fill one row exactly, as they do today

#### Scenario: Two lanes configured

- **WHEN** two lanes are configured
- **THEN** the row resolves without a gap that reads as a missing third card

### Requirement: Composed headlines are not machine-joined from item titles

A Home section headline SHALL NOT be produced by concatenating the titles of the items below it with a separator character. Such a headline grows without bound as content is added, and its separators land arbitrarily when the line wraps — producing a trailing separator at the end of a line with the final word orphaned onto the next.

Section headlines SHALL come from an authored field with a Soft night default, so their length and line breaks are a design decision rather than a side effect of how many lanes exist. This also keeps chrome clear of the slash ornaments the Soft night direction excludes.

#### Scenario: Lane headline with four lanes

- **WHEN** four lanes are configured and a visitor views the Home lane section
- **THEN** the headline reads as an authored line rather than the four lane titles joined by separators

#### Scenario: Headline wraps

- **WHEN** a section headline wraps to a second line
- **THEN** no line ends with a dangling separator character

### Requirement: Home stays navigable on small screens

Home SHALL remain traversable on a phone: a visitor SHALL be able to reach the booking section without scrolling through an unbroken run of photographs long enough to lose the page's structure.

The atmosphere block SHALL bound how many frames it presents on small screens, with a control to continue into `/portfolio` for the rest, rather than stacking its full set into one column. Home SHALL NOT present the atmosphere block as the longest section of the page on a phone.

#### Scenario: Atmosphere volume on a phone

- **WHEN** a visitor views Home on a narrow viewport with many atmosphere frames configured
- **THEN** the section shows a bounded set with a way through to Portfolio, rather than every frame stacked in one column

#### Scenario: Reaching booking from the top

- **WHEN** a visitor lands on Home on a phone and scrolls toward the booking section
- **THEN** they pass through distinguishable sections rather than a single continuous column of frames
