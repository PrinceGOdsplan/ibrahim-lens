# library-categories Specification

## Purpose

Simple portfolio tags to separate or group similar picture types on the public Portfolio, managed from Settings.

## Requirements

### Requirement: Tag list in Settings
Authenticated photographers SHALL manage a simple list of portfolio tags (create, rename, delete) under Settings, not as a primary Library hub tab.

Tags SHALL be treated as the same tag when they differ only by letter case or by surrounding whitespace. Creating a tag that already exists under a different case SHALL resolve to the existing tag rather than adding a second entry, and the photographer SHALL be told that it already exists rather than silently ending up with a duplicate. This prevents the public filter row from listing the same category twice.

#### Scenario: Manage tags in Settings
- **WHEN** the photographer adds a tag in Settings → Portfolio tags
- **THEN** that tag becomes available to assign to Portfolio images

#### Scenario: Adding a case variant of an existing tag

- **WHEN** the photographer adds `weddings` and a tag `Weddings` already exists
- **THEN** no second tag is created, and the photographer is told the tag already exists

#### Scenario: Surrounding whitespace

- **WHEN** the photographer adds a tag with leading or trailing spaces
- **THEN** it resolves to the trimmed tag rather than a distinct entry

#### Scenario: Existing duplicates are grouped for display

- **WHEN** the stored tag list already contains case variants of the same word
- **THEN** the public filter row offers them as one filter that matches images tagged either way

### Requirement: Assign tags to portfolio images
Authenticated photographers SHALL assign tags to Portfolio images for public filtering, including from Library image editing UI.

#### Scenario: Filterable tag assignment
- **WHEN** the photographer assigns a tag to a Portfolio image
- **THEN** visitors can filter `/portfolio` by that tag when filters are shown

### Requirement: Tags in app-like assign flow
Assigning portfolio tags SHALL be possible from Library image detail / modal flows with plain-language wording (tags for Portfolio filters), without requiring a tutorial to find Settings-only assignment as the sole path. Tag list management MAY remain under Settings.

#### Scenario: Tag while editing an image
- **WHEN** the photographer edits an image in Library
- **THEN** they can assign existing portfolio tags without leaving for an unexplained Settings-only dead end as the only option