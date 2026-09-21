## ADDED Requirements

### Requirement: Full-size viewing fits the whole frame

When a visitor opens a photograph at full size, the entire photograph SHALL be visible within the viewport. The image SHALL be scaled down to fit the available space, preserving its aspect ratio, and SHALL NOT extend beyond any edge of the viewport. This applies to both orientations and at every viewport size, including a tall portrait frame on a short landscape screen and a wide frame on a narrow screen.

The visible result SHALL be the whole frame with empty space around it where the aspect ratios differ, never a centre-cropped portion of the frame presented as if it were the whole.

#### Scenario: Tall portrait on a landscape screen

- **WHEN** a visitor opens a portrait photograph taller than the viewport in the full-size viewer
- **THEN** the complete photograph is visible, scaled to fit, with no part of it above or below the viewport edges

#### Scenario: Wide frame on a phone

- **WHEN** a visitor opens a landscape photograph wider than a phone viewport in the full-size viewer
- **THEN** the complete photograph is visible, scaled to fit, with no part of it beyond the left or right edges

#### Scenario: Frame smaller than the viewport

- **WHEN** a visitor opens a photograph whose natural size is smaller than the available space
- **THEN** the photograph is shown without being upscaled beyond its natural size, and remains fully visible

### Requirement: Galleries present a photograph's own proportions

Public galleries that present a photograph as a browseable frame — the Portfolio gallery, the Home atmosphere block, and a Work story's image set — SHALL lay out each item according to that photograph's own aspect ratio rather than forcing every item into a single fixed ratio.

A gallery MAY use a uniform ratio where the tile is deliberately a crop of a larger composition, such as a card whose photograph is a background for overlaid text. It SHALL NOT do so where the photograph itself is the content being browsed, because a fixed ratio silently discards part of a landscape frame and mis-proportions a portrait one.

#### Scenario: Mixed orientations in the Portfolio gallery

- **WHEN** the Portfolio gallery contains both portrait and landscape photographs
- **THEN** each is laid out at its own proportion, and no landscape frame is cropped to a portrait tile

#### Scenario: Atmosphere block frame fidelity

- **WHEN** a visitor views the Home atmosphere block
- **THEN** the frames vary in height according to their own proportions rather than all resolving to one uniform tile

#### Scenario: Lane card as a deliberate crop

- **WHEN** a lane card presents a photograph as the ground beneath a title and body
- **THEN** that card may hold a fixed ratio, because the tile is chrome rather than the browsed frame
