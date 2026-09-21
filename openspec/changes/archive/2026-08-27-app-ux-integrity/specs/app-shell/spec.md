## MODIFIED Requirements

### Requirement: Safe-area padding on public chrome

The fixed public header and the full-screen mobile menu SHALL include padding that respects CSS environment safe-area insets so brand, menu toggle, and Close remain clear of notch and home-indicator regions. The offset applied to page content below the fixed header SHALL account for the same insets, so content is not obscured by the header on devices reporting a top inset. That offset SHALL be derived from the header's actual occupied height rather than assumed.

#### Scenario: Header clears notch

- **WHEN** the public header is shown on a device reporting a top safe-area inset
- **THEN** header controls are not clipped by the system UI region

#### Scenario: Content clears the header on a notched device

- **WHEN** a visitor opens a public route other than Home on a device reporting a top safe-area inset
- **THEN** the first heading of that page is fully visible below the header rather than obscured by it

## ADDED Requirements

### Requirement: Navigation resets reading position

Navigating to a different public route SHALL place the visitor at the start of the new page. Navigating to an in-page target SHALL place the visitor at that target. Returning to a previous entry in history SHOULD restore the position the visitor had on that entry.

#### Scenario: Follow a footer link from deep in a page

- **WHEN** a visitor scrolled far down a page follows a footer link to another route
- **THEN** the new page is presented from its start rather than at the previous scroll offset

#### Scenario: Follow an in-page booking target

- **WHEN** a visitor follows a link targeting the booking form on Contact
- **THEN** the booking form is brought into view

#### Scenario: Navigate back

- **WHEN** a visitor navigates back to a page they had scrolled
- **THEN** their previous reading position on that page is restored

### Requirement: Bypass repeated navigation

Public pages and the Delivery page SHALL provide a control, reachable as the first focusable element, that moves focus past the header and navigation directly to the main content region. The control SHALL be visually hidden until focused.

#### Scenario: Keyboard user bypasses the header

- **WHEN** a keyboard user presses Tab immediately after a public page loads
- **THEN** a visible bypass control receives focus, and activating it moves focus to the main content region

### Requirement: Public routes load without Studio code

Loading a public route SHALL NOT require downloading the code for Studio hubs. Route groups SHALL be delivered separately so that a first-time visitor's initial download covers only the public surface they requested.

#### Scenario: Visitor loads Home

- **WHEN** a first-time visitor loads Home
- **THEN** the Studio hub code is not part of the initial download

#### Scenario: Photographer opens Studio

- **WHEN** the photographer navigates to a Studio hub
- **THEN** the Studio code is fetched at that point and the hub renders
