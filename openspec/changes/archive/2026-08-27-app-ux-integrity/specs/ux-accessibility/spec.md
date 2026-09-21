## Purpose

Defines the baseline accessibility contract for both the public Soft night site and the Studio tool: controls are programmatically named, state changes are announced, keyboard users can see and reach what they operate, dialogs contain focus, and automatic motion can be stopped.

## ADDED Requirements

### Requirement: Form controls are programmatically labelled

Every form control on public and Studio surfaces SHALL have a programmatic accessible name from an associated label element or an explicit label attribute. A placeholder SHALL NOT be the only label for a control. Activating a visible label SHALL move focus to its control. Controls composed of a prefix plus an input SHALL accept an identifier so a caller's label associates with the editable input.

#### Scenario: Booking form label association

- **WHEN** a visitor activates the "Name" label on the public booking form
- **THEN** focus moves to the name input

#### Scenario: Phone control label association

- **WHEN** the public booking phone label is activated
- **THEN** focus moves to the editable national-digits input inside the phone control

#### Scenario: Delivery feedback field

- **WHEN** a client reaches the Delivery feedback field with a screen reader
- **THEN** the field is announced with a label rather than only a placeholder

#### Scenario: Studio editor fields

- **WHEN** the photographer reaches a Studio editor field that previously relied on a placeholder
- **THEN** the field is announced with its visible label

### Requirement: Status and error messages are announced

Messages reporting the outcome of an action SHALL be announced to assistive technology without requiring focus to move to them. Errors SHALL be announced assertively and non-error status SHALL be announced politely. A control whose value failed validation SHALL be marked invalid and associated with its error message.

#### Scenario: Booking submission fails validation

- **WHEN** the public booking form rejects the phone number
- **THEN** the error is announced, the phone control is marked invalid, and the control is associated with the error text

#### Scenario: Booking submission succeeds

- **WHEN** the public booking form submits successfully
- **THEN** the confirmation is announced politely

#### Scenario: Studio save fails

- **WHEN** a Studio save fails
- **THEN** the failure is announced without the photographer needing to hunt for the message

### Requirement: Accessible names for image controls

A control whose only visible content is an image or an icon SHALL have a programmatic accessible name describing the action and its subject. Selection controls SHALL expose their pressed or selected state.

#### Scenario: Image picker thumbnail

- **WHEN** the photographer reaches a thumbnail select control in a Studio image picker
- **THEN** the control is announced with a name identifying the photo and the select or deselect action, together with its selected state

#### Scenario: Portfolio tag filter

- **WHEN** a visitor reaches a Portfolio tag filter control
- **THEN** the control's active state is exposed programmatically and not by colour alone

### Requirement: Heading structure and skip link

Every page SHALL expose exactly one top-level heading identifying that page, and heading levels SHALL not skip. A mechanism to bypass the repeated header and navigation SHALL be the first focusable control on public pages and on the Delivery page, and SHALL become visible when focused.

#### Scenario: Home top-level heading

- **WHEN** a visitor navigates the Home page by heading
- **THEN** a single top-level heading identifies the page

#### Scenario: Skip the header

- **WHEN** a keyboard user presses Tab on first load of a public page
- **THEN** the first focusable control is a visible skip control that moves focus to the main content region

### Requirement: Visible keyboard focus

Every interactive control SHALL present a focus indicator visible against its own background. Where a default focus outline is suppressed, a replacement indicator SHALL be provided that does not rely solely on a one-pixel border colour change.

#### Scenario: Public booking field focus

- **WHEN** a keyboard user focuses a public booking form field
- **THEN** a focus indicator clearly distinguishable from the unfocused state is shown

#### Scenario: Primary Book action focus

- **WHEN** a keyboard user focuses the primary Book action
- **THEN** a focus indicator is shown

### Requirement: Dialogs contain and restore focus

A surface presented as a modal dialog SHALL move focus into itself when it opens, confine keyboard navigation to its own content while open, prevent assistive-technology access to the content behind it, close on the Escape key, and return focus to the control that opened it when it closes.

Where dialogs are stacked, only the topmost SHALL respond to the Escape key, and the content made inaccessible SHALL be everything outside the topmost dialog rather than only the main application region.

#### Scenario: Public image viewer

- **WHEN** a visitor opens a photograph in the immersive viewer and then closes it
- **THEN** focus returns to the thumbnail that opened it

#### Scenario: Mobile menu focus

- **WHEN** a visitor opens the public mobile menu
- **THEN** focus moves into the menu and Tab does not reach content behind it

#### Scenario: Studio full-screen modal

- **WHEN** the photographer opens a Studio full-screen modal
- **THEN** focus moves into the modal, is confined to it, and returns to the opening control on close

#### Scenario: Escape with a dialog open above another

- **WHEN** the photographer presses Escape while a confirmation is open above a Studio full-screen modal
- **THEN** only the confirmation closes

### Requirement: Automatic motion can be stopped

Content that advances automatically SHALL provide a control to pause and resume it. Automatic advance SHALL remain suppressed when the user has expressed a reduced-motion preference, and that preference SHALL also suppress smooth scrolling.

#### Scenario: Pause the hero slideshow

- **WHEN** a visitor activates the pause control on the Home hero slideshow
- **THEN** automatic advance stops and the control offers to resume

#### Scenario: Pause the testimonials carousel

- **WHEN** a visitor activates the pause control on the testimonials carousel
- **THEN** automatic advance stops and the quote in view remains

#### Scenario: Reduced motion suppresses smooth scrolling

- **WHEN** a visitor has expressed a reduced-motion preference and navigates to an in-page anchor
- **THEN** the position changes without an animated scroll

### Requirement: Native controls match the surface theme

Surfaces rendered on the warm-dark public palette SHALL declare a dark colour scheme so browser-supplied control chrome — date and time pickers, select indicators, checkboxes, and scrollbars — renders legibly rather than as dark chrome on a dark background.

#### Scenario: Preferred date and time control

- **WHEN** a visitor views the booking form preferred date and time control on the public site
- **THEN** the browser-supplied picker affordance is legible against the warm-dark surface

#### Scenario: Delivery favourite checkbox

- **WHEN** a client views the favourite checkbox on the Delivery page
- **THEN** the checkbox is legible against the warm-dark surface

### Requirement: Text contrast on themed surfaces

Text conveying information SHALL meet a contrast ratio of at least 4.5:1 against its actual background. Status and error text SHALL use palette roles chosen for the surface it renders on. Sustained body copy SHALL use the body text role rather than the muted role, which is reserved for labels and de-emphasis.

#### Scenario: Public error text

- **WHEN** an error message renders on a public warm-dark surface
- **THEN** its contrast against that surface meets at least 4.5:1

#### Scenario: Legal page body copy

- **WHEN** a visitor reads the Privacy or Terms body copy
- **THEN** that copy uses the body text role rather than the muted role
