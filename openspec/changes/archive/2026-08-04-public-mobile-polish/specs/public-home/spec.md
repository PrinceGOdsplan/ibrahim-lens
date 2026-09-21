## ADDED Requirements

### Requirement: Hero mobile chrome clearance
On small screens, Home hero Book and Portfolio CTAs and slideshow controls SHALL sit with enough bottom clearance that they are not obscured by the system home-indicator / gesture bar. Slideshow controls SHALL mark only the active slide as current.

#### Scenario: Hero CTAs and dots on phone
- **WHEN** a visitor views the Home hero on a narrow viewport with multiple slides
- **THEN** Book and Portfolio remain tappable and only one slide control is current

### Requirement: Home lanes shorter on small screens
Home Portraits / Fashion / Lifestyle lane cards SHALL use a slightly reduced aspect ratio on small screens versus desktop, while remaining photo-first.

#### Scenario: Lane aspect on phone
- **WHEN** a visitor views Home lanes on a narrow viewport
- **THEN** each lane card is shorter than the desktop tall aspect while still showing a portrait-oriented frame

### Requirement: Atmosphere single column on small screens
Home atmosphere masonry SHALL render as a single column below a small breakpoint and may use multiple columns on larger viewports.

#### Scenario: Atmosphere on phone
- **WHEN** a visitor views the Home atmosphere section on a narrow viewport
- **THEN** frames stack in one column

### Requirement: Home booking mobile submit comfort
The Home booking section SHALL use the shared booking form’s small-screen submit comfort behavior (primary Request booking easy to reach; WhatsApp secondary when configured).

#### Scenario: Home booking on phone
- **WHEN** a visitor reaches Home booking on a narrow viewport
- **THEN** Request booking remains the primary Soft night action and stays easy to reach while completing the form
