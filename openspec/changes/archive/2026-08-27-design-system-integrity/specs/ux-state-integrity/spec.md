## ADDED Requirements

### Requirement: Public placeholder copy addresses the visitor

Copy shown on a public surface while content is loading, or when content is absent, SHALL be written for the visitor. It SHALL NOT contain operator instructions, Studio navigation paths, or any direction only the photographer could act on.

Where a public section has nothing to show because it has not been configured, the section SHALL be omitted or SHALL present visitor-appropriate copy. Telling a visitor where in Studio a value is edited exposes the tool's internals and gives them nothing they can use.

#### Scenario: Contact details still loading

- **WHEN** a visitor opens `/contact` and the configured contact details have not yet arrived
- **THEN** the placeholder shown does not name a Studio location or instruct the reader to edit anything

#### Scenario: Section with nothing configured

- **WHEN** a public section has no configured content
- **THEN** it is omitted or shows visitor-appropriate copy, rather than an operator instruction

#### Scenario: Studio keeps its own guidance

- **WHEN** the photographer views the same unconfigured section inside Studio
- **THEN** Studio may still tell them where to configure it
