## MODIFIED Requirements

### Requirement: Panels size to available space
A Studio list or panel SHALL NOT be constrained to a fixed height that forces it to scroll while unused space remains below it on screen. Where a region needs its own scroll — a photo wall, or a long list beside a detail pane — its height SHALL derive from the space actually available under any pinned hub chrome, so scrolling begins only when the content genuinely exceeds that leftover height. Scrolling that region SHALL NOT move the Studio shell.

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

#### Scenario: Gallery wall uses leftover height
- **WHEN** the photographer opens Gallery on a desktop viewport
- **THEN** the photo wall fills the height under the pinned Gallery chrome and scrolls there, without unused empty space below a shorter box
