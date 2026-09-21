## ADDED Requirements

### Requirement: Studio light and Soft-night–related night modes
Studio SHALL offer exactly two appearance modes: **light** (default desk) and **night** (warm Soft-night–related colour ladder). Night SHALL reuse Soft night ground / raised / text kinship for glare reduction, while Studio type (Cormorant / Figtree) and tool chrome patterns remain Studio. Cool graphite or additional gray modes SHALL NOT be offered.

#### Scenario: Default is light
- **WHEN** the photographer opens Studio with no stored appearance preference
- **THEN** Studio renders in the light desk palette

#### Scenario: Night reduces glare on the shell
- **WHEN** the photographer selects night mode
- **THEN** Studio shell ground, panels, borders, and text read as warm Soft-night–related (not cool SaaS dark) across hubs including Gallery

#### Scenario: Studio type unchanged in night
- **WHEN** night mode is active
- **THEN** Studio headlines and UI text still use Cormorant / Figtree rather than public Syne / Sora

### Requirement: Header sun/moon appearance toggle
Studio SHALL expose an icon-only sun/moon control in the app header that toggles between light and night. The control SHALL present at least a 44 by 44 CSS pixel touch target, SHALL be operable on phone and desktop, and SHALL NOT require opening Settings.

#### Scenario: Toggle from Gallery
- **WHEN** the photographer is in Gallery and activates the sun/moon control
- **THEN** the Studio shell switches mode immediately without leaving the hub

#### Scenario: Accessible name
- **WHEN** assistive technology reads the appearance control
- **THEN** it has a programmatic name that reflects the action (e.g. switch to night / switch to light)

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

## MODIFIED Requirements

### Requirement: Studio has its own accent
Studio SHALL define accent colours that meet text contrast against the active Studio surface. On the **light** desk, Studio SHALL use its deep brass accent and SHALL NOT use the public Soft night brass (insufficient contrast on light). On **night**, Studio MAY use Soft night brass (or an equivalent that clears contrast on the night ground) for emphasis beyond foreground, muted, border, and danger roles.

Any accent Studio uses SHALL meet the text contrast requirement against the Studio surface it sits on.

#### Scenario: Emphasis on light Studio
- **WHEN** a Studio control needs emphasis on the light desk
- **THEN** it uses the light Studio accent token rather than public Soft night brass

#### Scenario: Emphasis on night Studio
- **WHEN** a Studio control needs emphasis on night mode
- **THEN** it uses an accent that meets contrast on the night ground (Soft night brass is acceptable)

#### Scenario: Accent contrast on the Studio ground
- **WHEN** the Studio accent is used for text
- **THEN** it meets the contrast requirement against the Studio surface behind it
