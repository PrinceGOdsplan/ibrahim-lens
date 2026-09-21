## ADDED Requirements

### Requirement: Website section rows name what the visitor sees

Each editable section row in the Website hub SHALL be labelled with the name the section carries on the public site, or SHALL state that public name alongside its own. The photographer SHALL NOT have to remember an internal label in order to know which part of the page they are editing.

#### Scenario: Editing the atmosphere block

- **WHEN** the photographer views the Website Home tab
- **THEN** the row for the atmosphere block is identifiable by the name that block carries on the public page

#### Scenario: Row names track the public site

- **WHEN** a public section's heading is renamed through Site chrome
- **THEN** the Website hub row remains identifiable rather than continuing to show only an unrelated internal label

### Requirement: Website section rows show their content

Each editable section row SHALL indicate what it currently holds — a representative photograph where the section is photographic, and the section's own configured heading or item count where it is textual. A photographer editing a photography site SHALL be able to recognise a section from the hub without opening it.

#### Scenario: Photographic section row

- **WHEN** the photographer views the Website Home tab and a section holds photographs
- **THEN** that row shows a representative photograph from the section

#### Scenario: Textual section row

- **WHEN** a section holds text rather than photographs
- **THEN** the row shows its configured heading or how many items it holds

#### Scenario: Unconfigured section

- **WHEN** a section has nothing configured yet
- **THEN** the row says so, rather than showing a placeholder that looks like content

### Requirement: Website row status reflects real state

A status shown against a Website section row SHALL distinguish between sections. A field that resolves to the same value for every row regardless of its configuration SHALL NOT be shown, because it occupies the position a reader scans for difference while carrying no information.

Where a section's state is worth reporting, the states SHALL be distinguishable and their meaning clear from the label.

#### Scenario: Status that never varies

- **WHEN** every section row would report the same status
- **THEN** that status is not shown

#### Scenario: Status that distinguishes rows

- **WHEN** one section is unconfigured and another is complete
- **THEN** their rows report different states, and the labels make the difference clear
