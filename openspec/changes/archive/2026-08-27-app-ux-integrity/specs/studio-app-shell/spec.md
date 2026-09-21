## ADDED Requirements

### Requirement: Studio shell chrome adapts to narrow viewports

The Studio shell SHALL keep the majority of a narrow viewport's width available to hub content. Persistent side navigation SHALL NOT occupy a fixed width on phone-width viewports; on those viewports hub navigation SHALL be reachable from compact chrome that does not consume the content area, and the current hub SHALL be identifiable. Hub content padding SHALL be reduced on narrow viewports rather than retaining desktop spacing.

#### Scenario: Open a Studio hub on a phone

- **WHEN** the photographer opens a Studio hub on a phone-width viewport
- **THEN** hub content occupies substantially the full width and is operable, rather than being compressed beside a fixed-width sidebar

#### Scenario: Move between hubs on a phone

- **WHEN** the photographer opens the Studio navigation on a phone-width viewport
- **THEN** all five hubs are reachable and the current hub is identifiable

#### Scenario: Desktop shell unchanged

- **WHEN** the photographer opens a Studio hub on a desktop-width viewport
- **THEN** the persistent side navigation is present as before

### Requirement: Studio content does not overflow horizontally

Studio hub content SHALL NOT require horizontal scrolling on phone-width viewports. Rows combining controls with thumbnails, master-detail panes, and image grids SHALL reflow for narrow widths.

#### Scenario: Portfolio order rows on a phone

- **WHEN** the photographer views Gallery → Portfolio ordering on a phone-width viewport
- **THEN** each row's controls are reachable without horizontal scrolling

#### Scenario: Bookings master-detail on a phone

- **WHEN** the photographer views Clients → Bookings on a phone-width viewport
- **THEN** the list and the selected booking are presented in a single-column flow rather than side by side

### Requirement: Studio touch targets

Compact controls in the Studio SHALL present a touch target of at least 44 by 44 CSS pixels on touch-capable viewports. This covers the chrome that opens hub navigation, compact action menus, and per-row reorder and remove controls. Dense hub tab strips retain their existing height.

#### Scenario: Reorder control on a phone

- **WHEN** the photographer uses a reorder control on a phone-width viewport
- **THEN** its touch target is at least 44 by 44 CSS pixels

#### Scenario: Opening hub navigation on a phone

- **WHEN** the photographer opens Studio hub navigation on a phone-width viewport
- **THEN** the control that opens it is at least 44 by 44 CSS pixels

### Requirement: Studio route identity

Each Studio hub SHALL set a document title identifying the hub, and deep state that determines what a hub displays — selected tab, room, or sub-tab — SHALL be represented in the address so it survives reload, back navigation, and sharing.

#### Scenario: Reload a Studio tab

- **WHEN** the photographer selects a tab within a Studio hub and reloads
- **THEN** the same tab is presented

#### Scenario: Back navigation within a hub

- **WHEN** the photographer switches tabs within a hub and navigates back
- **THEN** the previously selected tab is presented
