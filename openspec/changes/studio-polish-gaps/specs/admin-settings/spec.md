## ADDED Requirements

### Requirement: Brand favicon beside logo

Settings → Brand SHALL let the photographer upload a site favicon (ICO, PNG, or SVG within the normal image upload limits) beside the brand logo. When a favicon is set, public pages SHALL use it as the document icon. When unset, the built-in `/favicon.svg` remains.

#### Scenario: Photographer sets a favicon

- **WHEN** the photographer uploads a favicon under Settings → Brand and saves
- **THEN** public pages serve that file as the document favicon

#### Scenario: No custom favicon

- **WHEN** Brand has a logo but no favicon
- **THEN** public pages keep the default `/favicon.svg`
