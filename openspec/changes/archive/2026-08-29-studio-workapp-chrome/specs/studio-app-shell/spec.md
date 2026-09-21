## ADDED Requirements

### Requirement: Studio app header
Studio SHALL present a full-width app header on every hub. The header SHALL hold in-app notices and a profile control. The header SHALL NOT repeat the current hub’s title — the hub toolbar is the only place the hub is named on screen. Phone and desktop SHALL share this header. The header SHALL include a control to open hub navigation on phone-width viewports.

#### Scenario: Open Studio on desktop
- **WHEN** the photographer opens any Studio hub on a desktop-width viewport
- **THEN** they see an app header with notices and profile, and the hub title is in the hub toolbar rather than in the header

#### Scenario: Open Studio on a phone
- **WHEN** the photographer opens any Studio hub on a phone-width viewport
- **THEN** they see the same header pattern (menu, notices, profile) rather than a distinct phone-only title bar that names the hub

### Requirement: Collapsible hub sidebar
On desktop-width viewports, Studio hub navigation SHALL remain present and SHALL be collapsible. Expanded, each hub SHALL show its icon and its word. Collapsed, each hub SHALL show its icon with the word available to assistive technology. The collapsed preference SHALL persist for the photographer’s browser. Phone-width viewports SHALL keep drawer navigation and SHALL NOT show the persistent sidebar.

#### Scenario: Collapse the sidebar
- **WHEN** the photographer collapses hub navigation on desktop
- **THEN** the sidebar shows hub icons without occupying the expanded width, and hubs remain reachable

#### Scenario: Reload keeps collapse
- **WHEN** the photographer reloads Studio after collapsing the sidebar
- **THEN** the sidebar is still collapsed

### Requirement: One hub toolbar
Every Studio hub SHALL pin a toolbar at the top of the hub pane. That toolbar SHALL present exactly one hub title, then that hub’s tabs (when it has tabs) using the shared tab idiom, then that hub’s primary actions. It SHALL NOT lead with a sentence that explains the hub. Secondary controls MAY sit behind a disclosure on that toolbar.

#### Scenario: Open Website
- **WHEN** the photographer opens Website
- **THEN** they see a pinned toolbar titled Website with the same tab treatment as Gallery, and no explaining subtitle in the scroll

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see a pinned toolbar titled Dashboard, and Needs you is the surface below — not a page title inside a scrolling article

#### Scenario: Open Bookings
- **WHEN** the photographer opens Bookings
- **THEN** booking views are tabs in that toolbar, not a third pill style

## MODIFIED Requirements

### Requirement: Studio shell chrome adapts to narrow viewports
The Studio shell SHALL keep the majority of a narrow viewport's width available to hub content. Persistent side navigation SHALL NOT occupy a fixed width on phone-width viewports; on those viewports hub navigation SHALL be reachable from compact chrome that does not consume the content area. Hub content padding SHALL be reduced on narrow viewports rather than retaining desktop spacing. On desktop-width viewports the side navigation SHALL remain present and MAY be collapsed to icons as specified in Collapsible hub sidebar.

#### Scenario: Open a Studio hub on a phone
- **WHEN** the photographer opens a Studio hub on a phone-width viewport
- **THEN** hub content occupies substantially the full width and is operable, rather than being compressed beside a fixed-width sidebar

#### Scenario: Move between hubs on a phone
- **WHEN** the photographer opens the Studio navigation on a phone-width viewport
- **THEN** all Studio hubs are reachable

#### Scenario: Desktop shell with side navigation
- **WHEN** the photographer opens a Studio hub on a desktop-width viewport
- **THEN** the side navigation is present and can be collapsed without hiding the hubs

### Requirement: One tab idiom across Studio hubs

Tab navigation SHALL use a single visual idiom across every Studio hub, including Bookings views. A photographer moving between Clients, Gallery, Website, and Bookings SHALL see the same treatment for the same kind of control, so tabs are recognisable as tabs rather than appearing to be a different mechanism per hub.

Where a hub separates primary tabs from secondary ones, that separation SHALL be legible — a visible grouping, a gap, or a label — rather than a divider glyph whose contrast against the surface leaves it invisible.

Counts on a tab, when present, SHALL sit on that tab as numerals in the Studio numeric style.

#### Scenario: Moving between hubs

- **WHEN** the photographer moves from Clients to Gallery to Website to Bookings
- **THEN** the tab strips use one consistent treatment for selected and unselected tabs

#### Scenario: Primary and secondary tab groups

- **WHEN** a hub separates primary from secondary tabs
- **THEN** the separation is perceivable rather than carried by a glyph that blends into the background

#### Scenario: Bookings view counts

- **WHEN** the photographer looks at Bookings views
- **THEN** each view is a tab in the shared idiom, and any count is a numeral on that tab
