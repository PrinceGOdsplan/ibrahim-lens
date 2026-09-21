## MODIFIED Requirements

### Requirement: Quieter Studio inputs
Studio form controls on Website, Library, Bookings, Clients, Settings, and login SHALL share one field language: underline transparent text and multiline fields; quieter muted labels; a visible focus ring (not only a one-pixel border tint). Closed controls that need a box (selects, phone prefix) SHALL fill with the Studio **panel** token, not the page ground, so they remain visible on night. Studio SHALL NOT adopt public Soft night visitor form styling or Syne/Sora.

#### Scenario: Edit a text field on light
- **WHEN** the photographer focuses an input in a quiet section on the light desk
- **THEN** the control uses underline Studio chrome with a visible focus ring

#### Scenario: Edit a text field on night
- **WHEN** the photographer focuses an input while night mode is active
- **THEN** the control uses night Studio tokens with the same underline chrome and focus ring, not public Soft night form styling

#### Scenario: Notes match name fields
- **WHEN** the photographer edits booking or person notes
- **THEN** the notes field uses the same underline language as adjacent name and email fields

#### Scenario: Select lifts on night
- **WHEN** night mode is active and a Studio select is shown
- **THEN** the select fill is the panel token, distinct from the page ground
