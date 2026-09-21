# studio-website-ia Specification

## Purpose

Defines Soft night–shaped Website hub information architecture: primary Home / About / Contact & booking tabs, secondary Testimonials and FAQ, and tucked Site chrome for rare CMS fields — with open-public-page affordances and progressive disclosure.

## Requirements

### Requirement: Soft night Website hub layout
The Website hub SHALL present primary tabs for Home, About, and Contact & booking; secondary tabs for Testimonials and FAQ; and a tucked Site chrome area (collapsed by default) for footer, eyebrows, SEO, legal bodies, and rare fallbacks. It SHALL NOT present a Services packages tab or a top-level Globals tab.

#### Scenario: Photographer opens Website
- **WHEN** an authenticated photographer opens `/studio/website`
- **THEN** they see Soft night–shaped primary and secondary navigation plus a tucked Site chrome control, without Services or Globals as top tabs

### Requirement: Open public page from Website tabs
Each primary Website tab SHALL offer a control to open the corresponding public page (Home → `/`, About → `/about`, Contact & booking → `/contact`) in a new browsing context.

#### Scenario: Preview Contact from Studio
- **WHEN** the photographer activates Open public page on Contact & booking
- **THEN** `/contact` opens for verification

### Requirement: Hub coaching copy
The Website hub SHALL use Soft night coaching language (curate Home, About, and Contact; chrome under Site settings) rather than generic “globals / services” framing.

#### Scenario: Hub subtitle
- **WHEN** the photographer views the Website hub header
- **THEN** coaching copy reflects Soft night curation, not the removed Services/Globals IA

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
