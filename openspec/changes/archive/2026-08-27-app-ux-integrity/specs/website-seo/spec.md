## ADDED Requirements

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

The site SHALL publish crawler directives and an inventory of its public routes. The inventory SHALL cover Home, About, Portfolio, Work, Contact, Privacy, and Terms. Delivery routes under `/g/` SHALL be excluded from the inventory and SHALL be disallowed to crawlers.

#### Scenario: Crawler requests directives

- **WHEN** a crawler requests the site's crawler directive file
- **THEN** it is served, and it disallows delivery routes and points to the route inventory

#### Scenario: Delivery routes stay unindexed

- **WHEN** a crawler reads the route inventory
- **THEN** no `/g/` delivery route appears in it

### Requirement: Missing share image is surfaced to the photographer

Studio SHALL indicate when a public page would produce a share preview without a photograph, in the same place it already hints about missing SEO descriptions.

#### Scenario: No share image configured

- **WHEN** no share preview image is available and the photographer views Site chrome SEO
- **THEN** Studio indicates that shared links will not show a photograph
