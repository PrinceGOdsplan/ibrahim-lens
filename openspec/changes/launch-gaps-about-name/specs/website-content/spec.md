## ADDED Requirements

### Requirement: About shows the editable site display name

The About page H1 SHALL show `website_globals.site_display_name` when set, falling back to “Ibrahim Lens”. Studio → Website → About SHALL let the photographer edit that name alongside the About subtitle and body.

#### Scenario: Photographer renames About heading

- **WHEN** the photographer sets the About / site display name to a non-empty value and saves
- **THEN** the public About page H1 shows that name

#### Scenario: Empty name falls back

- **WHEN** `site_display_name` is empty
- **THEN** About H1 shows “Ibrahim Lens”
