## ADDED Requirements

### Requirement: Assistant may write Website allowlist
The authenticated Assistant write path SHALL be allowed to create or update the same Website fields the Website hub already mutates for globals, FAQ, testimonials, SEO, contact and booking copy, and services/package text. Safe text edits MAY auto-apply; consequential publishing or deletes SHALL follow Confirm when required elsewhere. Writes SHALL re-read the live record before save. Unpublished testimonials SHALL remain Studio-only until published through the same rules as the hub. Successful writes SHALL report the field and new value in the Assistant thread.

#### Scenario: FAQ update from chat
- **WHEN** the photographer asks Assistant to change an FAQ answer
- **THEN** the FAQ record updates through the Assistant write path, the thread quotes the new Q/A, and the public FAQ reflects it when that item is published

#### Scenario: Globals social from chat
- **WHEN** the photographer asks Assistant to change a Website globals social field
- **THEN** the globals record persists the new value the same as saving from Website Site chrome and the thread names the field and value
