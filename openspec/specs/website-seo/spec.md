# website-seo Specification

## Purpose
SEO metadata management for key public Ibrahim Lens pages.

## Requirements

### Requirement: SEO under Site chrome
Per-page SEO fields SHALL be edited from Website Site chrome (tucked), not as a competing primary Website tab. Studio SHALL hint when key pages (at least Home and Contact) are missing a description.

#### Scenario: Missing Home description
- **WHEN** Home SEO description is empty and the photographer views Site chrome SEO
- **THEN** Studio indicates the missing description

### Requirement: Per-page SEO fields
Authenticated photographers SHALL set title, description, and related SEO fields for key public pages including Home, About, Portfolio, Work, and Contact.

#### Scenario: Update portfolio SEO
- **WHEN** the photographer saves SEO fields for Portfolio
- **THEN** the public Portfolio page exposes those metadata values to clients/crawlers

### Requirement: Share previews without script execution
Public pages SHALL expose share preview metadata — title, description, a preview image, canonical URL, and site name — in the initial HTML document, so that link unfurlers which do not execute JavaScript produce a populated preview. A default preview image SHALL be available for every public route. Per-page metadata applied after load SHALL continue to serve in-browser display and script-capable crawlers, but SHALL NOT be the only source of share preview metadata.

Absolute URLs in that metadata are fixed when the site is built, so the deployed origin SHALL be supplied at build time and the build SHALL report when it is missing rather than silently emitting a placeholder origin.

#### Scenario: Link shared to a messaging app
- **WHEN** a visitor shares a public page link into a messaging or social app whose unfurler does not execute JavaScript
- **THEN** the preview shows the site name, a title, a description, and a photograph rather than a blank placeholder

#### Scenario: Per-page metadata still applies in browser
- **WHEN** the photographer has saved a page title and description in Website Site chrome SEO and a visitor opens that page
- **THEN** the browser shows that saved title and description

#### Scenario: Build without a configured origin
- **WHEN** a production build runs without the deployed origin configured
- **THEN** the build reports that share preview and route inventory URLs will use a placeholder origin

### Requirement: Crawler directives and route inventory
The site SHALL publish crawler directives and an inventory of its public routes. The inventory SHALL cover Home, About, Portfolio, Work, Contact, Privacy, and Terms. Delivery routes under `/g/`, Studio routes under `/studio/`, and PocketBase admin under `/_/` SHALL be excluded from the inventory and SHALL be disallowed to crawlers.

#### Scenario: Crawler requests directives
- **WHEN** a crawler requests the site's crawler directive file
- **THEN** it is served, it disallows `/g/`, `/studio/`, and `/_/`, and it points to the route inventory

#### Scenario: Delivery routes stay unindexed
- **WHEN** a crawler reads the route inventory
- **THEN** no `/g/` delivery route appears in it

#### Scenario: Admin stays unindexed
- **WHEN** a crawler reads the crawler directive file
- **THEN** PocketBase admin under `/_/` is disallowed

### Requirement: Photographer structured data on Home
The public Home document SHALL include JSON-LD that identifies Ibrahim Lens as a photographer business, using published name, URL, and contact fields already managed in Website content. The block SHALL NOT invent services, prices, or reviews that are not stored in the CMS.

#### Scenario: Home exposes photographer identity
- **WHEN** a crawler reads the Home document
- **THEN** it can parse structured data naming the photographer business and the site URL

### Requirement: Missing share image is surfaced to the photographer
Studio SHALL indicate when a public page would produce a share preview without a photograph, in the same place it already hints about missing SEO descriptions.

#### Scenario: No share image configured
- **WHEN** no share preview image is available and the photographer views Site chrome SEO
- **THEN** Studio indicates that shared links will not show a photograph

### Requirement: Work story document identity

Each Work story SHALL present its own document title, so a visitor with several tabs open can tell the stories apart and a shared link names the story rather than the section. A story's share preview title and description SHALL likewise describe that story, falling back to its own title and summary when no per-story SEO fields are configured.

Work stories SHALL NOT all resolve to a single section-level title.

#### Scenario: Two stories open in tabs

- **WHEN** a visitor opens two different Work stories in separate tabs
- **THEN** each tab shows a title naming that story rather than both showing the same section title

#### Scenario: Story link shared

- **WHEN** a Work story link is shared into a messaging app
- **THEN** the preview title names that story

#### Scenario: Story without configured SEO fields

- **WHEN** a Work story has no per-story SEO title or description configured
- **THEN** its own title and summary are used rather than the section-level values
