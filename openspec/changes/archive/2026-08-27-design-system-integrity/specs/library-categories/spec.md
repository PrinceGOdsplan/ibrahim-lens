## MODIFIED Requirements

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
