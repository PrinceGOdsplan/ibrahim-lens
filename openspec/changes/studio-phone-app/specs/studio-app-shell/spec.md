## ADDED Requirements

### Requirement: Studio hub tabs stay on one line on a phone
On phone-width viewports, hub tab strips SHALL keep their tabs on a single row. Tab icons MAY be omitted at that width so the words fit. Tabs SHALL NOT wrap onto a second row when the labels would fit on one line on a 390-wide viewport (iPhone 13 Pro class) after hub padding. If the labels still exceed the pane, the strip MAY scroll sideways; the Studio page behind it SHALL NOT become a horizontally scrolling document.

#### Scenario: Gallery rooms on a 13 Pro
- **WHEN** the photographer opens Gallery on a 390-wide phone viewport
- **THEN** Gallery, Portfolio, Albums, and Work appear on one row without wrapping

#### Scenario: Settings tabs on a 13 Pro
- **WHEN** the photographer opens Settings on a 390-wide phone viewport
- **THEN** the Settings section tabs appear on one row without wrapping

### Requirement: Studio text fields do not zoom the page
Studio text fields — including login, hub search, and Settings inputs — SHALL use a type size that mobile browsers do not treat as a cue to zoom the whole page on focus.

#### Scenario: Gallery search focus
- **WHEN** the photographer focuses Find a photo on a phone-width viewport
- **THEN** the Studio shell does not enlarge to a zoomed document

### Requirement: Studio on a phone does not pinch-zoom
On phone-width viewports and in installed Studio, the Studio document SHALL NOT allow pinch-zoom or double-tap zoom of the page. Public Soft night pages and Delivery galleries SHALL keep pinch-zoom so photographs can be inspected.

#### Scenario: Pinch on installed Studio
- **WHEN** the photographer pinches the Gallery wall in installed Studio
- **THEN** the page scale does not change

#### Scenario: Public photos still zoom
- **WHEN** a visitor pinches a photograph on the public Portfolio
- **THEN** pinch-zoom still works

### Requirement: Light haptics on Studio phone chrome
Where the platform exposes vibration or equivalent haptic feedback, Studio SHALL give a short pulse when the photographer switches hubs from the bottom bar and when a new in-app notice arrives. Missing platform support SHALL NOT block the action.

#### Scenario: Switch hub on a supporting phone
- **WHEN** the photographer taps a different hub on the bottom bar on a device that supports vibration
- **THEN** a short haptic or vibration plays and the hub still opens if haptics fail

## MODIFIED Requirements

### Requirement: Studio shell chrome adapts to narrow viewports
The Studio shell SHALL keep the majority of a narrow viewport's width available to hub content. Persistent side navigation SHALL NOT occupy a fixed width on phone-width viewports. On those viewports, hub navigation SHALL be a persistent bottom bar listing Dashboard, Gallery, Website, Bookings, Clients, and Settings, with the current hub identifiable, and SHALL sit above the device home-indicator inset. The shell SHALL NOT use a hamburger drawer as the way to move between hubs on phone-width viewports. Hub content padding SHALL be reduced on narrow viewports rather than retaining desktop spacing. On desktop-width viewports the side navigation SHALL remain present as before.

#### Scenario: Open a Studio hub on a phone
- **WHEN** the photographer opens a Studio hub on a phone-width viewport
- **THEN** hub content occupies substantially the full width and is operable, rather than being compressed beside a fixed-width sidebar, and the bottom hub bar is visible without covering the home indicator

#### Scenario: Move between hubs on a phone
- **WHEN** the photographer is on a phone-width viewport
- **THEN** all six hubs are reachable from the bottom bar and the current hub is identifiable without opening a drawer

#### Scenario: Desktop shell unchanged
- **WHEN** the photographer opens a Studio hub on a desktop-width viewport
- **THEN** the persistent side navigation is present as before

### Requirement: Studio content does not overflow horizontally
Studio hub content SHALL NOT require horizontal scrolling of the page on phone-width viewports. Rows combining controls with thumbnails, master-detail panes, and image grids SHALL reflow for narrow widths. A hub tab strip MAY scroll sideways as its own control; that SHALL NOT make the rest of the hub a horizontally scrolling page.

#### Scenario: Portfolio order rows on a phone
- **WHEN** the photographer views Gallery → Portfolio ordering on a phone-width viewport
- **THEN** each row's controls are reachable without horizontal scrolling of the page

#### Scenario: Bookings master-detail on a phone
- **WHEN** the photographer views Clients → Bookings on a phone-width viewport
- **THEN** the list and the selected booking are presented in a single-column flow rather than side by side

### Requirement: Studio touch targets
Compact controls in the Studio SHALL present a touch target of at least 44 by 44 CSS pixels on touch-capable viewports. This covers bottom hub bar items, compact action menus, and per-row reorder and remove controls. Dense hub tab strips retain their existing height.

#### Scenario: Reorder control on a phone
- **WHEN** the photographer uses a reorder control on a phone-width viewport
- **THEN** its touch target is at least 44 by 44 CSS pixels

#### Scenario: Opening hub navigation on a phone
- **WHEN** the photographer moves between Studio hubs on a phone-width viewport
- **THEN** each bottom-bar hub control is at least 44 by 44 CSS pixels
