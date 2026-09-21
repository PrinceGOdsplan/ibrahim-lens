## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Integrated marketing sections
The system SHALL render published testimonials on Home when content exists, without a separate primary nav route for testimonials. The system SHALL NOT render service packages on Home (packages removed).

#### Scenario: Home with testimonials
- **WHEN** Website content includes published testimonials
- **THEN** the testimonials section appears on Home

#### Scenario: No services teaser
- **WHEN** a visitor views Home
- **THEN** no service-packages teaser is shown

### Requirement: Book CTA scrolls to booking form
Home SHALL provide a Book CTA that scrolls to the booking request form on the page (same form definition as Contact).

#### Scenario: Home book CTA
- **WHEN** a visitor activates the Home Book CTA
- **THEN** the page scrolls to the booking request form configured in Website Contact & booking

### Requirement: Home About tease Less talk More visuals
The Home About tease headline SHALL present “Less talk.” and “More visuals.” (line-broken as needed) by default when Website About tease fields are empty, and SHALL link to `/about`. When About tease fields are set in Website, those values SHALL be used instead.

#### Scenario: About tease headline default
- **WHEN** a visitor views the Home About tease and CMS tease fields are empty
- **THEN** the headline is Less talk / More visuals rather than a generic photographer slogan
