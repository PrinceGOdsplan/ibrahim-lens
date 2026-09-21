## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Studio app header
Studio SHALL present a full-width app header on every hub. The header SHALL hold in-app notices and a profile control. The header SHALL NOT include an Assistant control. The header SHALL NOT repeat the current hub’s title — the hub toolbar is the only place the hub is named on screen. Phone and desktop SHALL share this header. The header SHALL include a control to open hub navigation on phone-width viewports.

#### Scenario: Open Studio on desktop
- **WHEN** the photographer opens any Studio hub on a desktop-width viewport
- **THEN** they see an app header with notices and profile, and the hub title is in the hub toolbar rather than in the header

#### Scenario: Open Studio on a phone
- **WHEN** the photographer opens any Studio hub on a phone-width viewport
- **THEN** they see the same header pattern (menu, notices, profile) rather than a distinct phone-only title bar that names the hub

#### Scenario: Assistant is not a hub
- **WHEN** the photographer looks at the sidebar or phone hub bar
- **THEN** Assistant is not a sixth hub; it is only the bottom-corner control
