## ADDED Requirements

### Requirement: Panels size to available space

A Studio list or panel SHALL NOT be constrained to a fixed height that forces it to scroll while unused space remains below it on screen. Where a region needs its own scroll — a long list beside a detail pane — its height SHALL derive from the space actually available, so scrolling begins only when the content genuinely exceeds the viewport.

A region SHALL NOT cut a row mid-height at its lower edge in a way that reads as clipped content rather than as a scrollable boundary.

#### Scenario: List shorter than the viewport

- **WHEN** a list's content would fit in the space available on screen
- **THEN** it is shown without an inner scrollbar

#### Scenario: List longer than the viewport

- **WHEN** a list's content exceeds the space available
- **THEN** it scrolls within the space it has, using the full height available to it rather than a smaller fixed height

#### Scenario: Bookings list beside its detail pane

- **WHEN** the photographer opens Clients → Bookings on a desktop viewport
- **THEN** the list occupies the height available beside the detail pane rather than a fixed height with empty space beneath it

### Requirement: Detail panes use the width they occupy

A detail pane SHALL make use of the width it is given. Where a pane is wide and its content is narrow, related fields SHALL be arranged to use that width rather than stacking in a narrow column beside a large empty area.

Content that the photographer needs on arriving at a record SHALL be visible rather than collapsed behind a disclosure while space to show it remains unused. Disclosures remain appropriate for genuinely secondary detail and for narrow viewports.

#### Scenario: Wide booking detail pane

- **WHEN** the photographer selects a booking on a desktop viewport
- **THEN** the pane's fields use the available width rather than occupying a narrow column beside empty space

#### Scenario: Primary detail is visible on arrival

- **WHEN** the photographer opens a booking and space is available to show it
- **THEN** the payment state is visible without first expanding a disclosure

#### Scenario: Narrow viewport keeps disclosures

- **WHEN** the photographer opens a booking on a phone
- **THEN** sections may remain collapsed, because there is not room to show them at once
