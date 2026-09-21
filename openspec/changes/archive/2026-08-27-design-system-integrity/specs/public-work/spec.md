## MODIFIED Requirements

### Requirement: Work detail image set
Each website-visible Work detail page SHALL showcase only the images belonging to that Work project.

A Work detail page SHALL also present the project's identifying context, so it reads as an account of a shoot rather than a title above a grid. That context SHALL include the project's summary and, when configured, narrative body copy and shoot facts such as the client or subject, the location, and when it took place. Facts that are not configured SHALL be omitted rather than shown as empty labels.

This is what distinguishes a Work story from the Portfolio gallery: Portfolio presents curated frames, while Work explains the shoot around them. A Work detail page that presents only a title and a grid does not meet this requirement.

#### Scenario: Visitor opens a Work project
- **WHEN** a visitor opens `/work/:slug` for a website-visible Work project
- **THEN** they see that project’s metadata and only its images

#### Scenario: Story with narrative configured

- **WHEN** a Work project has body copy and shoot facts configured
- **THEN** the detail page presents them alongside the image set

#### Scenario: Story with sparse configuration

- **WHEN** a Work project has only a title and summary configured
- **THEN** the page presents those without rendering empty labels for the missing facts

## ADDED Requirements

### Requirement: Onward path from a Work story

A Work detail page SHALL offer a way forward when the visitor reaches the end of the image set. It SHALL provide at least a route to another Work story when one exists, and a booking affordance, so the page does not terminate in a dead end at the bottom of a long scroll.

The end of the page SHALL NOT be a lone trailing image followed by empty space, so the visitor can tell the story has concluded rather than failed to load.

#### Scenario: Reaching the end of a story

- **WHEN** a visitor scrolls to the end of a Work story
- **THEN** they are offered another story to open and a way to book

#### Scenario: Only one story published

- **WHEN** only one Work project is website-visible and a visitor reaches its end
- **THEN** the booking affordance is still offered and no broken link to a sibling story is shown

#### Scenario: Trailing row resolves

- **WHEN** a story's image count does not fill its final row
- **THEN** the final row resolves without leaving one centred image adrift from the page's alignment
