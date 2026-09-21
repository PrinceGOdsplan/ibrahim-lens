## ADDED Requirements

### Requirement: Mobile menu readable contrast
The public mobile menu SHALL present explore links in foreground-level contrast by default, muting only the active route when applicable. When the visitor is on Home (no explore item active), explore links SHALL remain readable rather than all muted.

#### Scenario: Open menu on Home
- **WHEN** a visitor on `/` opens the mobile menu
- **THEN** explore links are clearly readable and Book a session remains available

### Requirement: Safe-area padding on public chrome
The fixed public header and the full-screen mobile menu SHALL include padding that respects CSS environment safe-area insets so brand, menu toggle, and Close remain clear of notch and home-indicator regions.

#### Scenario: Header clears notch
- **WHEN** the public header is shown on a device reporting a top safe-area inset
- **THEN** header controls are not clipped by the system UI region
