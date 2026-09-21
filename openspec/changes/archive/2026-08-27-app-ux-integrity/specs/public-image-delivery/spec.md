## Purpose

Defines how photographs are delivered on public surfaces for a photo-first site — responsive source selection so images are neither soft nor wasteful, reserved layout space so galleries do not reflow while loading, and loading priority so the hero arrives first.

## ADDED Requirements

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
