## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Photographer structured data on Home
The public Home document SHALL include JSON-LD that identifies Ibrahim Lens as a photographer business, using published name, URL, and contact fields already managed in Website content. The block SHALL NOT invent services, prices, or reviews that are not stored in the CMS.

#### Scenario: Home exposes photographer identity
- **WHEN** a crawler reads the Home document
- **THEN** it can parse structured data naming the photographer business and the site URL
