# public-image-delivery Specification

## Purpose

Defines how photographs are delivered on public surfaces for a photo-first site — responsive source selection so images are neither soft nor wasteful, reserved layout space so galleries do not reflow while loading, and loading priority so the hero arrives first.

## Requirements

### Requirement: Responsive image sources
Public photographic images SHALL be requested at a size appropriate to the space they occupy and the display density, rather than at a single fixed width for every context. Image markup SHALL offer the browser a set of candidate widths together with a description of the layout space so the browser can choose. Full-bleed surfaces SHALL be able to request candidates larger than the current fixed ceiling.

#### Scenario: Hero on a wide display
- **WHEN** a visitor loads Home on a display wider than the previous fixed thumb width
- **THEN** the hero photograph is requested at a width suited to that display rather than being upscaled from a smaller source

#### Scenario: Masonry on a phone
- **WHEN** a visitor loads the Portfolio masonry on a phone-width viewport
- **THEN** the photographs are requested at a width suited to a single narrow column rather than at full desktop width

### Requirement: Reserved layout space
Public photographic images SHALL reserve their layout space before the image data arrives, through intrinsic dimensions or a declared aspect ratio, so that content already on screen does not shift as images load.

#### Scenario: Masonry loading
- **WHEN** a visitor scrolls the Portfolio or atmosphere masonry while images are still arriving
- **THEN** already-visible items do not shift position as each image completes

#### Scenario: Work grid loading
- **WHEN** a visitor loads the Work index
- **THEN** the grid geometry is stable before the cover photographs arrive

### Requirement: Loading priority
The image needed for the first view SHALL be fetched eagerly and at high priority. Photographic images outside the first view SHALL be fetched lazily. A slideshow SHALL NOT fetch all of its frames at full size before the first frame is usable.

#### Scenario: Home first paint
- **WHEN** a visitor loads Home
- **THEN** the first hero frame is fetched eagerly at high priority and the remaining frames do not compete with it

#### Scenario: Long delivery gallery
- **WHEN** a client opens a delivery gallery containing many photographs
- **THEN** photographs below the fold are fetched lazily rather than all at once

#### Scenario: Below-fold Home sections
- **WHEN** a visitor loads Home
- **THEN** the lane cards, Work covers, and atmosphere photographs below the fold are fetched lazily

### Requirement: Progressive full-size viewing
When a visitor opens a photograph at full size from a thumbnail, the surface SHALL present the already-loaded smaller rendition or an equivalent placeholder until the full-size image is ready, rather than an empty region.

#### Scenario: Open a photograph from a thumbnail
- **WHEN** a visitor opens a photograph in the immersive viewer
- **THEN** a rendition or placeholder is visible immediately and is replaced when the full-size image arrives

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
