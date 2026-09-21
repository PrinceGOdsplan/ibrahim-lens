## MODIFIED Requirements

### Requirement: Short Studio shell scroll
Studio hub screens SHALL keep the Studio shell still: side hub navigation (and the phone hub bar) SHALL NOT move when the photographer scrolls hub content, SHALL NOT be a scroll container, and SHALL NOT ride document scroll. Title, tabs, and primary actions that belong to the hub chrome SHALL stay in view. The remaining height SHALL be the work surface; that surface SHALL scroll when its content exceeds the space. While a Studio hub is open, the document behind the shell SHALL NOT scroll.

Large image grids MAY live on the hub work surface rather than only in full-screen modals, provided they scroll inside that surface and do not move the shell. Scrolling inside modals remains allowed. Public pages MAY continue to document-scroll; this requirement applies to Studio only.

#### Scenario: Open Website Home on phone
- **WHEN** the photographer opens Website → Home on a phone-width viewport
- **THEN** they see a compact checklist and primary edit actions without an endless page of inline editors

#### Scenario: Scroll the Gallery wall
- **WHEN** the photographer scrolls the Gallery photo wall
- **THEN** Studio hub navigation stays put, and Gallery title, Add photos, rooms, and filters stay put while the thumbnails move

#### Scenario: Sidebar never scrolls
- **WHEN** the photographer scrolls hub content, or wheels while the pointer is over the side hub list
- **THEN** the sidebar does not move and does not show its own scrollbar; only a work surface inside the main pane may scroll

#### Scenario: Scroll gutter on padded hubs
- **WHEN** the photographer opens a hub whose content is narrower than the pane (such as Settings)
- **THEN** the scrollbar sits on the edge of the Studio main pane, not beside the padded content column
