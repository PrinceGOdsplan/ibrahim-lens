# studio-app-shell Specification

## Purpose

Defines app-like Studio interaction for Ibrahim Lens Website and Library hubs: short scrolling shell, full-screen modals, a shared image gallery picker, layman labels, and phone-first usability for a single photographer operator.
## Requirements
### Requirement: Short Studio shell scroll
Studio hub screens SHALL keep the Studio shell still: side hub navigation (and the phone hub bar) SHALL NOT move when the photographer scrolls hub content, SHALL NOT be a scroll container, and SHALL NOT ride document scroll. Title, tabs, and primary actions that belong to the hub chrome SHALL stay in view. The remaining height SHALL be the work surface; that surface SHALL scroll when its content exceeds the space. While a Studio hub is open, the document behind the shell SHALL NOT scroll.

Large image grids MAY live on the hub work surface rather than only in full-screen modals, provided they scroll inside that surface and do not move the shell. Scrolling inside modals remains allowed. Public pages MAY continue to document-scroll; this requirement applies to Studio only.

#### Scenario: Open Website Home on phone
- **WHEN** the photographer opens Website → Home on a phone-width viewport
- **THEN** they see a compact checklist and primary edit actions without an endless page of inline editors

#### Scenario: Scroll the Gallery wall
- **WHEN** the photographer scrolls the Gallery photo wall
- **THEN** Studio hub navigation stays put, and Gallery title, Add photos, rooms, and filters stay put while the thumbnails move

#### Scenario: Sidebar never scrolls
- **WHEN** the photographer scrolls hub content, or wheels while the pointer is over the side hub list
- **THEN** the sidebar does not move and does not show its own scrollbar; only a work surface inside the main pane may scroll

#### Scenario: Scroll gutter on padded hubs
- **WHEN** the photographer opens a hub whose content is narrower than the pane (such as Settings)
- **THEN** the scrollbar sits on the edge of the Studio main pane, not beside the padded content column

### Requirement: Full-screen edit modals
Editing Featured, Services, Work on Home, Portfolio strip, About tease/photo, and comparable Website or Library image/detail tasks SHALL open a full-screen (or near full-screen) modal rather than navigating away to a disconnected page for the same task.

#### Scenario: Edit Services
- **WHEN** the photographer activates Edit Services
- **THEN** a full-screen modal opens for that task and closing it returns them to the Website Home surface

### Requirement: Shared modal image gallery
Studio SHALL provide a shared image gallery modal to select one or more Library images with filter chips at least for All, Portfolio only, and by tag. After confirming selection, the photographer SHALL return to the calling panel to set captions or other details (pick first, caption after).

#### Scenario: Pick Featured then caption
- **WHEN** the photographer picks Featured images in the gallery modal and confirms
- **THEN** they return to the Featured editor where they can set captions for those picks without a separate Library page hop as the only path

### Requirement: Layman Studio labels
Studio Website copy SHALL use layman labels: Services (Home booked-for cards), Portfolio strip (Home masonry), About photo, More site settings, and Featured. It SHALL NOT require the photographer to know internal names such as lanes, atmosphere, or Site chrome.

#### Scenario: Home actions readable
- **WHEN** the photographer views Website → Home primary actions
- **THEN** labels include Edit Featured, Edit Services, Edit Work on Home, Portfolio strip, and About tease (or equivalent plain wording)

### Requirement: Phone-first Studio modals
Full-screen modals SHALL be usable on phone viewports as the primary Studio device class for this change.

#### Scenario: Gallery on phone
- **WHEN** the photographer opens the image gallery modal on a phone
- **THEN** they can filter, select, and confirm without relying on desktop-only chrome

### Requirement: Studio shell chrome adapts to narrow viewports
The Studio shell SHALL keep the majority of a narrow viewport's width available to hub content. Persistent side navigation SHALL NOT occupy a fixed width on phone-width viewports; on those viewports hub navigation SHALL be reachable from compact chrome that does not consume the content area. Hub content padding SHALL be reduced on narrow viewports rather than retaining desktop spacing. On desktop-width viewports the side navigation SHALL remain present and MAY be collapsed to icons as specified in Collapsible hub sidebar.

#### Scenario: Open a Studio hub on a phone
- **WHEN** the photographer opens a Studio hub on a phone-width viewport
- **THEN** hub content occupies substantially the full width and is operable, rather than being compressed beside a fixed-width sidebar

#### Scenario: Move between hubs on a phone
- **WHEN** the photographer opens the Studio navigation on a phone-width viewport
- **THEN** all Studio hubs are reachable and the current hub is identifiable

#### Scenario: Desktop shell with side navigation
- **WHEN** the photographer opens a Studio hub on a desktop-width viewport
- **THEN** the side navigation is present and can be collapsed without hiding the hubs

### Requirement: Studio content does not overflow horizontally
Studio hub content SHALL NOT require horizontal scrolling on phone-width viewports. Rows combining controls with thumbnails, master-detail panes, and image grids SHALL reflow for narrow widths.

#### Scenario: Portfolio order rows on a phone
- **WHEN** the photographer views Gallery → Portfolio ordering on a phone-width viewport
- **THEN** each row's controls are reachable without horizontal scrolling

#### Scenario: Bookings master-detail on a phone
- **WHEN** the photographer views the Bookings hub on a phone-width viewport
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
Each Studio hub SHALL set a document title identifying the hub, and deep state that determines what a hub displays — selected tab, room, sub-tab, or Bookings view — SHALL be represented in the address so it survives reload, back navigation, and sharing.

#### Scenario: Reload a Studio tab
- **WHEN** the photographer selects a tab within a Studio hub and reloads
- **THEN** the same tab is presented

#### Scenario: Back navigation within a hub
- **WHEN** the photographer switches tabs within a hub and navigates back
- **THEN** the previously selected tab is presented

#### Scenario: Reload a Bookings view
- **WHEN** the photographer opens Incomplete on the Bookings hub and reloads
- **THEN** Incomplete is still presented

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

### Requirement: Numeric presentation in Studio

Numbers that a photographer reads as quantities or money — counts, totals, amounts paid, amounts outstanding — SHALL be set in figures of uniform height that align in columns. Figures with varying heights and descenders SHALL NOT be used for these values, because they are harder to compare and to scan down a column.

Quantities of the same kind SHALL use one typeface throughout Studio, so counts on one screen are not set differently from counts on another. Currency SHALL be formatted once, consistently, wherever it appears.

#### Scenario: Money on the Dashboard

- **WHEN** the photographer views amounts paid and outstanding
- **THEN** the figures are of uniform height and the two amounts align for comparison

#### Scenario: Counts across screens

- **WHEN** the photographer compares counts on the Dashboard with counts elsewhere in Studio
- **THEN** both are set in the same typeface and numeric style

#### Scenario: Amounts in a list

- **WHEN** several rows each show an amount
- **THEN** the amounts align vertically rather than shifting with each digit

### Requirement: One date and time format in Studio

A given date or time SHALL be presented in one format everywhere in Studio. The same booking's preferred date SHALL NOT appear as a machine timestamp on one screen and a locale-formatted string on another.

Dates and times SHALL be rendered for a reader rather than emitted raw: a stored timestamp SHALL NOT be shown in its transport form. Precision SHALL suit the meaning — a booking time does not need seconds. Day and month order SHALL be unambiguous to the photographer's audience rather than dependent on the browser's default locale.

#### Scenario: Same booking on two screens

- **WHEN** the photographer views a booking's preferred date on the Dashboard and again in Clients
- **THEN** both show the same value in the same format

#### Scenario: Raw timestamp never shown

- **WHEN** any Studio surface presents a stored date or time
- **THEN** it is formatted for reading rather than shown in its stored transport form

#### Scenario: Booking time precision

- **WHEN** a booking's preferred time is displayed
- **THEN** it shows the time to the minute without seconds

### Requirement: Studio has its own accent

Studio SHALL define accent colours that meet text contrast against the active Studio surface. On the **light** desk, Studio SHALL use its deep brass accent and SHALL NOT use the public Soft night brass (insufficient contrast on light). On **night**, Studio MAY use Soft night brass (or an equivalent that clears contrast on the night ground) for emphasis beyond foreground, muted, border, and danger roles.

Any accent Studio uses SHALL meet the text contrast requirement against the Studio surface it sits on.

#### Scenario: Emphasis on a Studio surface

- **WHEN** a Studio control needs emphasis beyond the muted and foreground roles
- **THEN** it uses the Studio accent token rather than the public accent

#### Scenario: Emphasis on light Studio
- **WHEN** a Studio control needs emphasis on the light desk
- **THEN** it uses the light Studio accent token rather than public Soft night brass

#### Scenario: Emphasis on night Studio
- **WHEN** a Studio control needs emphasis on night mode
- **THEN** it uses an accent that meets contrast on the night ground (Soft night brass is acceptable)

#### Scenario: Accent contrast on the Studio ground

- **WHEN** the Studio accent is used for text
- **THEN** it meets the contrast requirement against the Studio surface behind it

### Requirement: Studio hub nav icons
Studio hub navigation SHALL pair a lucide icon with each hub name (Dashboard, Gallery, Website, Clients, Settings). The icon SHALL NOT replace the label. Touch targets for hub links SHALL remain at least 44 by 44 CSS pixels on touch-capable viewports.

#### Scenario: Scan Studio nav
- **WHEN** the photographer looks at Studio hub navigation on desktop or in the phone drawer
- **THEN** each hub shows an icon beside its name so the five places are distinguishable at a glance

#### Scenario: Labels remain
- **WHEN** the photographer uses Studio nav
- **THEN** they can still read Gallery, Website, Clients, and the other hub names without relying on the icon alone

### Requirement: Studio app header
Studio SHALL NOT present a full-width product header on desktop-width viewports. Operator chrome on desktop SHALL live on the rail as specified in Desktop rail is the operator chrome. On phone-width viewports, Studio SHALL present a compact operator strip (notices, appearance, profile) that SHALL NOT repeat the current hub’s title — the page recipe is the only place the hub is named on screen.

#### Scenario: Open Studio on desktop
- **WHEN** the photographer opens any Studio hub on a desktop-width viewport
- **THEN** they see rail operator chrome and the hub title on the page, and they do not see a full-width product header

#### Scenario: Open Studio on a phone
- **WHEN** the photographer opens any Studio hub on a phone-width viewport
- **THEN** they see a compact operator strip that does not name the hub

### Requirement: Collapsible hub sidebar
On desktop-width viewports, Studio hub navigation SHALL remain present and SHALL be collapsible. Expanded, each hub SHALL show its icon and its word. Collapsed, each hub SHALL show its icon with the word available to assistive technology. The collapsed preference SHALL persist for the photographer’s browser. Phone-width viewports SHALL keep drawer navigation and SHALL NOT show the persistent sidebar.

#### Scenario: Collapse the sidebar
- **WHEN** the photographer collapses hub navigation on desktop
- **THEN** the sidebar shows hub icons without occupying the expanded width, and hubs remain reachable

#### Scenario: Reload keeps collapse
- **WHEN** the photographer reloads Studio after collapsing the sidebar
- **THEN** the sidebar is still collapsed

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

### Requirement: One hub toolbar
Every Studio hub SHALL follow one page recipe: the hub title, that hub’s tabs when it has tabs, that hub’s primary actions, then a single primary work surface. The work surface SHALL sit in a breathing content width on wide desktop viewports rather than stretching edge-to-edge as a stack of equal cages. Website MAY keep its CMS sections inside that surface. Gallery’s photo wall IS the work surface.

#### Scenario: Open Website
- **WHEN** the photographer opens Website
- **THEN** they see pinned chrome titled Website with the same tab treatment as Gallery, and no explaining subtitle in the scroll

#### Scenario: Open Dashboard
- **WHEN** the photographer opens Dashboard
- **THEN** they see pinned chrome titled Dashboard, and the instrument is the surface below — not a page title inside a scrolling article

#### Scenario: Open Bookings
- **WHEN** the photographer opens Bookings
- **THEN** booking views are tabs in that chrome, not a third pill style

### Requirement: Studio page recipe
Every Studio hub SHALL follow one page recipe: the hub title, that hub’s tabs when it has tabs, that hub’s primary actions, then a single primary work surface. The work surface SHALL sit in a breathing content width on wide desktop viewports rather than stretching edge-to-edge as a stack of equal cages. Website MAY keep its CMS sections inside that surface. Gallery’s photo wall IS the work surface.

#### Scenario: Open Bookings
- **WHEN** the photographer opens Bookings on desktop
- **THEN** they see title Bookings, the shared tab idiom, primary actions, and one work surface for the list and detail

#### Scenario: Open Website
- **WHEN** the photographer opens Website
- **THEN** they see the same title / tabs / actions recipe, with the CMS sections inside the work surface rather than a second product header

### Requirement: Hub titles use Studio sans
Hub titles on the page recipe SHALL use the Studio sans family (Figtree). They SHALL NOT use Cormorant. Money and counts SHALL remain lining tabular Studio sans as already specified.

#### Scenario: Read a hub title
- **WHEN** the photographer opens Dashboard, Gallery, Website, Bookings, Clients, or Settings
- **THEN** the hub title is set in Figtree, not Cormorant

### Requirement: Clients hub query params survive tab changes
Changing Clients tabs (Inbox, Deliveries, Feedback, People) SHALL keep query keys that still apply to the destination (`person`, `booking`, `delivery`, `feedback`) instead of replacing the search string with only `tab`.

#### Scenario: Keep person when opening People
- **WHEN** the address includes `person` and the photographer opens the People tab
- **THEN** `person` remains in the address

### Requirement: View client reaches the person
A Bookings “View client” link SHALL open Clients → People with that person selected.

#### Scenario: Follow View client
- **WHEN** the photographer activates View client on a booking that has a Person
- **THEN** People shows that Person’s record

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

### Requirement: Appearance preference persists locally
Studio SHALL persist the chosen appearance mode in browser `localStorage` and restore it on subsequent Studio visits on that browser. Clearing the preference (or first visit) SHALL fall back to light.

#### Scenario: Preference survives reload
- **WHEN** the photographer selects night, reloads, and returns to `/studio`
- **THEN** Studio opens in night mode

### Requirement: Login and portalled Studio surfaces follow appearance
Studio login, authenticated shell, and Studio surfaces portalled outside the layout tree (dialogs, drawers) SHALL follow the same appearance preference so night does not flash light chrome or leave light overlays on a night desk.

#### Scenario: Login matches preference
- **WHEN** night is stored and the photographer opens Studio login
- **THEN** the login surface uses night tokens

#### Scenario: Dialog matches shell
- **WHEN** night is active and a Studio dialog opens
- **THEN** the dialog uses night Studio tokens rather than light or public Soft night type

### Requirement: Browser chrome follows Studio appearance
While a Studio route is active, Studio SHALL set browser theme colour (and colour-scheme / status-bar style where Studio already manages them) to match the active appearance. Launch splash images MAY remain light in this change.

#### Scenario: Theme colour matches night
- **WHEN** night mode is active on a Studio route
- **THEN** the document theme colour reflects the night ground rather than the light desk colour

### Requirement: Studio field helpers stay one language
Studio search, Nigerian phone, and naira amount fields SHALL use the shared Studio field chrome. Search in Gallery and Clients SHALL be the same search input pattern. Phone studio tone SHALL read as one control with neighboring underline fields. Amount fields SHALL show a persistent ₦ prefix and use a numeric input mode on phone.

Settings notice checkboxes SHALL offer at least a 44 by 44 CSS pixel hit on touch-capable viewports (padding on the cell or label).

#### Scenario: Search is the same control
- **WHEN** the photographer searches Gallery photos and Clients people
- **THEN** both fields are search inputs using the shared Studio text field chrome

#### Scenario: Phone sits with name and email
- **WHEN** the photographer adds a person on Bookings or Clients
- **THEN** the +234 phone control aligns visually with the name and email fields rather than a separate boxed family

#### Scenario: Fee shows naira
- **WHEN** the photographer edits a booking fee or amount paid
- **THEN** ₦ is visible without relying on placeholder text alone

#### Scenario: Notice checkbox on phone
- **WHEN** the photographer toggles a Settings notice channel on a phone-width viewport
- **THEN** the hit target is at least 44 by 44 CSS pixels

### Requirement: Studio content icons share one treatment
Lucide marks inside Studio hub **content** (lists, create panels, inbox folders, row actions) SHALL use the same icon treatment as Gallery content: one stroke, one size family, wrapped so raw Lucide defaults are not mixed in. Content section switches (Inbox folders, Delivery source Photos / Albums / Work) SHALL use the shared underline tab idiom rather than filled Button pills. Boolean settings (Published, On the website, notice checkboxes) MAY keep a native checkbox.

#### Scenario: Inbox folders match hub tabs
- **WHEN** the photographer is on Clients → Inbox
- **THEN** Messages / Activity / Everything use the same underline tab treatment as other Studio tabs, not a filled pill row

#### Scenario: Delivery source matches hub tabs
- **WHEN** the photographer is choosing what to put in a Delivery
- **THEN** Photos / Albums / Work use the shared tab idiom with the same icon treatment as Gallery rooms

#### Scenario: Content action icons match Gallery
- **WHEN** the photographer uses Copy link, Revoke, or Add on Deliveries
- **THEN** those actions use the same line-icon treatment as Gallery Add / Arrange, not a different stroke or a third button language

### Requirement: Assistant sheet handoffs stay on the current desk
When Assistant requests an upload sheet, Website tab, Settings tab, or Pick photos modal, Studio SHALL open that surface on the authenticated Studio shell without adding a sixth hub and without leaving the photographer on a blank route. Closing the sheet SHALL return them to the hub they were viewing.

#### Scenario: Upload sheet from Assistant
- **WHEN** Assistant requests the Gallery upload handoff
- **THEN** Gallery is active and the upload sheet is open, and the bottom-corner Assistant control remains available

#### Scenario: Settings tab from Assistant
- **WHEN** Assistant navigates to Settings Notifications
- **THEN** Settings shows the Notifications tab and no separate Assistant hub appears in the rail

### Requirement: Assistant overlay uses configured identity
The Assistant overlay chrome SHALL present the configured Assistant display name and avatar (or their defaults) so the photographer recognizes who they are chatting with. The bottom-corner control MAY keep a compact Assistant affordance; identity detail lives in the open overlay.

#### Scenario: Open overlay with custom avatar
- **WHEN** an Assistant profile picture is set and the photographer opens Assistant
- **THEN** the overlay header shows that avatar beside the configured name

### Requirement: Bottom-corner Assistant chat
Every authenticated Studio hub SHALL show a floating Assistant control in the bottom-right corner of the viewport (above the phone hub bar on narrow viewports), with a visible Assistant label so it is not mistaken for a support chat, and at least a 44 by 44 CSS pixel target. The control SHALL NOT show a numeric badge or a Needs-you dot. Activating it SHALL open the Assistant overlay on the current hub rather than navigating to a new hub. The public site and the Studio login page SHALL NOT show this control.

#### Scenario: Open Assistant from Gallery
- **WHEN** the photographer is on Gallery and activates Assistant
- **THEN** the Assistant overlay opens over Gallery and the corner control still shows Assistant with no badge

#### Scenario: Not a support chat
- **WHEN** the photographer looks at the closed corner control
- **THEN** the visible word Assistant is on the control, not a generic chat or support mark

#### Scenario: Same control on Settings
- **WHEN** the photographer is on Settings
- **THEN** the same bottom-corner Assistant control is present as on Dashboard

#### Scenario: Accessible name
- **WHEN** assistive technology reads the Assistant control
- **THEN** it has a programmatic name Assistant

### Requirement: Assistant overlay matches Studio appearance
The Assistant overlay SHALL follow light and night Studio tokens, including when portalled. It SHALL be usable on a phone-width viewport (sheet or equivalent) without requiring desktop-only chrome. Send and Confirm targets SHALL meet the Studio 44 by 44 CSS pixel touch target on touch-capable viewports.

#### Scenario: Night drawer
- **WHEN** night is active and Assistant is open
- **THEN** the overlay uses night Studio tokens rather than light or public Soft night type

#### Scenario: Assistant is not a hub
- **WHEN** the photographer looks at the sidebar or phone hub bar
- **THEN** Assistant is not a sixth hub; it is only the bottom-corner control

