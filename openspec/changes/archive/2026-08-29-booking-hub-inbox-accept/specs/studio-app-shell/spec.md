## MODIFIED Requirements

### Requirement: Studio shell chrome adapts to narrow viewports
The Studio shell SHALL keep the majority of a narrow viewport's width available to hub content. Persistent side navigation SHALL NOT occupy a fixed width on phone-width viewports; on those viewports hub navigation SHALL be reachable from compact chrome that does not consume the content area, and the current hub SHALL be identifiable. Hub content padding SHALL be reduced on narrow viewports rather than retaining desktop spacing.

#### Scenario: Open a Studio hub on a phone
- **WHEN** the photographer opens a Studio hub on a phone-width viewport
- **THEN** hub content occupies substantially the full width and is operable, rather than being compressed beside a fixed-width sidebar

#### Scenario: Move between hubs on a phone
- **WHEN** the photographer opens the Studio navigation on a phone-width viewport
- **THEN** all six hubs are reachable and the current hub is identifiable

#### Scenario: Desktop shell unchanged
- **WHEN** the photographer opens a Studio hub on a desktop-width viewport
- **THEN** the persistent side navigation is present as before

### Requirement: Studio content does not overflow horizontally
Studio hub content SHALL NOT require horizontal scrolling on phone-width viewports. Rows combining controls with thumbnails, master-detail panes, and image grids SHALL reflow for narrow widths.

#### Scenario: Portfolio order rows on a phone
- **WHEN** the photographer views Gallery → Portfolio ordering on a phone-width viewport
- **THEN** each row's controls are reachable without horizontal scrolling

#### Scenario: Bookings master-detail on a phone
- **WHEN** the photographer views the Bookings hub on a phone-width viewport
- **THEN** the list and the selected booking are presented in a single-column flow rather than side by side
