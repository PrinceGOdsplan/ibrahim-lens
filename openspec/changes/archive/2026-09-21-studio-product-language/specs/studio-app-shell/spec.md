## ADDED Requirements

### Requirement: Desktop rail is the operator chrome
On desktop-width viewports, Studio SHALL present hub navigation, in-app notices, the appearance toggle, and the profile control on the side rail. Studio SHALL NOT present a full-width product header above the rail and page on desktop. The rail MAY collapse to icons as already specified; operator controls SHALL remain reachable when the rail is collapsed.

#### Scenario: Open Studio on desktop
- **WHEN** the photographer opens any Studio hub on a desktop-width viewport
- **THEN** they see the rail with hubs and operator controls, and they do not see a full-width bar that repeats the product name above the page

#### Scenario: Notices from the rail
- **WHEN** the photographer opens notices on desktop
- **THEN** the control lives on the rail, not in a product header above the page

### Requirement: Phone keeps a compact operator strip
On phone-width viewports, Studio SHALL present notices, appearance, and profile in a compact strip that does not name the current hub. Hub navigation on the phone SHALL be the bottom hub bar when that bar is present. Studio SHALL NOT restore a hamburger drawer as the phone hub list.

#### Scenario: Open Studio on a phone
- **WHEN** the photographer opens any Studio hub on a phone-width viewport
- **THEN** they see a compact operator strip (notices, appearance, profile) and can reach every hub from the bottom bar without a hamburger

### Requirement: Studio page recipe
Every Studio hub SHALL follow one page recipe: the hub title, that hub’s tabs when it has tabs, that hub’s primary actions, then a single primary work surface. The work surface SHALL sit in a breathing content width on wide desktop viewports rather than stretching edge-to-edge as a stack of equal cages. Website MAY keep its CMS sections inside that surface. Gallery’s photo wall IS the work surface.

#### Scenario: Open Bookings
- **WHEN** the photographer opens Bookings on desktop
- **THEN** they see the title Bookings, the shared tab idiom, primary actions, and one work surface for the list and detail

#### Scenario: Open Website
- **WHEN** the photographer opens Website
- **THEN** they see the same title / tabs / actions recipe, with the CMS sections inside the work surface rather than a second product header

### Requirement: Hub titles use Studio sans
Hub titles on the page recipe SHALL use the Studio sans family (Figtree). They SHALL NOT use Cormorant. Money and counts SHALL remain lining tabular Studio sans as already specified.

#### Scenario: Read a hub title
- **WHEN** the photographer opens Dashboard, Gallery, Website, Bookings, Clients, or Settings
- **THEN** the hub title is set in Figtree, not Cormorant

## MODIFIED Requirements

### Requirement: Studio app header
Studio SHALL NOT present a full-width product header on desktop-width viewports. Operator chrome on desktop SHALL live on the rail as specified in Desktop rail is the operator chrome. On phone-width viewports, Studio SHALL present a compact operator strip (notices, appearance, profile) that SHALL NOT repeat the current hub’s title — the page recipe is the only place the hub is named on screen.

#### Scenario: Open Studio on desktop
- **WHEN** the photographer opens any Studio hub on a desktop-width viewport
- **THEN** they see rail operator chrome and the hub title on the page, and they do not see a full-width product header

#### Scenario: Open Studio on a phone
- **WHEN** the photographer opens any Studio hub on a phone-width viewport
- **THEN** they see a compact operator strip that does not name the hub

### Requirement: One hub toolbar
Every Studio hub SHALL pin the page-recipe chrome at the top of the hub pane: exactly one hub title, then that hub’s tabs (when it has tabs) using the shared tab idiom, then that hub’s primary actions. It SHALL NOT lead with a sentence that explains the hub. Secondary controls MAY sit behind a disclosure on that chrome.

#### Scenario: Open Website
- **WHEN** the photographer opens Website
- **THEN** they see pinned chrome titled Website with the same tab treatment as Gallery, and no explaining subtitle in the scroll

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see pinned chrome titled Dashboard, and the instrument is the surface below — not a page title inside a scrolling article

#### Scenario: Open Bookings
- **WHEN** the photographer opens Bookings
- **THEN** booking views are tabs in that chrome, not a third pill style

### Requirement: Studio light and Soft-night–related night modes
Studio SHALL offer exactly two appearance modes: **light** (default desk) and **night** (warm Soft-night–related colour ladder). Night SHALL reuse Soft night ground / raised / text kinship for glare reduction, while Studio type and tool chrome patterns remain Studio. Hub titles SHALL stay Figtree in both modes. Cool graphite or additional gray modes SHALL NOT be offered. Studio SHALL NOT default to night.

#### Scenario: Default is light
- **WHEN** the photographer opens Studio with no stored appearance preference
- **THEN** Studio renders in the light desk palette

#### Scenario: Night reduces glare on the shell
- **WHEN** the photographer selects night mode
- **THEN** Studio shell ground, panels, borders, and text read as warm Soft-night–related (not cool SaaS dark) across hubs including Gallery

#### Scenario: Studio type unchanged in night
- **WHEN** night mode is active
- **THEN** Studio hub titles and UI text still use Figtree rather than public Syne / Sora, and money and counts stay lining tabular Figtree

### Requirement: Header sun/moon appearance toggle
Studio SHALL expose an icon-only sun/moon control that toggles between light and night. On desktop the control SHALL live on the rail. On phone it SHALL live on the compact operator strip. The control SHALL present at least a 44 by 44 CSS pixel touch target, SHALL be operable on phone and desktop, and SHALL NOT require opening Settings.

#### Scenario: Toggle from Gallery
- **WHEN** the photographer is in Gallery and activates the sun/moon control
- **THEN** the Studio shell switches mode immediately without leaving the hub

#### Scenario: Accessible name
- **WHEN** assistive technology reads the appearance control
- **THEN** it has a programmatic name that reflects the action (e.g. switch to night / switch to light)

#### Scenario: Desktop placement
- **WHEN** the photographer looks for appearance on a desktop-width viewport
- **THEN** the control is on the rail, not in a full-width product header
