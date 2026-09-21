## ADDED Requirements

### Requirement: Lane grid adapts to lane count

The Home lane section SHALL lay out however many lanes are configured without leaving a partially filled row that reads as a mistake. The grid SHALL adapt its track count to the number of lanes rather than assuming a fixed three.

When the lane count does not divide evenly into the available tracks, the section SHALL resolve the remainder deliberately — by reducing the track count, by widening the trailing items to fill the row, or by another treatment that leaves no lane sitting alone beside empty columns.

#### Scenario: Four lanes configured

- **WHEN** four lanes are configured in Website → Home and a visitor views Home on a wide viewport
- **THEN** the lanes are laid out with no single card orphaned beside two empty columns

#### Scenario: Three lanes configured

- **WHEN** three lanes are configured
- **THEN** they fill one row exactly, as they do today

#### Scenario: Two lanes configured

- **WHEN** two lanes are configured
- **THEN** the row resolves without a gap that reads as a missing third card

### Requirement: Composed headlines are not machine-joined from item titles

A Home section headline SHALL NOT be produced by concatenating the titles of the items below it with a separator character. Such a headline grows without bound as content is added, and its separators land arbitrarily when the line wraps — producing a trailing separator at the end of a line with the final word orphaned onto the next.

Section headlines SHALL come from an authored field with a Soft night default, so their length and line breaks are a design decision rather than a side effect of how many lanes exist. This also keeps chrome clear of the slash ornaments the Soft night direction excludes.

#### Scenario: Lane headline with four lanes

- **WHEN** four lanes are configured and a visitor views the Home lane section
- **THEN** the headline reads as an authored line rather than the four lane titles joined by separators

#### Scenario: Headline wraps

- **WHEN** a section headline wraps to a second line
- **THEN** no line ends with a dangling separator character

### Requirement: Home stays navigable on small screens

Home SHALL remain traversable on a phone: a visitor SHALL be able to reach the booking section without scrolling through an unbroken run of photographs long enough to lose the page's structure.

The atmosphere block SHALL bound how many frames it presents on small screens, with a control to continue into `/portfolio` for the rest, rather than stacking its full set into one column. Home SHALL NOT present the atmosphere block as the longest section of the page on a phone.

#### Scenario: Atmosphere volume on a phone

- **WHEN** a visitor views Home on a narrow viewport with many atmosphere frames configured
- **THEN** the section shows a bounded set with a way through to Portfolio, rather than every frame stacked in one column

#### Scenario: Reaching booking from the top

- **WHEN** a visitor lands on Home on a phone and scrolls toward the booking section
- **THEN** they pass through distinguishable sections rather than a single continuous column of frames
